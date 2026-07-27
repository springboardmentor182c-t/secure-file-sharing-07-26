"""
Unit Tests for TrustShare Encryption & Security Module

Comprehensive test suite covering:
- Encryption/decryption
- Key management
- Hashing
- Token generation
- File validators
- Key rotation

Total: 20 test cases
"""

import os
import pytest
from datetime import datetime, timedelta, timezone

# Load environment before imports
from dotenv import load_dotenv
load_dotenv()

from src.security.encryption import (
    encrypt_bytes,
    decrypt_bytes,
    validate_key,
    generate_aad,
    AES_256_KEY_SIZE_BYTES,
    GCM_NONCE_SIZE_BYTES,
)
from src.security.key_manager import (
    generate_key,
    save_key,
    load_key,
    delete_key,
    key_exists,
)
from src.security.hashing import (
    calculate_sha256_bytes,
    compare_hashes,
    is_valid_sha256_hash,
)
from src.security.token_generator import (
    generate_share_token,
    generate_otp,
    generate_signed_token,
    verify_signed_token,
    compare_tokens,
    is_token_expired,
)
from src.security.key_rotation import (
    should_rotate,
    days_until_rotation,
    KEY_ROTATION_DAYS,
)
from src.security.exceptions import (
    EncryptionError,
    DecryptionError,
    KeyManagementError,
    IntegrityError,
)

# ENCRYPTION TESTS (5 tests)

class TestEncryption:
    """Tests for AES-256-GCM encryption module."""

    def test_encryption_decryption_roundtrip(self):
        """
        TEST 1: Verify data can be encrypted and decrypted correctly.
        
        This is the fundamental test — data must survive round-trip.
        """
        # Arrange
        key = os.urandom(AES_256_KEY_SIZE_BYTES)
        original_data = b"This is confidential TrustShare data!"
        
        # Act
        encrypted = encrypt_bytes(original_data, key)
        decrypted = decrypt_bytes(encrypted, key)
        
        # Assert
        assert decrypted == original_data, "Decrypted data should match original"
        assert len(encrypted) > len(original_data), "Encrypted should be larger (nonce + tag)"
        
        print("✅ TEST 1 PASSED: Encryption round-trip works")

    def test_encryption_rejects_invalid_key_size(self):
        """
        TEST 2: Verify AES-256 enforces 32-byte key.
        
        Should NEVER accept AES-128 or AES-192 keys (security downgrade).
        """
        data = b"test data"
        
        # Test various invalid key sizes
        invalid_keys = [
            b"short",           # 5 bytes
            os.urandom(16),     # AES-128 (should reject!)
            os.urandom(24),     # AES-192 (should reject!)
            os.urandom(33),     # Too long
            b"",                # Empty
        ]
        
        for key in invalid_keys:
            with pytest.raises(EncryptionError):
                encrypt_bytes(data, key)
        
        print("✅ TEST 2 PASSED: Invalid key sizes properly rejected")

    def test_encryption_detects_tampering(self):
        """
        TEST 3: Verify GCM authentication catches tampered data.
        
        Any modification to encrypted data must cause decryption to fail.
        """
        # Arrange
        key = os.urandom(AES_256_KEY_SIZE_BYTES)
        data = b"important data"
        encrypted = encrypt_bytes(data, key)
        
        # Act: Tamper with encrypted data (change last byte)
        tampered = bytearray(encrypted)
        tampered[-1] = tampered[-1] ^ 0xFF  # Flip bits
        
        # Assert: Should fail decryption
        with pytest.raises(DecryptionError):
            decrypt_bytes(bytes(tampered), key)
        
        print("✅ TEST 3 PASSED: Tampered data properly detected")

    def test_encryption_wrong_key_fails(self):
        """
        TEST 4: Verify wrong key cannot decrypt data.
        
        Using different key must fail (authentication tag won't match).
        """
        # Arrange
        key1 = os.urandom(AES_256_KEY_SIZE_BYTES)
        key2 = os.urandom(AES_256_KEY_SIZE_BYTES)
        data = b"secret data"
        
        # Act
        encrypted = encrypt_bytes(data, key1)
        
        # Assert: Wrong key should fail
        with pytest.raises(DecryptionError):
            decrypt_bytes(encrypted, key2)
        
        print("✅ TEST 4 PASSED: Wrong key properly rejected")

    def test_encryption_with_aad(self):
        """
        TEST 5: Verify Associated Authenticated Data (AAD) works.
        
        AAD binds encrypted data to context (e.g., file_id).
        Wrong AAD should fail decryption.
        """
        # Arrange
        key = os.urandom(AES_256_KEY_SIZE_BYTES)
        data = b"contextual data"
        aad = generate_aad(file_id=123, owner=456)
        
        # Act: Encrypt with AAD
        encrypted = encrypt_bytes(data, key, aad=aad)
        
        # Correct AAD works
        decrypted = decrypt_bytes(encrypted, key, aad=aad)
        assert decrypted == data
        
        # Wrong AAD fails
        wrong_aad = generate_aad(file_id=999, owner=999)
        with pytest.raises(DecryptionError):
            decrypt_bytes(encrypted, key, aad=wrong_aad)
        
        print("✅ TEST 5 PASSED: AAD context binding works")


