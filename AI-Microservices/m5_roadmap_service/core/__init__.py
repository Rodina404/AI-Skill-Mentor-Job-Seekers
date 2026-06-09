# Initialize core package
import os
import sys

# Ensure core directory is in Python path for absolute imports within the package
core_dir = os.path.dirname(os.path.abspath(__file__))
if core_dir not in sys.path:
    sys.path.insert(0, core_dir)
