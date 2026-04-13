"""
Run the CV Matching System Web UI
Start the Flask application to use the web interface
"""

import os
import sys

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if __name__ == '__main__':
    try:
        from web_app import app
        print("\n" + "=" * 70)
        print("CV MATCHING SYSTEM - WEB UI")
        print("=" * 70)
        print("\n✅ Starting Flask application...")
        print("\n📱 Open your browser and go to: http://localhost:5000")
        print("\nPress Ctrl+C to stop the server\n")
        print("=" * 70 + "\n")
        
        app.run(debug=True, host='0.0.0.0', port=5000)
    except ImportError as e:
        print(f"\n❌ Error: Missing dependencies")
        print(f"Please run: pip install -r requirements.txt\n")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error: {str(e)}\n")
        sys.exit(1)
