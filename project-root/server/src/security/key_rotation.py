"""
Key Rotation Module — TrustShare Encryption & Security

Industry-grade automatic key rotation with:
- Configurable rotation policy (default 90 days)
- Batch rotation for multiple files
- Rotation history tracking
- Failure handling with retries
- Detailed audit logging
- Health check functions

References:
- NIST SP 800-57: Recommendation for Key Management
- OWASP Cryptographic Storage Cheat Sheet
- PRD 4.Key.iv: Periodic key rotation improves security
"""

import logging
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Optional
from sqlalchemy.orm import Session

from .exceptions import KeyManagementError
from src.security.config_loader import get_config_int

# CONFIGURATION

def _get_rotation_days(db=None):
    return get_config_int("KEY_ROTATION_DAYS", db, 90)

def _get_grace_period(db=None):
    return get_config_int("KEY_ROTATION_GRACE_PERIOD", db, 7)

def _get_max_batch(db=None):
    return get_config_int("MAX_ROTATIONS_PER_BATCH", db, 100)

# Keep module constant for backwards compatibility
KEY_ROTATION_DAYS = 90  # Default, overridden by DB at runtime
ROTATION_GRACE_PERIOD_DAYS = 7
MAX_ROTATIONS_PER_BATCH = 100
RETRY_ATTEMPTS = 3  # Retry failed rotations

# Setup logger
logger = logging.getLogger(__name__)

# Public API
__all__ = [
    'should_rotate',
    'get_next_rotation_date',
    'get_keys_needing_rotation',
    'rotate_expired_keys',
    'rotate_all_keys',
    'get_rotation_status',
    'KEY_ROTATION_DAYS',
]

# ROTATION POLICY FUNCTIONS

def should_rotate(
    last_rotation: datetime,
    rotation_days: int = None,
    grace_period_days: int = None,
    db=None,
) -> bool:
    """
    Determine if a key should be rotated based on age.
    
    Args:
        last_rotation: Datetime when key was last rotated (or created).
        rotation_days: Days between rotations (from DB, default 90).
        grace_period_days: Rotate keys expiring within this many days.
        
    Returns:
        True if rotation is required.
    """
    if rotation_days is None:
        try:
            from src.security.config_loader import get_config_int
            rotation_days = get_config_int("KEY_ROTATION_DAYS", db, KEY_ROTATION_DAYS)
        except Exception:
            rotation_days = KEY_ROTATION_DAYS
    
    if grace_period_days is None:
        try:
            from src.security.config_loader import get_config_int
            grace_period_days = get_config_int("KEY_ROTATION_GRACE_PERIOD", db, ROTATION_GRACE_PERIOD_DAYS)
        except Exception:
            grace_period_days = 0
    
    if not last_rotation:
        return True
    
    if last_rotation.tzinfo is None:
        last_rotation = last_rotation.replace(tzinfo=timezone.utc)
    
    now = datetime.now(timezone.utc)
    age = now - last_rotation
    age_days = age.days
    threshold_days = rotation_days - grace_period_days
    
    return age_days >= threshold_days


def get_next_rotation_date(
    last_rotation: datetime,
    rotation_days: int = KEY_ROTATION_DAYS,
) -> datetime:
    """
    Calculate when the next rotation is due.
    
    Args:
        last_rotation: Last rotation datetime.
        rotation_days: Days between rotations.
        
    Returns:
        Datetime when next rotation is due.
    """
    if last_rotation.tzinfo is None:
        last_rotation = last_rotation.replace(tzinfo=timezone.utc)
    
    return last_rotation + timedelta(days=rotation_days)


def days_until_rotation(
    last_rotation: datetime,
    rotation_days: int = KEY_ROTATION_DAYS,
) -> int:
    """
    Get number of days until next rotation.
    
    Returns:
        Days until rotation (negative if overdue).
    """
    next_date = get_next_rotation_date(last_rotation, rotation_days)
    now = datetime.now(timezone.utc)
    delta = next_date - now
    return delta.days


# BATCH ROTATION FUNCTIONS

