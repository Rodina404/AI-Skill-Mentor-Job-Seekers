import csv
from pathlib import Path


def main() -> None:
    root_dir = Path(__file__).resolve().parent.parent
    data_dir = root_dir / "data"
    data_dir.mkdir(parents=True, exist_ok=True)

    jobs = [
        {
            "id": 1,
            "title": "Software Engineer",
            "company": "Acme Tech",
            "description": "Develop web applications and APIs using Python, FastAPI, and SQL.",
            "requirements": "Python, FastAPI, SQL, Git, REST API",
            "location": "Remote",
            "salary": "120000",
        },
        {
            "id": 2,
            "title": "Data Analyst",
            "company": "DataWorks",
            "description": "Analyze datasets and build dashboards using SQL, Python, and Tableau.",
            "requirements": "SQL, Python, Tableau, Excel",
            "location": "Remote",
            "salary": "85000",
        },
        {
            "id": 3,
            "title": "DevOps Engineer",
            "company": "CloudOps",
            "description": "Build deploy pipelines, manage containers, and automate infrastructure with Terraform.",
            "requirements": "Docker, Kubernetes, Terraform, AWS",
            "location": "Remote",
            "salary": "130000",
        },
    ]

    skills = [
        {"job_id": 1, "skill": "Python"},
        {"job_id": 1, "skill": "FastAPI"},
        {"job_id": 1, "skill": "SQL"},
        {"job_id": 2, "skill": "SQL"},
        {"job_id": 2, "skill": "Python"},
        {"job_id": 2, "skill": "Tableau"},
        {"job_id": 3, "skill": "Docker"},
        {"job_id": 3, "skill": "Kubernetes"},
        {"job_id": 3, "skill": "Terraform"},
    ]

    jobs_path = data_dir / "jobs.csv"
    skills_path = data_dir / "job_skills.csv"

    with jobs_path.open("w", newline="", encoding="utf-8") as jobs_file:
        writer = csv.DictWriter(jobs_file, fieldnames=["id", "title", "company", "description", "requirements", "location", "salary"])
        writer.writeheader()
        for job in jobs:
            writer.writerow(job)

    with skills_path.open("w", newline="", encoding="utf-8") as skills_file:
        writer = csv.DictWriter(skills_file, fieldnames=["job_id", "skill"])
        writer.writeheader()
        for skill in skills:
            writer.writerow(skill)

    print(f"Sample job data written to: {jobs_path}")
    print(f"Sample job skills written to: {skills_path}")


if __name__ == "__main__":
    main()
