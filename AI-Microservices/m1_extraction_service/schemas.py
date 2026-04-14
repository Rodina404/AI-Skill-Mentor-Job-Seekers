"""Pydantic schema for structured resume extraction output."""

from pydantic import BaseModel, Field
from typing import List, Optional

class EducationEntry(BaseModel):
    degree: str = Field(description="Degree title e.g. BSc Computer Science")
    institution: str = Field(description="University or school name")
    year: Optional[str] = Field(description="Graduation year or date range")
    gpa: Optional[str] = Field(description="GPA if mentioned")

class ExperienceEntry(BaseModel):
    title: str = Field(description="Job title or role")
    company: str = Field(description="Company or organization name")
    duration: Optional[str] = Field(description="Date range e.g. Jun 2022 – Aug 2023")
    bullets: List[str] = Field(description="Achievement bullet points")

class ProjectEntry(BaseModel):
    name: str
    description: str
    tech_stack: List[str]

class ResumeData(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    skills: List[str] = Field(description="All technical skills, lowercase, deduplicated")
    education: List[EducationEntry]
    experience: List[ExperienceEntry]
    projects: List[ProjectEntry]
    courses_and_certifications: List[str]
    languages: List[str] = Field(description="Spoken languages if mentioned")
    summary: Optional[str] = Field(description="Objective or summary section")
