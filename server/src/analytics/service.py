from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import datetime, timezone
from .model import File, ShareLink, SecurityEvent, FileAccessHistory, AnalyticsReport

class AnalyticsService:

    @staticmethod
    def get_summary(db: Session):
        total_bytes = db.query(func.sum(File.file_size)).filter(File.is_deleted == False).scalar() or 0
        total_gb = round(total_bytes / (1024 ** 3), 2)

        active_links = db.query(ShareLink).filter(ShareLink.is_active == True).count()
        total_downloads = db.query(FileAccessHistory).filter(FileAccessHistory.access_type == 'download').count()
        security_alerts = db.query(SecurityEvent).count()

        
        return {
            "total_storage_gb": total_gb,
            "storage_change_gb": 0.0,
            "active_links": active_links,
            "links_change_pct": 0.0,
            "total_downloads": total_downloads,
            "downloads_change": 0,
            "security_alerts": security_alerts,
            "alerts_change_pct": 0.0
        }

    @staticmethod
    def get_storage_data(db: Session):
        monthly_query = (
            db.query(
                extract('month', File.uploaded_at).label('month_num'),
                func.sum(File.file_size).label('bytes_sum')
            )
            .filter(File.is_deleted == False)
            .group_by('month_num')
            .all()
        )

        month_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        monthly_growth = []

        for row in monthly_query:
            if row.month_num:
                m_index = int(row.month_num) - 1
                gb_size = round((row.bytes_sum or 0) / (1024 ** 3), 2)
                monthly_growth.append({"month": month_names[m_index], "storage": gb_size})

       

        return {
            "monthly_growth": monthly_growth,
            "department_breakdown": [] 
        }

    @staticmethod
    def get_reports(db: Session):
        return db.query(AnalyticsReport).order_by(AnalyticsReport.created_at.desc()).all()

    @staticmethod
    def create_report(db: Session, report_type: str):
        new_report = AnalyticsReport(
            report_type=report_type,
            report_date=datetime.now(timezone.utc).date()
        )
        db.add(new_report)
        db.commit()
        db.refresh(new_report)
        return new_report        