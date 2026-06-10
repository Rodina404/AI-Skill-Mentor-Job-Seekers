#!/usr/bin/env python3
"""Quick test of Groq API connectivity."""
import os
from dotenv import load_dotenv

load_dotenv(override=True)

api_key = os.getenv("GROQ_API_KEY")
print(f"API Key present: {bool(api_key)}")

try:
    from groq import Groq
    print("[OK] groq module imported")
    
    client = Groq(api_key=api_key)
    print("[OK] Groq client created")
    
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": "Say 'test successful' in one word"}],
        max_tokens=10,
        temperature=0.1,
    )
    print(f"[OK] API call succeeded: {response.choices[0].message.content}")
    
except ImportError as e:
    print(f"[ERROR] Import error: {e}")
except Exception as e:
    print(f"[ERROR] {type(e).__name__}: {e}")
