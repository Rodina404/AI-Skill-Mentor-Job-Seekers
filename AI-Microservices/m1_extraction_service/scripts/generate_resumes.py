"""
scripts/generate_resumes.py

Generates 20 realistic resume text files (.txt) and PDFs (.pdf) saved to data/resumes/.
Resumes span 5 professional domains with realistic names, universities, companies, and skills.
Deterministic output when seeded with random.seed(42).
"""

import random
import os
import sys
from pathlib import Path

random.seed(42)

# ---------------------------------------------------------------------------
# Path setup (all relative to project root = parent of this script's dir)
# ---------------------------------------------------------------------------
SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent
OUTPUT_DIR = PROJECT_ROOT / "data" / "resumes"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# ---------------------------------------------------------------------------
# Resume template data
# ---------------------------------------------------------------------------

NAMES = [
    # Arabic
    "Ahmed Mostafa", "Layla Hassan", "Omar El-Sayed", "Nour Khalil",
    # Western
    "James Carter", "Emily Harrison", "Lucas Wagner", "Sofia Andersen",
    # South Asian
    "Rohan Sharma", "Priya Patel", "Arjun Mehta", "Ananya Iyer",
    # East Asian
    "Wei Zhang", "Yuki Tanaka", "Jian Liu", "Hana Kim",
    # More mixed
    "Carlos Mendez", "Fatima Al-Rashid", "Dmitri Volkov", "Chioma Obi",
]

UNIVERSITIES = {
    "Data Science": ["Cairo University", "University of Edinburgh", "IIT Bombay", "TU Berlin", "University of Toronto"],
    "Software Engineering": ["MIT", "Stanford University", "ETH Zurich", "University of Melbourne", "KAIST"],
    "AI": ["Carnegie Mellon University", "Oxford University", "UC Berkeley", "EPFL", "Seoul National University"],
    "DevOps": ["Georgia Tech", "TU Munich", "Politecnico di Milano", "University of Cape Town", "Delft University"],
    "Computer Engineering": ["Cairo University", "KU Leuven", "University of Waterloo", "Chalmers University", "NTNU"],
}

DOMAINS = ["Data Science", "Data Science", "Data Science", "Data Science", "Data Science",
           "Software Engineering", "Software Engineering", "Software Engineering", "Software Engineering", "Software Engineering",
           "AI", "AI", "AI", "AI",
           "DevOps", "DevOps", "DevOps",
           "Computer Engineering", "Computer Engineering", "Computer Engineering"]

SKILLS_BY_DOMAIN = {
    "Data Science": {
        "Languages": ["Python", "R", "SQL"],
        "Frameworks/Libraries": ["pandas", "scikit-learn", "NumPy", "TensorFlow", "Matplotlib", "Seaborn"],
        "Tools": ["Jupyter Notebook", "Tableau", "Power BI", "Git"],
        "Cloud/DevOps": ["AWS S3", "Google BigQuery", "Databricks"],
        "Soft Skills": ["Analytical Thinking", "Data Storytelling", "Communication"],
    },
    "Software Engineering": {
        "Languages": ["JavaScript", "TypeScript", "Python", "Java"],
        "Frameworks/Libraries": ["React", "Node.js", "Express", "Spring Boot", "Next.js"],
        "Tools": ["Git", "Docker", "PostgreSQL", "Redis", "Jest"],
        "Cloud/DevOps": ["AWS EC2", "GitHub Actions", "Nginx"],
        "Soft Skills": ["Problem Solving", "Team Collaboration", "Agile Methodologies"],
    },
    "AI": {
        "Languages": ["Python", "C++"],
        "Frameworks/Libraries": ["PyTorch", "TensorFlow", "HuggingFace Transformers", "LangChain", "ONNX"],
        "Tools": ["Jupyter Notebook", "Weights & Biases", "MLflow", "Git", "DVC"],
        "Cloud/DevOps": ["AWS SageMaker", "Google Colab Pro", "Azure ML"],
        "Soft Skills": ["Research Mindset", "Critical Thinking", "Technical Writing"],
    },
    "DevOps": {
        "Languages": ["Bash", "Python", "Go", "YAML"],
        "Frameworks/Libraries": ["Ansible", "Terraform", "Helm", "Prometheus"],
        "Tools": ["Docker", "Kubernetes", "Jenkins", "Git", "Grafana"],
        "Cloud/DevOps": ["AWS", "GCP", "Azure", "Terraform Cloud", "CI/CD Pipelines"],
        "Soft Skills": ["Systems Thinking", "Root Cause Analysis", "Documentation"],
    },
    "Computer Engineering": {
        "Languages": ["C", "C++", "Python", "VHDL", "Assembly"],
        "Frameworks/Libraries": ["ROS", "OpenCV", "FreeRTOS", "Qt"],
        "Tools": ["Vivado", "ModelSim", "GDB", "JTAG", "Git"],
        "Cloud/DevOps": ["Linux Kernel", "Embedded Linux", "CMake"],
        "Soft Skills": ["Low-Level Debugging", "Hardware/Software Co-Design", "Technical Documentation"],
    },
}

