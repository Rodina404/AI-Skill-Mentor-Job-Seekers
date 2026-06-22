from db.client import get_supabase

class SkillRepository:
    def __init__(self):
        self.db = get_supabase()
    
    def get_user_skill_gaps(self, profile_id: str) -> list:
        """Fetch missing skills for a user."""
        # Join skill_gaps with skills
        result = self.db.table("skill_gaps") \
            .select("*, skills(name, category)") \
            .eq("job_seeker_profile_id", profile_id) \
            .execute()
        return result.data or []
    
    def get_course_recommendations(self, gap_ids: list) -> list:
        """Fetch course recommendations for given skill gaps."""
        result = self.db.table("course_recommendations") \
            .select("*") \
            .in_("skill_gap_id", gap_ids) \
            .execute()
        return result.data or []