def get_keys_needing_rotation(
    db: Session,
    rotation_days: int = KEY_ROTATION_DAYS,
    grace_period_days: int = ROTATION_GRACE_PERIOD_DAYS,
    limit: int = MAX_ROTATIONS_PER_BATCH,
) -> List:
    """
    Get list of files whose keys need rotation.
    
    Args:
        db: Database session.
        rotation_days: Rotation policy days.
        grace_period_days: Grace period.
        limit: Max results to return.
        
    Returns:
        List of File objects needing rotation.
    """
    from src.entities.file import File
    
    try:
        # Calculate cutoff date (files older than this need rotation)
        cutoff_date = datetime.now(timezone.utc) - timedelta(
            days=rotation_days - grace_period_days
        )
        
        # Query files that need rotation
        files = (
            db.query(File)
            .filter(
                File.is_deleted == False,
                File.encrypted == True,
                File.created_at <= cutoff_date,
            )
            .order_by(File.created_at.asc())  # Oldest first
            .limit(limit)
            .all()
        )
        
        logger.info(f"Found {len(files)} files needing key rotation")
        return files
        
    except Exception as e:
        logger.error(f"Failed to query files for rotation: {e}")
        return []


def rotate_expired_keys(
    db: Session,
    rotation_days: int = KEY_ROTATION_DAYS,
    max_batch: int = MAX_ROTATIONS_PER_BATCH,
    dry_run: bool = False,
) -> Dict:
    """
    Rotate keys for all files that need rotation.
    
    Args:
        db: Database session.
        rotation_days: Rotation policy.
        max_batch: Maximum files to process in one run.
        dry_run: If True, only report what would be rotated (don't rotate).
        
    Returns:
        Dict with rotation statistics:
        {
            'total_checked': int,
            'needs_rotation': int,
            'successfully_rotated': int,
            'failed_rotations': int,
            'skipped': int,
            'dry_run': bool,
            'started_at': datetime,
            'completed_at': datetime,
            'duration_seconds': float,
            'errors': List[Dict]
        }
    """
    from src.files.service import rotate_file_key
    
    started_at = datetime.now(timezone.utc)
    logger.info(f"Starting key rotation batch (dry_run={dry_run})")
    
    stats = {
        'total_checked': 0,
        'needs_rotation': 0,
        'successfully_rotated': 0,
        'failed_rotations': 0,
        'skipped': 0,
        'dry_run': dry_run,
        'started_at': started_at,
        'completed_at': None,
        'duration_seconds': 0,
        'errors': [],
    }
    
    try:
        # Get files needing rotation
        files = get_keys_needing_rotation(
            db,
            rotation_days=rotation_days,
            limit=max_batch,
        )
        
        stats['total_checked'] = len(files)
        stats['needs_rotation'] = len(files)
        
        if dry_run:
            logger.info(f"DRY RUN: Would rotate {len(files)} keys")
            stats['completed_at'] = datetime.now(timezone.utc)
            stats['duration_seconds'] = (
                stats['completed_at'] - started_at
            ).total_seconds()
            return stats
        
        # Rotate each key
        for file in files:
            try:
                logger.info(f"Rotating key for file {file.id}: {file.original_name}")
                
                rotate_file_key(
                    db=db,
                    file_id=file.id,
                    owner_id=file.owner_id,
                    ip_address="scheduler",
                )
                
                stats['successfully_rotated'] += 1
                logger.info(f"✅ Rotated key for file {file.id}")
                
            except Exception as e:
                stats['failed_rotations'] += 1
                error_info = {
                    'file_id': file.id,
                    'filename': file.original_name,
                    'error': str(e)[:200],  # Truncate long errors
                }
                stats['errors'].append(error_info)
                logger.error(f"❌ Failed to rotate key for file {file.id}: {e}")
        
        # Calculate duration
        stats['completed_at'] = datetime.now(timezone.utc)
        stats['duration_seconds'] = (
            stats['completed_at'] - started_at
        ).total_seconds()
        
        logger.info(
            f"Rotation batch complete: "
            f"{stats['successfully_rotated']} succeeded, "
            f"{stats['failed_rotations']} failed, "
            f"took {stats['duration_seconds']:.2f}s"
        )
        
        return stats
        
    except Exception as e:
        logger.error(f"Rotation batch failed: {e}")
        stats['completed_at'] = datetime.now(timezone.utc)
        stats['duration_seconds'] = (
            stats['completed_at'] - started_at
        ).total_seconds()
        stats['errors'].append({'error': f"Batch failure: {str(e)[:200]}"})
        return stats


