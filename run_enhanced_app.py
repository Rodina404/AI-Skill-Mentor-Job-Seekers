import os
import sys
import uvicorn
from fastapi import FastAPI
from dotenv import load_dotenv

# Add project directories to sys.path for proper imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "skill_gap_engine")))
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

# Load environment variables
load_dotenv()

# Import original app logic
# When running from root, we import from the modified path
import main as original_main
original_app = original_main.app

# Import Enhanced Logic
from enhanced_mentor.api_v2 import router as v2_router
from enhanced_mentor.test_ui_v2 import router as ui_v2_router

# Combine them
app = original_app
app.include_router(v2_router)
app.include_router(ui_v2_router)

# Customize title for the combined system
app.title = "AI Skill Mentor - PRO Edition"
app.version = "2.5.0"

if __name__ == "__main__":
    print("--------------------------------------------------")
    print("STARTING AI SKILL MENTOR - PRO EDITION")
    print("--------------------------------------------------")
    print("Original Routes: /run, /health, /test-ui")
    print("Enhanced Routes: /api/v2/*, /v2/test-ui")
    print("--------------------------------------------------")
    
    port = int(os.getenv("PORT", 8004))
    uvicorn.run("run_enhanced_app:app", host="0.0.0.0", port=port, reload=False)
