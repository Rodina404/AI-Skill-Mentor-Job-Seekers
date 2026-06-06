"""
Groq API Integration
Provides LLM-powered features for the recommendation system
"""

import os
from typing import List, Dict, Any, Optional
from groq import Groq
import logging

logger = logging.getLogger(__name__)

class GroqService:
    """Service for interacting with Groq API"""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("GROQ_API_KEY")
        if not self.api_key:
            raise ValueError("Groq API key not provided")

        self.client = Groq(api_key=self.api_key)
        self.model = "mixtral-8x7b-32768"  # Fast and capable model

    def generate_skill_analysis(self, user_skills: List[str],
                              target_job: Dict[str, Any]) -> str:
        """Generate detailed skill gap analysis using Groq"""
        try:
            prompt = f"""
            Analyze the skill gap between a user's current skills and a target job position.

            User Skills: {', '.join(user_skills)}

            Target Job:
            - Title: {target_job.get('title', 'Unknown')}
            - Description: {target_job.get('description', 'Not provided')}
            - Requirements: {target_job.get('requirements', 'Not provided')}

            Please provide:
            1. Matching skills (what the user already has)
            2. Missing skills (what the user needs to learn)
            3. Recommended learning path with specific courses/topics
            4. Time estimate for skill acquisition
            5. Career advancement potential

            Be specific and actionable in your recommendations.
            """

            response = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=1000,
                temperature=0.7
            )

            return response.choices[0].message.content.strip()

        except Exception as e:
            logger.error(f"Error generating skill analysis: {e}")
            return "Unable to generate skill analysis at this time."

    def generate_course_explanation(self, course: Dict[str, Any],
                                  user_profile: Dict[str, Any]) -> str:
        """Generate personalized explanation for why a course is recommended"""
        try:
            prompt = f"""
            Explain why this specific course would be valuable for this user.

            Course Information:
            - Title: {course.get('title', 'Unknown')}
            - Description: {course.get('description', 'Not provided')}
            - Instructor: {course.get('instructor', 'Not provided')}
            - Level: {course.get('level', 'Not specified')}
            - Rating: {course.get('rating', 'Not rated')}

            User Profile:
            - Skills: {', '.join(user_profile.get('skills', []))}
            - Experience: {user_profile.get('experience_years', 0)} years
            - Education: {user_profile.get('education', 'Not specified')}
            - Career Goals: {user_profile.get('goals', 'Not specified')}

            Provide a personalized explanation of:
            1. How this course relates to their current skills
            2. What new skills they'll gain
            3. How it fits their career goals
            4. Expected learning outcomes

            Keep it concise but informative.
            """

            response = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=500,
                temperature=0.6
            )

            return response.choices[0].message.content.strip()

        except Exception as e:
            logger.error(f"Error generating course explanation: {e}")
            return "This course is recommended based on your profile and interests."

    def generate_career_advice(self, user_profile: Dict[str, Any],
                              recommended_jobs: List[Dict[str, Any]]) -> str:
        """Generate comprehensive career advice based on recommendations"""
        try:
            jobs_text = "\n".join([
                f"- {job.get('title', 'Unknown')} at {job.get('company', 'Unknown')}"
                for job in recommended_jobs[:5]
            ])

            prompt = f"""
            Provide personalized career advice based on this user's profile and job recommendations.

            User Profile:
            - Skills: {', '.join(user_profile.get('skills', []))}
            - Experience: {user_profile.get('experience_years', 0)} years
            - Education: {user_profile.get('education', 'Not specified')}
            - Current Role: {user_profile.get('current_role', 'Not specified')}

            Recommended Jobs:
            {jobs_text}

            Please provide:
            1. Career trajectory analysis
            2. Skill development priorities
            3. Short-term (6 months) and long-term (2 years) goals
            4. Industry trends and opportunities
            5. Salary progression expectations

            Make the advice actionable and realistic.
            """

            response = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=800,
                temperature=0.7
            )

            return response.choices[0].message.content.strip()

        except Exception as e:
            logger.error(f"Error generating career advice: {e}")
            return "Unable to generate career advice at this time."

    def enhance_job_description(self, job_data: Dict[str, Any]) -> str:
        """Enhance job description with additional insights using Groq"""
        try:
            prompt = f"""
            Enhance this job description with additional insights and context.

            Original Job Data:
            - Title: {job_data.get('title', 'Unknown')}
            - Company: {job_data.get('company', 'Unknown')}
            - Description: {job_data.get('description', 'Not provided')}
            - Requirements: {job_data.get('requirements', 'Not provided')}
            - Location: {job_data.get('location', 'Not specified')}

            Please provide:
            1. Enhanced job description with more context
            2. Key responsibilities and daily activities
            3. Required soft skills and competencies
            4. Growth opportunities and career path
            5. Company culture insights (if applicable)

            Make it more comprehensive and appealing for candidates.
            """

            response = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=600,
                temperature=0.6
            )

            return response.choices[0].message.content.strip()

        except Exception as e:
            logger.error(f"Error enhancing job description: {e}")
            return job_data.get('description', 'Description not available.')

    def generate_learning_path(self, skill_gaps: List[str],
                             time_available: str = "part-time") -> str:
        """Generate a structured learning path for skill development"""
        try:
            prompt = f"""
            Create a structured learning path to address these skill gaps.

            Skill Gaps: {', '.join(skill_gaps)}
            Time Available: {time_available}

            Please provide:
            1. Prioritized learning sequence
            2. Recommended resources (courses, books, tutorials)
            3. Weekly study plan
            4. Milestones and checkpoints
            5. Expected time to completion
            6. Tips for effective learning

            Consider the user's time constraints and make it realistic.
            """

            response = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=700,
                temperature=0.6
            )

            return response.choices[0].message.content.strip()

        except Exception as e:
            logger.error(f"Error generating learning path: {e}")
            return "Unable to generate learning path at this time."