COMPANIES_BY_DOMAIN = {
    "Data Science": ["Instabug", "Synapse Analytics", "Careem", "Valeo", "IBM Analytics"],
    "Software Engineering": ["Instabug", "Amazon", "Booking.com", "Google Summer of Code", "Shopify"],
    "AI": ["DeepMind (Research Intern)", "Hugging Face", "NVIDIA AI Lab", "Microsoft Research", "OpenAI (Residency)"],
    "DevOps": ["Amazon AWS Internship", "GitLab", "Cloudflare", "Red Hat", "DigitalOcean"],
    "Computer Engineering": ["Valeo Automotive", "STMicroelectronics", "Intel (Internship)", "Siemens EDA", "Texas Instruments"],
}

DEGREES_BY_DOMAIN = {
    "Data Science": ["BSc in Statistics and Data Science", "MSc in Data Science", "BSc in Mathematics"],
    "Software Engineering": ["BSc in Computer Science", "BSc in Software Engineering", "MEng in Computer Science"],
    "AI": ["MSc in Artificial Intelligence", "BSc in Computer Science", "PhD in Machine Learning (Ongoing)"],
    "DevOps": ["BSc in Computer Engineering", "BSc in Information Technology", "BSc in Systems Engineering"],
    "Computer Engineering": ["BSc in Computer Engineering", "MEng in Embedded Systems", "BSc in Electrical and Computer Engineering"],
}

CERTIFICATIONS_BY_DOMAIN = {
    "Data Science": [
        ("IBM Data Science Professional Certificate", "Coursera", "2023"),
        ("Applied Machine Learning", "Coursera (University of Michigan)", "2022"),
        ("SQL for Data Science", "Coursera", "2021"),
        ("Statistics with R Specialization", "Coursera", "2022"),
        ("Data Visualization with Tableau", "Udemy", "2023"),
    ],
    "Software Engineering": [
        ("The Complete Web Developer Bootcamp", "Udemy", "2022"),
        ("AWS Certified Developer – Associate", "Amazon", "2023"),
        ("Meta Frontend Developer Certificate", "Coursera", "2023"),
        ("MongoDB for JavaScript Developers", "MongoDB University", "2022"),
    ],
    "AI": [
        ("Deep Learning Specialization", "deeplearning.ai/Coursera", "2023"),
        ("Natural Language Processing Specialization", "deeplearning.ai", "2023"),
        ("LLM Fine-Tuning Workshop", "Hugging Face", "2024"),
        ("Practical Deep Learning for Coders", "fast.ai", "2022"),
    ],
    "DevOps": [
        ("AWS Certified Solutions Architect – Associate", "Amazon", "2023"),
        ("Certified Kubernetes Administrator (CKA)", "CNCF", "2023"),
        ("HashiCorp Certified: Terraform Associate", "HashiCorp", "2022"),
        ("Linux Foundation System Administration", "Linux Foundation", "2021"),
    ],
    "Computer Engineering": [
        ("Embedded Systems Design", "Udemy", "2022"),
        ("FreeRTOS Real-Time Embedded Systems", "Coursera", "2023"),
        ("FPGA Programming with Vivado", "Coursera (Duke)", "2022"),
        ("ROS for Robotics", "The Construct", "2023"),
    ],
}