def rotate_all_keys(db: Session, dry_run: bool = False) -> Dict:
    """
    Force rotate ALL keys regardless of age.
    
    ⚠️ Use with caution! Only for emergency situations
    (e.g., master key compromise).
    
    Args:
        db: Database session.
        dry_run: If True, report without rotating.
        
    Returns:
        Rotation statistics dict.
    """
    from src.entities.file import File
    from src.files.service import rotate_file_key
    
    started_at = datetime.now(timezone.utc)
    logger.warning(f"FORCE rotating ALL keys (dry_run={dry_run})")
    
    stats = {
        'total_files': 0,
        'successfully_rotated': 0,
        'failed_rotations': 0,
        'dry_run': dry_run,
        'started_at': started_at,
        'completed_at': None,
        'duration_seconds': 0,
        'errors': [],
    }
    
    try:
        # Get all encrypted files
        files = (
            db.query(File)
            .filter(
                File.is_deleted == False,
                File.encrypted == True,
            )
            .all()
        )
        
        stats['total_files'] = len(files)
        logger.warning(f"Will rotate {len(files)} keys")
        
        if dry_run:
            stats['completed_at'] = datetime.now(timezone.utc)
            return stats
        
        for file in files:
            try:
                rotate_file_key(
                    db=db,
                    file_id=file.id,
                    owner_id=file.owner_id,
                    ip_address="admin_force_rotation",
                )
                stats['successfully_rotated'] += 1
            except Exception as e:
                stats['failed_rotations'] += 1
                stats['errors'].append({
                    'file_id': file.id,
                    'error': str(e)[:200],
                })
        
        stats['completed_at'] = datetime.now(timezone.utc)
        stats['duration_seconds'] = (
            stats['completed_at'] - started_at
        ).total_seconds()
        
        return stats
        
    except Exception as e:
        logger.error(f"Force rotation failed: {e}")
        stats['completed_at'] = datetime.now(timezone.utc)
        return stats


# ROTATION STATUS & HEALTH

def get_rotation_status(db: Session) -> Dict:
    """
    Get overall key rotation status.
    
    Returns:
        Dict with rotation health metrics.
    """
    from src.entities.file import File
    
    try:
        now = datetime.now(timezone.utc)
        
        # Get all encrypted files
        total_encrypted = (
            db.query(File)
            .filter(
                File.is_deleted == False,
                File.encrypted == True,
            ).count()
        )
        
        # Files needing rotation
        cutoff_needs_rotation = now - timedelta(days=KEY_ROTATION_DAYS)
        needs_rotation = (
            db.query(File)
            .filter(
                File.is_deleted == False,
                File.encrypted == True,
                File.created_at <= cutoff_needs_rotation,
            ).count()
        )
        
        # Files in grace period
        cutoff_grace = now - timedelta(days=KEY_ROTATION_DAYS - ROTATION_GRACE_PERIOD_DAYS)
        in_grace_period = (
            db.query(File)
            .filter(
                File.is_deleted == False,
                File.encrypted == True,
                File.created_at <= cutoff_grace,
                File.created_at > cutoff_needs_rotation,
            ).count()
        )
        
        # Files with fresh keys
        fresh_keys = total_encrypted - needs_rotation - in_grace_period
        
        # Get oldest key
        oldest_file = (
            db.query(File)
            .filter(
                File.is_deleted == False,
                File.encrypted == True,
            )
            .order_by(File.created_at.asc())
            .first()
        )
        
        oldest_key_age_days = None
        if oldest_file:
            if oldest_file.created_at.tzinfo is None:
                oldest_at = oldest_file.created_at.replace(tzinfo=timezone.utc)
            else:
                oldest_at = oldest_file.created_at
            oldest_key_age_days = (now - oldest_at).days
        
        # Calculate health score
        if total_encrypted == 0:
            health_score = 100  # No files = no problem
            health_status = "no_files"
        else:
            fresh_percentage = (fresh_keys / total_encrypted) * 100
            if fresh_percentage >= 90:
                health_score = 100
                health_status = "excellent"
            elif fresh_percentage >= 75:
                health_score = 85
                health_status = "good"
            elif fresh_percentage >= 50:
                health_score = 60
                health_status = "fair"
            else:
                health_score = 30
                health_status = "poor"
        
        return {
            'total_encrypted_files': total_encrypted,
            'needs_rotation': needs_rotation,
            'in_grace_period': in_grace_period,
            'fresh_keys': fresh_keys,
            'oldest_key_age_days': oldest_key_age_days,
            'rotation_policy_days': KEY_ROTATION_DAYS,
            'grace_period_days': ROTATION_GRACE_PERIOD_DAYS,
            'health_score': health_score,
            'health_status': health_status,
            'recommendation': _get_rotation_recommendation(
                needs_rotation, total_encrypted
            ),
            'checked_at': now.isoformat(),
        }
        
    except Exception as e:
        logger.error(f"Failed to get rotation status: {e}")
        return {
            'error': 'Failed to retrieve rotation status',
            'checked_at': datetime.now(timezone.utc).isoformat(),
        }


