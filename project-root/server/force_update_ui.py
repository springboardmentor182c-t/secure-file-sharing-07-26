import json
from src.database.core import SessionLocal
from src.analytics.models.analytics_config import AnalyticsConfig
from src.analytics.constants import AnalyticsConfigKey

UI_DATA = {
    "tabs": [
        {"value": "analytics", "label": "File Analytics"},
        {"value": "security", "label": "Security"},
    ],
    "date_ranges": [
        {"value": "7days", "label": "Last 7 days"},
        {"value": "30days", "label": "Last 30 days"},
        {"value": "90days", "label": "Last 90 days"},
    ],
    "file_kpis": [
        {"key": "storage", "label": "Storage Used", "sub_key": "storage_subtitle", "icon": "HardDrive", "color_var": "--an-kpi-blue", "bg_var": "--an-kpi-blue-bg", "suffix": " GB", "decimals": 1},
        {"key": "uploads", "label": "Files Uploaded", "sub_key": "uploads_subtitle", "icon": "Upload", "color_var": "--an-kpi-indigo", "bg_var": "--an-kpi-indigo-bg", "suffix": "", "decimals": 0},
        {"key": "downloads", "label": "Downloads", "sub_key": "downloads_subtitle", "icon": "Download", "color_var": "--an-kpi-sky", "bg_var": "--an-kpi-sky-bg", "suffix": "", "decimals": 0},
        {"key": "shares", "label": "Active Shares", "sub_key": "shares_subtitle", "icon": "Share2", "color_var": "--an-kpi-emerald", "bg_var": "--an-kpi-emerald-bg", "suffix": "", "decimals": 0},
    ],
    "security_kpis": [
        {"key": "login_events", "label": "Successful Logins", "icon": "ShieldCheck", "color_var": "--an-kpi-emerald", "bg_var": "--an-kpi-emerald-bg", "suffix": "", "decimals": 0},
        {"key": "failed_logins", "label": "Failed Attempts", "icon": "AlertCircle", "color_var": "--an-kpi-amber", "bg_var": "--an-kpi-amber-bg", "suffix": "", "decimals": 0},
        {"key": "blocked_attacks", "label": "Blocked Attacks", "icon": "ShieldOff", "color_var": "--an-kpi-red", "bg_var": "--an-kpi-red-bg", "suffix": "", "decimals": 0},
        {"key": "security_events", "label": "Security Events", "icon": "ShieldAlert", "color_var": "--an-kpi-blue", "bg_var": "--an-kpi-blue-bg", "suffix": "", "decimals": 0},
    ],
    "charts": {
        "storage": {"title": "Storage Usage Over Time", "meta": "Last 7 months", "data_key": "gb", "x_key": "month", "value_label": "Storage (GB)"},
        "volume": {"title": "Upload / Download Volume", "upload_label": "Uploads", "download_label": "Downloads"},
        "login": {"title": "Login Activity — Last 6 Days", "success_label": "Success", "failed_label": "Failed"},
        "department": {"title": "Sharing by Department"}
    },
    "panels": {
        "top_files": {"title": "Top Shared Files", "meta": "by opens", "opens_label": "opens", "downloads_label": "downloads", "empty": "No shared files yet."},
        "timeline": {"title": "Security Event Timeline", "empty": "No security events."},
        "unauthorized": {"title": "Unauthorized Access Attempts", "blocked_label": "blocked", "blocked_status": "Blocked", "flagged_status": "Flagged", "attempts_label": "attempts", "empty": "No unauthorized attempts recorded."}
    },
    "severity": {
        "blocked": {"label": "BLOCKED"}, "flagged": {"label": "FLAGGED"}, "warn": {"label": "WARN"}, "info": {"label": "INFO"}
    }
}

def force_update():
    db = SessionLocal()
    try:
        row = db.query(AnalyticsConfig).filter(AnalyticsConfig.key == AnalyticsConfigKey.UI_CONFIG).first()
        if row:
            row.value = json.dumps(UI_DATA)
            print("✅ Existing UI_CONFIG row updated with full data!")
        else:
            new_row = AnalyticsConfig(key=AnalyticsConfigKey.UI_CONFIG, value=json.dumps(UI_DATA))
            db.add(new_row)
            print("✅ New UI_CONFIG row created!")
        db.commit()
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    force_update()