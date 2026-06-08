# CV Matching & Job Scoring Service

Matches pre-processed CVs against job descriptions using LangChain, semantic search (FAISS Vector Store), and hybrid scoring logic to return a ranked list of best-fit candidates.

## Installation

```bash
pip install -r requirements.txt
```

## Run

```bash
uvicorn main:app --host 0.0.0.0 --port 8004 --reload
```

## Endpoints

- GET /health
- POST /match

---

## Evaluation Results

The CV Matching Service was evaluated using benchmark datasets representing realistic hiring scenarios. Performance was measured using standard Information Retrieval and Ranking metrics including NDCG@5, MRR, Precision@5, and Spearman Correlation.

### Evaluation Summary

| Metric | Target | Result | Status |
|----------|----------|----------|----------|
| Mean NDCG@5 | ≥ 0.75 | 0.9735 | ✅ PASS |
| Mean MRR | ≥ 0.60 | 1.0000 | ✅ PASS |
| Mean Precision@5 | N/A | 1.0000 | ✅ PASS |
| Mean Spearman Correlation | ≥ 0.50 | 0.9697 | ✅ PASS |
| Overall Verdict | Pass All Metrics | ✅ PASS | ✅ PASS |

### Query 1: Data Analyst

**NDCG@5:** 0.9864  
**MRR:** 1.0000

| Rank | Candidate ID | Match Score | Ground Truth Relevance |
|------|-------------|-------------|------------------------|
| 1 | CV_A08 | 83.33 | 2 |
| 2 | CV_A02 | 83.33 | 2 |
| 3 | CV_A07 | 76.67 | 1 |
| 4 | CV_A01 | 72.50 | 2 |
| 5 | CV_A03 | 61.67 | 1 |
| 6 | CV_A10 | 58.33 | 1 |
| 7 | CV_A04 | 55.83 | 1 |
| 8 | CV_A09 | 50.00 | 0 |
| 9 | CV_A05 | 50.00 | 0 |
| 10 | CV_A06 | 50.00 | 0 |

### Query 2: Full-Stack Developer

**NDCG@5:** 0.9606  
**MRR:** 1.0000

| Rank | Candidate ID | Match Score | Ground Truth Relevance |
|------|-------------|-------------|------------------------|
| 1 | CV_B08 | 72.05 | 2 |
| 2 | CV_B07 | 71.50 | 1 |
| 3 | CV_B01 | 70.30 | 2 |
| 4 | CV_B02 | 66.78 | 2 |
| 5 | CV_B10 | 64.50 | 1 |
| 6 | CV_B04 | 64.50 | 1 |
| 7 | CV_B09 | 57.50 | 0 |
| 8 | CV_B03 | 57.00 | 1 |
| 9 | CV_B05 | 57.00 | 0 |
| 10 | CV_B06 | 50.00 | 0 |

### Conclusion

The CV Matching Service exceeded all target performance thresholds. The system consistently ranked the most relevant candidates at the top positions, achieving near-perfect NDCG and Spearman correlation scores while maintaining a perfect MRR and Precision@5. These results demonstrate the effectiveness of the hybrid semantic retrieval and scoring pipeline for candidate ranking and job matching within the AI-Powered Skill Mentor platform.

---