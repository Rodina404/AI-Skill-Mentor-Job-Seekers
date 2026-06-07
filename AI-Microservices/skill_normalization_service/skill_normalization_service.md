# Skill Normalization Service Evaluation

## Summary
- **Overall Accuracy**: 100.0%
- **Rule-layer Accuracy**: 100.0%
- **Embedding-layer Accuracy**: 100.0%
- **Rejection Rate**: 100.0%
- **Verdict**: ✅ PASS

## Step 1: Rule-Layer Tests (Synonym Mapping)
| Input | Predicted ID | Confidence | Status |
|---|---|---|---|
| `js` | `S_js` | 1.000 | ✅ PASS |
| `ts` | `S_ts` | 1.000 | ✅ PASS |
| `py` | `S_python` | 1.000 | ✅ PASS |
| `ms excel` | `S_excel` | 1.000 | ✅ PASS |
| `nodejs` | `S_node` | 1.000 | ✅ PASS |
| `react.js` | `S_react` | 1.000 | ✅ PASS |
| `postgres` | `S_postgresql` | 1.000 | ✅ PASS |
| `mysql` | `S_mysql` | 1.000 | ✅ PASS |
| `ml` | `S_ml` | 1.000 | ✅ PASS |
| `cv` | `S_cv` | 1.000 | ✅ PASS |

## Step 2: Embedding-Layer Tests (Paraphrase Mapping)
| Input | Predicted ID | Confidence | Status |
|---|---|---|---|
| `powerbi desktop` | `S_powerbi` | 1.000 | ✅ PASS |
| `power bi` | `S_powerbi` | 1.000 | ✅ PASS |
| `data visualisation` | `S_data_visualization` | 1.000 | ✅ PASS |
| `neural nets` | `S_dl` | 1.000 | ✅ PASS |
| `statistical analysis` | `S_statistics` | 1.000 | ✅ PASS |
| `rest api development` | `S_rest` | 1.000 | ✅ PASS |
| `amazon web services` | `S_aws` | 1.000 | ✅ PASS |
| `docker containers` | `S_docker` | 1.000 | ✅ PASS |
| `version control git` | `S_git` | 1.000 | ✅ PASS |
| `large language model` | `S_llm` | 1.000 | ✅ PASS |

## Step 3: Unknown Rejection Tests
| Input | Status |
|---|---|
| `xyzfoobar123` | ✅ REJECTED |
| `quantum entanglement programming` | ✅ REJECTED |
| `blargh` | ✅ REJECTED |
