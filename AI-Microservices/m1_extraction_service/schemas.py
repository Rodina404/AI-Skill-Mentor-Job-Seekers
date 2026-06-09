"""Pydantic schema for structured resume extraction output."""

from pydantic import BaseModel, Field
from typing import List, Optional

class EducationEntry(BaseModel):
    degree: Optional[str] = Field(description="Degree level/title e.g. BSc", default=None)
    field: Optional[str] = Field(description="Field of study e.g. Computer Science", default=None)
    institution: Optional[str] = Field(description="University or school name", default=None)
    start: Optional[str] = Field(description="Start date or year", default=None)
    end: Optional[str] = Field(description="End date or graduation year", default=None)

class ExperienceEntry(BaseModel):
    title: Optional[str] = Field(description="Job title or role", default=None)
    company: Optional[str] = Field(description="Company or organization name", default=None)
    location: Optional[str] = Field(description="Job location if mentioned", default=None)
    duration: Optional[str] = Field(description="Date range e.g. Jan 2023 - Present", default=None)
    description: Optional[str] = Field(description="Brief summary or description of the role", default=None)

class ResumeData(BaseModel):
    name: Optional[str] = Field(description="Full name of the candidate", default=None)
    email: Optional[str] = Field(description="Email address", default=None)
    phone: Optional[str] = Field(description="Phone number including country code if present", default=None)
    location: Optional[str] = Field(description="Candidate's location/city/country", default=None)
    education: List[EducationEntry] = Field(description="Structured education entries", default_factory=list)
    experience: List[ExperienceEntry] = Field(description="Structured work experience entries", default_factory=list)
    courses: List[str] = Field(description="List of courses, certifications, or workshops completed", default_factory=list)
    projects: List[str] = Field(description="List of project names only", default_factory=list)
    skills: List[str] = Field(description="All technical skills, lowercase, deduplicated", default_factory=list)
    soft_skills: List[str] = Field(description="All soft skills, lowercase, deduplicated", default_factory=list)
