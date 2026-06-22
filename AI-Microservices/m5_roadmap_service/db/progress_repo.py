from db.client import get_supabase

class ProgressRepository:
    def __init__(self):
        self.db = get_supabase()
    
    def get_user_learning_progress(self, profile_id: str) -> list:
        """Fetch all enrolled courses + their progress for a user."""
        # Join learning_progress with course_recommendations
        result = self.db.table("learning_progress") \
            .select("*, course_recommendations(*)") \
            .eq("job_seeker_profile_id", profile_id) \
            .execute()
        return result.data or []
    
    def get_profile_id(self, user_id: str) -> str | None:
        """Get the job_seeker_profile_id for a user."""
        # Find the job seeker profile matching the public user ID (which maps to auth user ID)
        # Wait, is job_seeker_profiles.user_id matching user_id? Yes, in public.users / profiles, they match.
        result = self.db.table("job_seeker_profiles") \
            .select("id") \
            .eq("user_id", user_id) \
            .execute()
        return result.data[0]["id"] if result.data else None