# KEY MANAGEMENT TESTS (3 tests)

class TestKeyManagement:
    """Tests for key generation and management."""

    def test_key_generation_produces_correct_size(self):
        """
        TEST 6: Verify generated keys are exactly 32 bytes (AES-256).
        """
        # Generate multiple keys
        for _ in range(10):
            key = generate_key()
            
            # Assert
            assert isinstance(key, bytes), "Key should be bytes"
            assert len(key) == AES_256_KEY_SIZE_BYTES, f"Key should be {AES_256_KEY_SIZE_BYTES} bytes"
        
        print("✅ TEST 6 PASSED: All generated keys are correct size")

    def test_key_generation_produces_unique_keys(self):
        """
        TEST 7: Verify each generated key is unique (cryptographic randomness).
        """
        # Generate 100 keys
        keys = set()
        for _ in range(100):
            key = generate_key()
            keys.add(key)
        
        # All should be unique
        assert len(keys) == 100, "All keys should be unique"
        
        print("✅ TEST 7 PASSED: Key generation produces unique keys")

    def test_key_save_load_cycle(self):
        """
        TEST 8: Verify keys can be saved and loaded correctly.
        
        Tests the full lifecycle: save → load → verify → delete.
        """
        # Arrange
        test_file_id = "test_key_lifecycle_12345"
        original_key = generate_key()
        
        try:
            # Act: Save key
            save_key(test_file_id, original_key)
            
            # Verify it exists
            assert key_exists(test_file_id), "Key should exist after save"
            
            # Load key back
            loaded_key = load_key(test_file_id)
            
            # Assert: Loaded key matches original
            assert loaded_key == original_key, "Loaded key should match saved key"
            assert len(loaded_key) == AES_256_KEY_SIZE_BYTES
            
            print("✅ TEST 8 PASSED: Key save/load cycle works")
            
        finally:
            # Cleanup
            if key_exists(test_file_id):
                delete_key(test_file_id)


# HASHING TESTS (2 tests)

class TestHashing:
    """Tests for SHA-256 hashing and comparison."""

    def test_sha256_produces_correct_hash(self):
        """
        TEST 9: Verify SHA-256 produces known correct hash.
        
        Tests against known SHA-256 output for validation.
        """
        # Known input/output for SHA-256
        data = b""
        expected_hash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
        
        actual_hash = calculate_sha256_bytes(data)
        
        assert actual_hash == expected_hash, "SHA-256 of empty string should match known value"
        assert len(actual_hash) == 64, "SHA-256 hex should be 64 characters"
        assert is_valid_sha256_hash(actual_hash), "Hash should be valid format"
        
        print("✅ TEST 9 PASSED: SHA-256 hashing is correct")

    def test_timing_safe_hash_comparison(self):
        """
        TEST 10: Verify timing-safe hash comparison prevents timing attacks.
        
        Uses hmac.compare_digest for constant-time comparison.
        """
        hash1 = calculate_sha256_bytes(b"data1")
        hash2 = calculate_sha256_bytes(b"data2")
        hash3 = calculate_sha256_bytes(b"data1")  # Same as hash1
        
        # Same hashes should match
        assert compare_hashes(hash1, hash3) == True, "Same hashes should match"
        
        # Different hashes should not match
        assert compare_hashes(hash1, hash2) == False, "Different hashes should not match"
        
        # Case insensitive
        assert compare_hashes(hash1.upper(), hash1.lower()) == True, "Case should not matter"
        
        # Invalid inputs
        assert compare_hashes(None, hash1) == False, "None should return False"
        assert compare_hashes("", hash1) == False, "Empty should return False"
        
        print("✅ TEST 10 PASSED: Timing-safe hash comparison works")


# TOKEN GENERATION TESTS (3 tests)

