
import faiss
import pickle
import pandas as pd
from pathlib import Path

artifacts_dir = Path("artifacts")
index_path = artifacts_dir / "courses.index"
pkl_path = artifacts_dir / "courses.pkl"

print(f"Checking index: {index_path}")
if index_path.exists():
    index = faiss.read_index(str(index_path))
    print(f"Index type: {type(index)}")
    print(f"Index d: {index.d}")
    print(f"Index ntotal: {index.ntotal}")
else:
    print("Index not found!")

print(f"Checking pickle: {pkl_path}")
if pkl_path.exists():
    with open(pkl_path, 'rb') as f:
        df = pickle.load(f)
    print(f"DataFrame shape: {df.shape}")
    print(f"Columns: {df.columns.tolist()[:10]}...")
else:
    print("Pickle not found!")
