def get_dashboard_data():
    return {
        "summary": {
            "total_files": 12847,
            "new_files_this_week": 134,

            "storage_used": "42.8 GB",
            "storage_limit": "50 GB",

            "active_shares": 284,
            "new_shares_today": 12,

            "security_events": 3,
            "critical_events": 1,
        },

        "weekly_activity": {
            "days": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            "uploads": [30, 35, 22, 41, 55, 15, 10],
            "downloads": [12, 18, 9, 24, 31, 8, 5],
        },

        "storage_by_type": [
            {"name": "Documents", "value": 38},
            {"name": "Videos", "value": 22},
            {"name": "Images", "value": 18},
            {"name": "Archives", "value": 14},
            {"name": "Other", "value": 8},
        ],

        "recent_files": [
            {
                "id": 1,
                "name": "Q3-Financial-Report.pdf",
                "size": "2.4 MB",
                "uploaded_at": "Today 10:32 AM",
            },
            {
                "id": 2,
                "name": "Product-Roadmap-2025.pptx",
                "size": "8.1 MB",
                "uploaded_at": "Today 09:15 AM",
            },
            {
                "id": 3,
                "name": "client-database-backup.zip",
                "size": "124.7 MB",
                "uploaded_at": "Yesterday 4:48 PM",
            },
            {
                "id": 4,
                "name": "design-mockups-v3.fig",
                "size": "34.2 MB",
                "uploaded_at": "Yesterday 2:10 PM",
            },
            {
                "id": 5,
                "name": "employee-contracts-2024.docx",
                "size": "1.1 MB",
                "uploaded_at": "Jul 3, 2025",
            },
        ],

        "recent_activity": [
            {
                "id": 1,
                "username": "Sarah Mitchell",
                "action": "Downloaded",
                "time": "Today 10:32 AM",
                "status": "success",
            },
            {
                "id": 2,
                "username": "James Okafor",
                "action": "Uploaded",
                "time": "Today 09:15 AM",
                "status": "success",
            },
            {
                "id": 3,
                "username": "Unknown",
                "action": "Login Failed",
                "time": "Today 08:47 AM",
                "status": "failed",
            },
            {
                "id": 4,
                "username": "Priya Nair",
                "action": "Shared Link",
                "time": "Yesterday 4:48 PM",
                "status": "warning",
            },
        ],
    }