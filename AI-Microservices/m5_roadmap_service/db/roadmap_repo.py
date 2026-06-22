from db.client import get_supabase

class RoadmapRepository:
    def __init__(self):
        self.db = get_supabase()
    
    def save_roadmap(self, user_id: str, resume_id: str, job_id: str, 
                     roadmap_data: dict, explanation: str) -> dict:
        """Insert a new roadmap into the roadmaps table."""
        # Convert user_id, resume_id, and job_id to UUID or keep as string if Supabase expects UUID.
        # Ensure we send them correctly.
        payload = {
            "user_id": user_id,
            "roadmap_data": roadmap_data,
            "explanation": explanation,
        }
        if resume_id:
            payload["resume_id"] = resume_id
        if job_id:
            payload["job_id"] = job_id
            
        result = self.db.table("roadmaps").insert(payload).execute()
        return result.data[0] if result.data else {}
    
    def get_roadmap(self, roadmap_id: str) -> dict | None:
        """Fetch a roadmap by ID."""
        result = self.db.table("roadmaps").select("*").eq("id", roadmap_id).single().execute()
        return result.data
    
    def get_user_roadmaps(self, user_id: str) -> list:
        """Fetch all roadmaps for a user."""
        result = self.db.table("roadmaps").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
        return result.data or []
    
    def update_roadmap_progress(self, roadmap_id: str, progress_data: dict):
        """Update roadmap progress tracking."""
        self.db.table("roadmaps").update({
            "roadmap_data": progress_data,
            "updated_at": "now()"
        }).eq("id", roadmap_id).execute()
