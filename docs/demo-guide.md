# POSTALIQ Presentation Demonstration Guide

Follow this step-by-step walkthrough during live presentations to demonstrate all core capabilities.

---

### Scenario 1: Successful High-Confidence Identification

1. **Navigate to**: `http://localhost:5173/` (Address Intelligence Workspace).
2. **Action**: In the "Try Example" dropdown, select **"Standard Complete: Koramangala, Bengaluru"** (or paste `Koramangala 4th Block, Bengaluru Urban, Karnataka`).
3. **Click**: **"Analyze Address"**.
4. **Observe**:
   - Primary Match: **PIN 560034** (`Koramangala Sub Post Office`).
   - High Confidence Badge (**> 95%**).
   - Evidence Checklist:
     - Exact locality match: `Koramangala 4th Block` identified in query.
     - District agreement: `Bengaluru Urban` matches address.
     - State agreement: `Karnataka` confirmed.
   - Click **"View on Map"** to view the Leaflet coordinate centroid.
   - Click **"Copy PIN"** to verify clipboard feedback.

---

### Scenario 2: Misspelled Locality (Spelling Normalization)

1. **Action**: In the "Try Example" dropdown, select **"Misspelled Locality: Kormangla (Typo)"** (or paste `4th Cross, Kormangla, Bangalore, KA`).
2. **Click**: **"Analyze Address"**.
3. **Observe**:
   - The engine automatically expands abbreviation `KA` → `karnataka`.
   - Locality `Kormangla` is matched against gazetteer aliases and fuzzy tokens.
   - Accurately resolves to **560034** (`Koramangala Sub Post Office`).
   - Rationales clearly explain the fuzzy spelling normalization.

---

### Scenario 3: Ambiguous Locality & Interactive Clarification

1. **Action**: Select **"Ambiguous Delivery: Salt Lake Sector 1"** (or enter `Sector 1, Salt Lake, Kolkata`).
2. **Click**: **"Analyze Address"**.
3. **Observe**:
   - Status changes to **Ambiguous**.
   - Competing candidate cards appear (e.g. `Sector 1 Bidhannagar (700064)` vs `Salt Lake Electronics Complex (700091)`).
   - **Interactive Clarification Assistant** appears with targeted choices.
   - Click one of the clarification option pills (e.g. `Sector 1 Bidhannagar`).
   - The engine instantly reruns prediction with the clarified context and confirms the primary match.

---

### Scenario 4: Unsupported Address (Safe Refusal without Hallucination)

1. **Action**: Enter `Fictional alleyway 999999 imaginary place nowhere`.
2. **Click**: **"Analyze Address"**.
3. **Observe**:
   - Status is **Unmatched**.
   - Confidence drops below the 30% refusal threshold.
   - Shows explainable banner: *"No Reliable Postal Match Found. The evidence was insufficient to identify a verified 6-digit Indian PIN code."*
   - Proves the system **refuses to invent results** when evidence is missing.

---

### Scenario 5: Bulk CSV Address Validation

1. **Navigate to**: `http://localhost:5173/bulk` (Bulk Validation).
2. **Action**: Create or use a small CSV file (e.g., 3–5 lines of addresses) or click "Select CSV File".
3. **Observe**:
   - Real-time row preview (first 5 rows).
   - Address column detection.
   - Click **"Start Batch Validation"**.
   - Summary statistics display (Total Processed, Matched, Ambiguous, Unmatched).
   - Click **"Download Validated CSV"** to receive the enriched CSV with predicted PINs, confidence, and review flags.

---

### Scenario 6: Administration Workspace & Record Management

1. **Navigate to**: `http://localhost:5173/admin`.
2. **Login Credentials**:
   - Username: `admin`
   - Password: `PostalIQ@2025Secure`
3. **Action**: Click **"Postal Directory Records"** tab.
4. **Demonstrate**:
   - Click **"Add Postal Record"**.
   - Add a test record (e.g. PIN: `560103`, Office: `Bellandur Sub Post Office`).
   - Save and observe instant update in the table.

---

### Scenario 7: Platform Analytics & Model Benchmarks

1. **Navigate to**: `http://localhost:5173/admin` → **"Analytics & Model Metrics"** tab.
2. **Observe**:
   - Live query metrics (Total Queries, Match Rate %, Average Confidence).
   - Query Confidence Distribution Bar Chart rendered with Recharts.
   - Benchmark evaluation comparison table highlighting **Hybrid ML Ranker (94.2% Top-1 Accuracy, 14.2 ms Latency)** vs Baseline.
