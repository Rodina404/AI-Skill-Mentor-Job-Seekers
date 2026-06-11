import os

from dotenv import load_dotenv


def test_project_dotenv_can_override_placeholder_environment(monkeypatch):
    monkeypatch.setenv("GROQ_API_KEY", "your_groq_api_key_here")
    load_dotenv(override=True)
    assert os.environ["GROQ_API_KEY"].startswith("gsk_")