PROJECTS_BY_DOMAIN = {
    "Data Science": [
        ("Churn Prediction Engine", "Built a customer churn prediction model using LightGBM achieving 89% AUC.",
         "Python, pandas, LightGBM, scikit-learn", "https://github.com/sample/churn-engine"),
        ("COVID-19 Trend Dashboard", "Interactive Tableau dashboard visualizing global pandemic data trends.",
         "Python, Tableau, pandas", "https://github.com/sample/covid-dashboard"),
        ("Sentiment Analysis API", "Deployed an LSTM-based sentiment classifier as a REST API on AWS.",
         "Python, Keras, FastAPI, AWS", "https://github.com/sample/sentiment-api"),
    ],
    "Software Engineering": [
        ("Task Management App", "Full-stack task manager with real-time collaboration using WebSockets.",
         "React, Node.js, Socket.io, PostgreSQL", "https://github.com/sample/task-app"),
        ("E-Commerce REST API", "Scalable RESTful API for product catalog and order management.",
         "Express, TypeScript, PostgreSQL, Docker", "https://github.com/sample/ecom-api"),
        ("CI/CD Pipeline Automation", "Automated test-deploy pipelines using GitHub Actions.",
         "GitHub Actions, Docker, Nginx", "https://github.com/sample/ci-automation"),
    ],
    "AI": [
        ("LLM Fine-Tuning for Medical Q&A", "Fine-tuned Llama-2 on PubMed QA dataset achieving ROUGE-L of 0.71.",
         "PyTorch, HuggingFace, PEFT, LoRA", "https://github.com/sample/medical-llm"),
        ("Resume NER Extraction System", "End-to-end NER pipeline for extracting skills and experience from CVs.",
         "Python, HuggingFace Transformers, FastAPI", "https://github.com/sample/resume-ner"),
        ("Image Captioning Model", "Vision-language model generating natural language descriptions for images.",
         "PyTorch, Vision Transformer, BLIP", "https://github.com/sample/img-caption"),
    ],
    "DevOps": [
        ("Kubernetes Multi-Cluster Manager", "Deployed a multi-cluster Kubernetes setup with automated failover.",
         "Kubernetes, Helm, Terraform, AWS", "https://github.com/sample/k8s-manager"),
        ("Infrastructure as Code Template Library", "Reusable Terraform modules for common cloud infrastructure patterns.",
         "Terraform, AWS, GCP", "https://github.com/sample/iac-templates"),
        ("Log Aggregation Pipeline", "Centralized logging pipeline using the ELK stack with alerting.",
         "Elasticsearch, Logstash, Kibana, Docker", "https://github.com/sample/log-pipeline"),
    ],
    "Computer Engineering": [
        ("Autonomous Line-Following Robot", "Designed PID-controlled robot on custom PCB with ROS integration.",
         "C++, ROS, Python, Arduino", "https://github.com/sample/line-robot"),
        ("FPGA-Based Image Processor", "Hardware accelerated edge detection implemented on Xilinx FPGA.",
         "VHDL, Vivado, Python", "https://github.com/sample/fpga-img"),
        ("IoT Environmental Monitor", "Distributed sensor network for air quality monitoring with MQTT broker.",
         "C, FreeRTOS, MQTT, Python", "https://github.com/sample/iot-monitor"),
    ],
}

EXTRACURRICULARS = [
    "Vice President, IEEE Student Branch — Organized 5 technical workshops per semester.",
    "Open Source Contributor — Merged 3 PRs to scikit-learn documentation.",
    "Volunteer, UN Women Tech Bootcamp — Mentored 20 women in Python fundamentals.",
    "Teaching Assistant, Data Structures course — Held weekly office hours for 80+ students.",
    "Hackathon Winner, NASA Space Apps Challenge 2023 — First place, Climate Action track.",
    "Member, Google Developer Student Club — Hosted monthly tech talks and coding sprints.",
]