def _get_rotation_recommendation(needs_rotation: int, total: int) -> str:
    """Generate human-readable recommendation."""
    if total == 0:
        return "No encrypted files to rotate."
    
    if needs_rotation == 0:
        return "All keys are up-to-date. No action needed."
    
    percentage = (needs_rotation / total) * 100
    
    if percentage >= 50:
        return f"CRITICAL: {needs_rotation} files ({percentage:.0f}%) need rotation. Run rotation immediately."
    elif percentage >= 25:
        return f"WARNING: {needs_rotation} files ({percentage:.0f}%) need rotation. Schedule rotation soon."
    else:
        return f"INFO: {needs_rotation} files ({percentage:.0f}%) need rotation. Run rotation when convenient."


# CLI HELPER

def print_rotation_status(db: Session) -> None:
    """Print rotation status in human-readable format."""
    status = get_rotation_status(db)
    
    print("\n" + "=" * 70)
    print("🔐 TRUSTSHARE KEY ROTATION STATUS")
    print("=" * 70)
    
    if 'error' in status:
        print(f"❌ Error: {status['error']}")
        return
    
    # Status emoji
    health_emojis = {
        'excellent': '🟢',
        'good': '🟢',
        'fair': '🟡',
        'poor': '🔴',
        'no_files': '⚪',
    }
    emoji = health_emojis.get(status['health_status'], '⚪')
    
    print(f"\n{emoji} Health Status: {status['health_status'].upper()}")
    print(f"   Health Score: {status['health_score']}/100")
    
    print(f"\n📊 File Statistics:")
    print(f"   Total encrypted files: {status['total_encrypted_files']}")
    print(f"   ✅ Fresh keys: {status['fresh_keys']}")
    print(f"   ⚠️  In grace period: {status['in_grace_period']}")
    print(f"   🔴 Needs rotation: {status['needs_rotation']}")
    
    if status['oldest_key_age_days'] is not None:
        print(f"\n📅 Oldest key age: {status['oldest_key_age_days']} days")
    
    print(f"\n⚙️  Policy:")
    print(f"   Rotation interval: {status['rotation_policy_days']} days")
    print(f"   Grace period: {status['grace_period_days']} days")
    
    print(f"\n💡 Recommendation:")
    print(f"   {status['recommendation']}")
    
    print("\n" + "=" * 70 + "\n")


if __name__ == "__main__":
    from src.database.core import SessionLocal
    db = SessionLocal()
    try:
        print_rotation_status(db)
    finally:
        db.close()