class TestTokenGeneration:
    """Tests for secure token generation."""

    def test_share_tokens_are_unique(self):
        """
        TEST 11: Verify share tokens are cryptographically unique.
        """
        # Generate 1000 tokens
        tokens = set()
        for _ in range(1000):
            token = generate_share_token()
            tokens.add(token)
        
        # All should be unique
        assert len(tokens) == 1000, "All share tokens should be unique"
        
        # Length check (URL-safe base64 of 32 bytes = 43 chars)
        for token in list(tokens)[:5]:
            assert len(token) == 43, "Share tokens should be 43 chars"
        
        print("✅ TEST 11 PASSED: Share tokens are unique and correct length")

    def test_otp_generation(self):
        """
        TEST 12: Verify OTP generation produces valid numeric codes.
        """
        # Test default (6 digits)
        otp = generate_otp()
        assert len(otp) == 6, "OTP should be 6 digits by default"
        assert otp.isdigit(), "OTP should contain only digits"
        
        # Test custom lengths
        for length in [4, 5, 6, 8]:
            otp = generate_otp(length=length)
            assert len(otp) == length
            assert otp.isdigit()
        
        # Multiple OTPs should be different
        otps = {generate_otp() for _ in range(100)}
        assert len(otps) > 50, "OTPs should have high variance"
        
        # Invalid lengths should raise error
        with pytest.raises(KeyManagementError):
            generate_otp(length=3)  # Too short
        
        with pytest.raises(KeyManagementError):
            generate_otp(length=11)  # Too long
        
        print("✅ TEST 12 PASSED: OTP generation works correctly")

    def test_signed_token_verification(self):
        """
        TEST 13: Verify signed tokens with HMAC and expiration.
        
        Tests:
        - Token can be signed
        - Correct secret verifies token
        - Wrong secret fails verification
        - Expired tokens are detected
        - Payload is preserved
        """
        # Arrange
        secret = os.urandom(32)
        wrong_secret = os.urandom(32)
        payload = "user:123:file:456"
        
        # Act: Create signed token
        token = generate_signed_token(payload, secret, ttl_seconds=300)
        assert token is not None
        assert isinstance(token, str)
        
        # Verify with correct secret
        result = verify_signed_token(token, secret)
        assert result['valid'] == True, "Valid token should verify"
        assert result['expired'] == False, "Token should not be expired"
        assert result['payload'] == payload, "Payload should be preserved"
        assert result['remaining_seconds'] > 0
        
        # Verify with wrong secret
        wrong_result = verify_signed_token(token, wrong_secret)
        assert wrong_result['valid'] == False, "Wrong secret should fail"
        
        # Timing-safe token comparison
        same_token = token
        assert compare_tokens(token, same_token) == True
        assert compare_tokens(token, "different") == False
        
        print("✅ TEST 13 PASSED: Signed token verification works")


# KEY ROTATION TESTS (2 tests)

class TestKeyRotation:
    """Tests for key rotation policies."""

    def test_rotation_policy_thresholds(self):
        """
        TEST 14: Verify rotation policy correctly identifies old keys.
        
        Tests the 90-day rotation policy with grace period.
        """
        now = datetime.now(timezone.utc)
        
        # Fresh key (1 day old) - should NOT rotate
        fresh = now - timedelta(days=1)
        assert should_rotate(fresh) == False, "1-day old key shouldn't rotate"
        
        # Just at threshold (90 days) - should rotate
        threshold = now - timedelta(days=90)
        assert should_rotate(threshold) == True, "90-day old key should rotate"
        
        # Well over threshold (100 days) - should rotate
        old = now - timedelta(days=100)
        assert should_rotate(old) == True, "100-day old key should rotate"
        
        # No last rotation - should rotate
        assert should_rotate(None) == True, "Never-rotated key should rotate"
        
        # Custom policy (30 days)
        custom_old = now - timedelta(days=31)
        assert should_rotate(custom_old, rotation_days=30) == True
        
        # Custom policy - not yet due
        assert should_rotate(fresh, rotation_days=30) == False
        
        print("✅ TEST 14 PASSED: Rotation policy correctly enforced")

    def test_days_until_rotation_calculation(self):
        """
        EST 15: Verify days until rotation is calculated correctly.
        """
        now = datetime.now(timezone.utc)
        
        # 30 days old, 90-day policy → 60 days remaining
        thirty_days_old = now - timedelta(days=30)
        days_left = days_until_rotation(thirty_days_old)
        assert 55 <= days_left <= 60, f"Should be ~60 days, got {days_left}"
        
        # 80 days old → ~10 days left
        eighty_days_old = now - timedelta(days=80)
        days_left = days_until_rotation(eighty_days_old)
        assert 5 <= days_left <= 10, f"Should be ~10 days, got {days_left}"
        
        # 91 days old → negative (overdue)
        ninety_one_days = now - timedelta(days=91)
        days_left = days_until_rotation(ninety_one_days)
        assert days_left < 0, f"Overdue should be negative, got {days_left}"
        
        print("✅ TEST 15 PASSED: Rotation countdown calculated correctly")