# ---------------------------------------------------------------------------
# Intentional variation flags (applied per-resume index)
# ---------------------------------------------------------------------------
TYPO_RESUME_INDEX = 6        # Resume index 6: include a typo in a skill name
MINIMAL_RESUME_INDEX = 14    # Resume index 14: very minimal content (~150 words)
LONG_SKILLS_RESUME_INDEX = 9 # Resume index 9: 30+ skills list
NONSTANDARD_RESUME_INDEX = 17 # Resume index 17: non-standard format


def generate_resume_text(idx: int, name: str, domain: str) -> str:
    """
    Generate a full resume string for the given index, name, and domain.
    Applies special variations for specific indices (typo, minimal, long skills, non-standard).
    """
    universities = UNIVERSITIES[domain]
    uni = universities[idx % len(universities)]
    degree = DEGREES_BY_DOMAIN[domain][idx % len(DEGREES_BY_DOMAIN[domain])]
    grad_year = random.randint(2019, 2024)
    gpa = round(random.uniform(3.2, 3.9), 2) if random.random() > 0.3 else None

    skills_data = SKILLS_BY_DOMAIN[domain]
    companies = COMPANIES_BY_DOMAIN[domain]
    company = companies[idx % len(companies)]
    certs = CERTIFICATIONS_BY_DOMAIN[domain]
    projects = PROJECTS_BY_DOMAIN[domain]

    first_name = name.split()[0]
    email = f"{first_name.lower()}.{str(idx+1)}@email.com"
    phone = f"+1-555-{random.randint(100,999)}-{random.randint(1000,9999)}"
    linkedin = f"linkedin.com/in/{first_name.lower()}{idx+1}"
    github = f"github.com/{first_name.lower()}{idx+1}"
    city_options = ["Cairo, Egypt", "Berlin, Germany", "Mumbai, India", "Toronto, Canada",
                    "Seoul, South Korea", "San Francisco, USA", "London, UK", "Istanbul, Turkey"]
    location = city_options[idx % len(city_options)]

    # ----- Minimal resume variation -----
    if idx == MINIMAL_RESUME_INDEX:
        return f"""{name}
{email} | {phone}

Summary:
Junior {domain} enthusiast looking for entry-level opportunities.

Skills: Python, Git, SQL

Education:
{degree}, {uni}, {grad_year}
"""

    # ----- Non-standard format variation -----
    if idx == NONSTANDARD_RESUME_INDEX:
        langs = ", ".join(skills_data["Languages"])
        tools = ", ".join(skills_data["Tools"])
        return (
            f"NAME: {name}\n"
            f"CONTACT: {email} / {phone}\n"
            f"WHERE: {location}\n\n"
            f"-- WHAT I KNOW --\n"
            f"  {langs}\n"
            f"  {tools}\n\n"
            f"-- WHERE I STUDIED --\n"
            f"  {degree} @ {uni} ({grad_year})\n\n"
            f"-- WHERE I WORKED --\n"
            f"  {company} — {domain} Intern (2023)\n\n"
            f"-- PROJECTS --\n"
            f"  {projects[0][0]}: {projects[0][2]}\n"
            f"  {projects[1][0]}: {projects[1][2]}\n"
        )

    # ----- Long skills variation -----
    all_skills_flat = (
        skills_data["Languages"]
        + skills_data["Frameworks/Libraries"]
        + skills_data["Tools"]
        + skills_data["Cloud/DevOps"]
        + skills_data["Soft Skills"]
    )
    if idx == LONG_SKILLS_RESUME_INDEX:
        # Add cross-domain skills to exceed 30
        extra = ["Linux", "Bash", "REST APIs", "GraphQL", "Redis", "Nginx", "MongoDB",
                 "PostgreSQL", "Flask", "FastAPI", "Celery", "RabbitMQ"]
        all_skills_flat = list(dict.fromkeys(all_skills_flat + extra))  # deduplicate

    # ----- Typo variation -----
    langs_list = list(skills_data["Languages"])
    if idx == TYPO_RESUME_INDEX:
        langs_list = [s if s != "Python" else "Pytohn" for s in langs_list]  # intentional typo

    # ----- Build objective -----
    objectives = {
        "Data Science": (
            f"Results-driven data scientist with hands-on experience in predictive modeling and statistical analysis. "
            f"Passionate about turning messy real-world datasets into actionable insights. "
            f"Seeking to apply machine learning expertise at a data-driven organization."
        ),
        "Software Engineering": (
            f"Full-stack software engineer skilled in building scalable web applications from end to end. "
            f"Enthusiastic about clean code, test-driven development, and team collaboration. "
            f"Looking to contribute to high-impact products in a fast-moving engineering team."
        ),
        "AI": (
            f"AI researcher and engineer with deep interest in NLP and large language models. "
            f"Experienced in fine-tuning transformer models and building ML pipelines from research to production. "
            f"Aiming to push the boundaries of applied AI at an innovative organization."
        ),
        "DevOps": (
            f"Infrastructure engineer passionate about automation, reliability, and cloud-native architectures. "
            f"Skilled in designing CI/CD pipelines and managing Kubernetes clusters at scale. "
            f"Dedicated to enabling teams to ship software faster with confidence."
        ),
        "Computer Engineering": (
            f"Embedded systems engineer with experience in FPGA design, real-time OS programming, and hardware-software integration. "
            f"Enthusiastic about building reliable low-level systems that power physical-world applications. "
            f"Seeking a role at the intersection of hardware design and systems engineering."
        ),
    }

    objective = objectives[domain]

    # GPA line
    gpa_line = f", GPA: {gpa}/4.0" if gpa else ""

    # Courses
    relevant_courses = {
        "Data Science": "Machine Learning, Statistical Inference, Big Data Analytics, Linear Algebra",
        "Software Engineering": "Algorithms & Data Structures, Operating Systems, Database Systems, Software Architecture",
        "AI": "Deep Learning, Computer Vision, NLP, Reinforcement Learning, Probabilistic Graphical Models",
        "DevOps": "Computer Networks, Operating Systems, Cloud Computing, Distributed Systems",
        "Computer Engineering": "Digital Logic Design, Embedded Systems, Computer Architecture, Real-Time Operating Systems, VLSI Design",
    }

    # Certs section (pick 3-4)
    num_certs = random.randint(3, min(4, len(certs)))
    selected_certs = certs[:num_certs]
    certs_lines = "\n".join(
        f"  - {c[0]} — {c[1]}, {c[2]}" for c in selected_certs
    )

    # Skills section
    if idx == LONG_SKILLS_RESUME_INDEX:
        skills_section = "  " + " | ".join(all_skills_flat)
    else:
        skills_section = (
            f"  Languages: {', '.join(langs_list)}\n"
            f"  Frameworks/Libraries: {', '.join(skills_data['Frameworks/Libraries'])}\n"
            f"  Tools: {', '.join(skills_data['Tools'])}\n"
            f"  Cloud/DevOps: {', '.join(skills_data['Cloud/DevOps'])}\n"
            f"  Soft Skills: {', '.join(skills_data['Soft Skills'])}"
        )

    # Projects section (pick 2-3)
    num_projects = random.randint(2, len(projects))
    selected_projects = projects[:num_projects]
    projects_lines = ""
    for p in selected_projects:
        projects_lines += (
            f"  {p[0]}\n"
            f"    {p[1]}\n"
            f"    Stack: {p[2]}\n"
            f"    Link: {p[3]}\n\n"
        )

    # Experience section (0-2 entries for fresh grads)
    num_exp = random.randint(0, 2)
    exp_lines = ""
    if num_exp >= 1:
        role_titles = {
            "Data Science": "Data Science Intern",
            "Software Engineering": "Software Engineering Intern",
            "AI": "AI Research Intern",
            "DevOps": "DevOps Engineer Intern",
            "Computer Engineering": "Embedded Systems Intern",
        }
        role = role_titles[domain]
        start_year = grad_year - 1
        exp_lines += (
            f"  {company}\n"
            f"  {role} | {start_year} – {start_year+1}\n"
            f"  • Contributed to production codebase and reduced processing latency by 18%.\n"
            f"  • Collaborated with senior engineers to redesign data ingestion architecture.\n"
            f"  • Wrote unit and integration tests increasing coverage from 60% to 87%.\n\n"
        )
    if num_exp == 2:
        second_company = companies[(idx + 1) % len(companies)]
        exp_lines += (
            f"  {second_company}\n"
            f"  Freelance {domain} Consultant | 2022 – 2023\n"
            f"  • Delivered end-to-end ML solution for client reducing manual effort by 40%.\n"
            f"  • Built automated reporting pipeline saving 5+ hours/week of analyst time.\n\n"
        )

    # Extracurricular (50% chance)
    extra_section = ""
    if random.random() > 0.5:
        extra = EXTRACURRICULARS[idx % len(EXTRACURRICULARS)]
        extra_section = f"\nEXTRACURRICULAR & VOLUNTEERING\n{'-'*40}\n  {extra}\n"

    resume = f"""{name}
{email} | {phone} | {linkedin} | {github}
{location}

OBJECTIVE / SUMMARY
{'-'*40}
{objective}

EDUCATION
{'-'*40}
  {degree}
  {uni}{gpa_line}
  Graduated: {grad_year}
  Relevant Coursework: {relevant_courses[domain]}

COURSES & TRAINING
{'-'*40}
{certs_lines}

SKILLS
{'-'*40}
{skills_section}

PROJECTS
{'-'*40}
{projects_lines.rstrip()}

EXPERIENCE
{'-'*40}
{exp_lines.rstrip() if exp_lines else "  No formal employment history yet."}
{extra_section}
"""
    return resume


