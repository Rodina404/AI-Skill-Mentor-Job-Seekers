import faiss
import pickle
from pathlib import Path
import os

def test_load():
    try:
        artifacts_dir = Path("artifacts")
        print(f"Checking artifacts in: {artifacts_dir.absolute()}")
        
        index_path = artifacts_dir / "courses.index"
        print(f"Reading index from: {index_path}")
        index = faiss.read_index(str(index_path))
        print("✅ Index loaded successfully")
        
        pkl_path = artifacts_dir / "courses.pkl"
        print(f"Reading pickle from: {pkl_path}")
        with open(pkl_path, 'rb') as f:
            df = pickle.load(f)
        print("✅ Pickle loaded successfully")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_load()
