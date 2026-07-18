def get_dashboard_data():
    return {
        "summary": {
            "total_files": 12847,
            "storage_used": "42.8 GB",
            "active_shares": 284,
            "security_events": 3,
        },
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
        ],
    }