def save_txt(text: str, path: Path):
    """Save resume text as a .txt file."""
    path.write_text(text, encoding="utf-8")


def save_pdf(text: str, path: Path):
    """Save resume text as a .pdf file using fpdf2, with character sanitization."""
    try:
        from fpdf import FPDF
    except ImportError:
        print("  [WARN] fpdf2 not installed. Skipping PDF generation.")
        print("         Run: pip install fpdf2")
        return

    # Sanitize text for Latin-1 compatibility used by fpdf2's core fonts
    replacements = {
        "&": "and",
        "\u2019": "'",
        "\u2018": "'",
        "\u201c": '"',
        "\u201d": '"',
        "\u2013": "-",
        "\u2014": "--",
        "\u2022": "-",
        "\u00e9": "e",
        "\u00e8": "e",
        "\u00fc": "u",
        "\u00f6": "o",
        "\u2026": "...",
    }
    for char, replacement in replacements.items():
        text = text.replace(char, replacement)

    # Keep only printable Latin-1 range characters
    safe_text = "".join(c if ord(c) < 256 else "?" for c in text)

    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()
    pdf.set_font("Helvetica", size=10)

    for line in safe_text.split("\n"):
        try:
            pdf.multi_cell(0, 5, txt=line)
        except Exception:
            # Fallback: truncate and write what we can
            pdf.cell(0, 5, txt=line[:100], ln=True)

    pdf.output(str(path))


