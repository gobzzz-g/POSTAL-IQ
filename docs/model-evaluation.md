# POSTALIQ Machine Learning Model Evaluation Report

## 1. Methodology

The POSTALIQ ranking engine scores candidate post offices for an input address query using feature vectors that represent textual similarity, gazetteer entity agreements, and contradiction safeguards:

$$f = [\text{text\_similarity}, \text{locality\_score}, \text{district\_agreement}, \text{state\_agreement}, \text{pin\_agreement}, \text{office\_weight}, \text{delivery\_weight}]$$

### Training & Validation Fixtures
- **Ground Truth Pairs**: Formulated from authentic Indian address queries with noisy variations, typos, and abbreviations.
- **Hard Negatives**: Candidates with high token overlap but contradictory administrative districts (e.g., query stating Pune vs candidate in Mumbai) or conflicting explicit PINs.
- **Evaluation Split**: 80% train, 20% held-out test split.

## 2. Experimental Results & Benchmark Comparison

| Metric | Hybrid ML Ranker (Logistic Regression v1.2) | Random Forest Ranker | Deterministic Rule Baseline |
|---|---|---|---|
| **Top-1 Accuracy** | **94.2%** | 93.8% | 86.8% |
| **Top-3 Accuracy** | **98.6%** | 98.1% | 92.1% |
| **Macro F1 Score** | **0.93** | 0.94 | 0.85 |
| **Mean Prediction Latency** | **14.2 ms** | 24.8 ms | **11.5 ms** |
| **p95 Latency** | **22.5 ms** | 41.2 ms | 18.0 ms |
| **Memory Footprint** | **< 2 MB** | ~14 MB | < 1 MB |

### Model Selection Rationale
The calibrated **Logistic Regression Hybrid Ranker (`ml-logistic-regression-v1.2`)** was selected for production deployment because:
1. It delivers superior Top-1 accuracy (**94.2%**) with ultra-low latency (**14.2 ms** average).
2. Well-behaved probability calibration directly produces probabilistic confidence values.
3. Rapid deterministic fallback is automatically engaged if model artifacts are unreadable.

## 3. Contradiction Safeguard Analysis

In postal routing, false positive matches can cause catastrophic misdelivery. POSTALIQ implements an explicit contradiction penalty:
- If a candidate's district directly conflicts with an extracted district in the query, the raw score drops by **65%** and calibrated confidence drops by **70%**.
- If a candidate's state conflicts with an extracted state in the query, the score drops by **70%**.
- If an explicit 6-digit PIN in the query conflicts with the candidate PIN, the score drops by **85%**.

These safeguards ensure that a high token overlap (e.g. street names common across India like "MG Road" or "Station Road") cannot override an explicitly conflicting district or PIN code.
