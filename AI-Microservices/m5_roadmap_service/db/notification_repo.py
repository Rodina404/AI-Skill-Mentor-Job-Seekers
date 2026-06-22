from db.client import get_supabase

class NotificationRepository:
    def __init__(self):
        self.db = get_supabase()
    
    def create_notification(self, user_id: str, notif_type: str, 
                           title: str, body: str):
        """Write a notification to Supabase."""
        self.db.table("notifications").insert({
            "user_id": user_id,
            "type": notif_type,
            "title": title,
            "body": body,
            "is_read": False,
        }).execute()
    
    def get_recent_notifications(self, user_id: str, limit: int = 10) -> list:
        """Fetch recent notifications for dedup."""
        result = self.db.table("notifications") \
            .select("*") \
            .eq("user_id", user_id) \
            .order("created_at", desc=True) \
            .limit(limit) \
            .execute()
        return result.data or []