def main():
    """Entry point: generate all 20 resumes as .txt and .pdf files."""
    print(f"Generating 20 resumes in: {OUTPUT_DIR}\n")

    for idx, (name, domain) in enumerate(zip(NAMES, DOMAINS)):
        slug = name.lower().replace(" ", "_")
        domain_slug = domain.lower().replace(" ", "_").replace("/", "_")
        filename_base = f"resume_{idx+1:02d}_{domain_slug}_{slug}"

        txt_path = OUTPUT_DIR / f"{filename_base}.txt"
        pdf_path = OUTPUT_DIR / f"{filename_base}.pdf"

        text = generate_resume_text(idx, name, domain)

        save_txt(text, txt_path)
        save_pdf(text, pdf_path)

        variation_flag = ""
        if idx == TYPO_RESUME_INDEX:
            variation_flag = " [TYPO-VARIANT]"
        elif idx == MINIMAL_RESUME_INDEX:
            variation_flag = " [MINIMAL-VARIANT]"
        elif idx == LONG_SKILLS_RESUME_INDEX:
            variation_flag = " [LONG-SKILLS-VARIANT]"
        elif idx == NONSTANDARD_RESUME_INDEX:
            variation_flag = " [NONSTANDARD-VARIANT]"

        print(f"  [{idx+1:02d}] {filename_base}{variation_flag}")

    print(f"\nDone. {len(NAMES)} resumes saved to {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