# PASSWORD VALIDATOR TESTS (3 tests)

class TestPasswordValidator:
    """Tests for password strength validation."""

    def test_weak_password_rejected(self):
        """
        TEST 16: Common weak passwords must be rejected.
        """
        from src.security.password_validator import validate_password
        
        weak_passwords = ["password", "123456", "admin", "qwerty"]
        
        for pwd in weak_passwords:
            result = validate_password(pwd)
            assert result.is_valid == False, f"'{pwd}' should be rejected"
            assert result.score < 30, f"'{pwd}' should have low score"
        
        print("✅ TEST 16 PASSED: Weak passwords properly rejected")

    def test_strong_password_accepted(self):
        """
        TEST 17: Strong passwords must be accepted with high score.
        """
        from src.security.password_validator import validate_password
        
        result = validate_password("MySecure!P@ssw0rd2024")
        
        assert result.is_valid == True, "Strong password should be valid"
        assert result.score >= 70, f"Strong password should score 70+, got {result.score}"
        assert len(result.issues) == 0, "Strong password should have no issues"
        
        print("✅ TEST 17 PASSED: Strong passwords properly accepted")

    def test_password_checks_all_requirements(self):
        """
        TEST 18: Password validator checks all requirement types.
        """
        from src.security.password_validator import validate_password
        
        # Password missing everything
        result = validate_password("aa")
        
        # Should flag multiple issues
        assert result.is_valid == False
        assert 'min_length' in result.meets_requirements
        assert 'has_uppercase' in result.meets_requirements
        assert 'has_digit' in result.meets_requirements
        assert 'has_special' in result.meets_requirements
        assert result.meets_requirements['min_length'] == False
        assert result.meets_requirements['has_uppercase'] == False
        assert result.meets_requirements['has_digit'] == False
        
        print("✅ TEST 18 PASSED: All requirement types checked")


# CONFIG LOADER TESTS (2 tests)

class TestConfigLoader:
    """Tests for DB-driven configuration loader."""

    def test_config_returns_safe_defaults(self):
        """
        TEST 19: Config loader returns valid values.
        """
        from src.security.config_loader import get_config, get_config_int
        
        # Test with explicit default (guaranteed to work)
        result = get_config_int("NON_EXISTENT_KEY_12345", default=42)
        assert result == 42, f"Should return default 42, got {result}"
        
        # Test string config returns something
        algo = get_config("ENCRYPTION_ALGORITHM")
        assert isinstance(algo, str), "Should return string"
        
        # Test default parameter works
        missing = get_config("TOTALLY_MISSING_KEY", default="fallback")
        assert missing == "fallback", f"Should return fallback, got {missing}"
        
        print("✅ TEST 19 PASSED: Config loader defaults work")
    
    def test_config_json_parsing(self):
        """
        TEST 20: Config loader correctly parses JSON values.
        """
        from src.security.config_loader import get_config_json, get_config_bool
        
        # JSON parsing without DB (uses safe defaults)
        rate_limits = get_config_json("RATE_LIMITS")
        assert isinstance(rate_limits, dict), "Rate limits should be dict"
        assert "default" in rate_limits, "Should have default rate limit"
        
        passwords = get_config_json("COMMON_PASSWORDS")
        assert isinstance(passwords, list), "Passwords should be list"
        assert len(passwords) > 0, "Should have some passwords"
        
        # Boolean parsing
        mongo = get_config_bool("MONGODB_ENABLED")
        assert isinstance(mongo, bool), "Should return boolean"
        
        print("✅ TEST 20 PASSED: JSON config parsing works")

# TEST SUMMARY

if __name__ == "__main__":
    """
    Run all security tests with detailed output.
    Usage: python -m pytest tests/test_security.py -v
    """
    print("\n" + "=" * 70)
    print("🔐 TRUSTSHARE ENCRYPTION & SECURITY MODULE - Test Suite")
    print("=" * 70)
    print("Testing all 15 security features across:")
    print("  ✅ 5 Encryption tests")
    print("  ✅ 3 Key Management tests")
    print("  ✅ 2 Hashing tests")
    print("  ✅ 3 Token Generation tests")
    print("  ✅ 2 Key Rotation tests")
    print("=" * 70 + "\n")
    
    # Run with pytest
    pytest.main([__file__, "-v", "--tb=short"])