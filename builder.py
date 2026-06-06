import pandas as pd
import faiss
import torch
from sentence_transformers import SentenceTransformer
import os
import warnings
import time

# --- CONFIGURATION ---
CONFIG = {
    "model_name": "all-mpnet-base-v2", # The smartest open-source SBERT model
    "batch_size": 64,  
    "jobs_file": "data/jobs.csv",
    "courses_file": "data/courses.csv",
    "output_dir": "artifacts"
}

warnings.filterwarnings("ignore")

def build_neural_brain():
    print("🚀 INITIALIZING DEEP LEARNING ENGINE")
    
    # 1. Hardware Setup
    device = 'cuda' if torch.cuda.is_available() else 'cpu'
    if device == 'cuda':
        print(f"   ⚡ CUDA Detected: Hardware Acceleration ON ({torch.cuda.get_device_name(0)})")
    else:
        print("   ⚠️ CUDA not detected. Running on CPU (This will take much longer).")
    
    model = SentenceTransformer(CONFIG['model_name'], device=device)
    
    if not os.path.exists(CONFIG['output_dir']):
        os.makedirs(CONFIG['output_dir'])

    # 2. Process Jobs (LinkedIn Data)
    print("\n[1/3] Ingesting Job Market Data...")
    if not os.path.exists(CONFIG['jobs_file']):
        print(f"   ⚠️ Skipping Jobs: {CONFIG['jobs_file']} not found. Course recommender will still work.")
        index_jobs = None
        df_jobs = None
    else:
        try:
            # Load data. We take a sample of 50k to ensure it builds quickly for testing. 
            # Change to len(df_jobs) for the full 1.3M later.
            df_jobs = pd.read_csv(CONFIG['jobs_file'], on_bad_lines='skip')
            df_jobs = df_jobs.sample(min(len(df_jobs), 50000), random_state=42)
            
            # Ensure columns exist, fill NaNs
            for col in ['job_title', 'job_skills']:
                if col not in df_jobs.columns: df_jobs[col] = ""
            
            # Create the semantic blob (The context the AI will learn)
            df_jobs['blob'] = df_jobs['job_title'].astype(str) + ". Required: " + df_jobs['job_skills'].astype(str)
            
            print(f"   -> Vectorizing {len(df_jobs)} jobs. Please wait...")
            start_time = time.time()
            job_vectors = model.encode(
                df_jobs['blob'].tolist(), 
                show_progress_bar=True, 
                batch_size=CONFIG['batch_size'],
                convert_to_numpy=True
            )
            
            # Normalize vectors for Cosine Similarity, then use FAISS Inner Product
            faiss.normalize_L2(job_vectors)
            index_jobs = faiss.IndexFlatIP(768) # 768 is the dimension for mpnet-base
            index_jobs.add(job_vectors)
            print(f"   -> Job vectors indexed in {round(time.time() - start_time, 2)} seconds.")
            
        except Exception as e:
            print(f"❌ Error processing jobs: {e}. Skipping...")
            index_jobs = None
            df_jobs = None

    # 3. Process Courses (Udemy Data)
    print("\n[2/3] Ingesting Educational Content...")
    try:
        df_courses = pd.read_csv(CONFIG['courses_file'], on_bad_lines='skip')
        # Sample to 20k to ensure it builds in a few minutes on CPU
        df_courses = df_courses.sample(min(len(df_courses), 20000), random_state=42)
        
        # Actual column names in the Udemy dataset: 'title' and 'headline'
        for col in ['title', 'headline', 'category', 'objectives']:
            if col not in df_courses.columns: df_courses[col] = ""
            
        # Build a rich semantic blob using title + headline + category
        # This is what the FAISS index will semantically search over
        df_courses['blob'] = (
            df_courses['title'].astype(str) + ". " +
            df_courses['headline'].astype(str) + ". Category: " +
            df_courses['category'].astype(str)
        )
        
        print(f"   -> Vectorizing {len(df_courses)} courses. Please wait...")
        course_vectors = model.encode(
            df_courses['blob'].tolist(), 
            show_progress_bar=True, 
            batch_size=CONFIG['batch_size'],
            convert_to_numpy=True
        )
        
        faiss.normalize_L2(course_vectors)
        index_courses = faiss.IndexFlatIP(768)
        index_courses.add(course_vectors)
        
    except Exception as e:
        print(f"❌ Error processing courses: {e}. Check if data/courses.csv exists.")
        return

    # 4. Save the Brain
    print("\n[3/3] Saving Neural Artifacts...")
    
    # Save Indices
    if index_jobs is not None:
        faiss.write_index(index_jobs, f"{CONFIG['output_dir']}/jobs.index")
    faiss.write_index(index_courses, f"{CONFIG['output_dir']}/courses.index")
    
    # Save Metadata
    if df_jobs is not None:
        df_jobs.to_pickle(f"{CONFIG['output_dir']}/jobs.pkl")
    df_courses.to_pickle(f"{CONFIG['output_dir']}/courses.pkl")
    
    print("\n✅ BUILD COMPLETE. The AI is trained and ready.")

if __name__ == "__main__":
    build_neural_brain()