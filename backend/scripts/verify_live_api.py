import httpx

client = httpx.Client(base_url='http://127.0.0.1:8000/api/v1', timeout=10.0)

print("=== 1. HEALTH CHECK ===")
res_health = client.get('/health')
print("Status:", res_health.status_code, res_health.json())

print("\n=== 2. READINESS CHECK ===")
res_ready = client.get('/ready')
print("Status:", res_ready.status_code, res_ready.json())

print("\n=== 3. CRITICAL DEFECT VERIFICATIONS ===")

test_cases = [
    ("Patna GPO", "Patna General Post Office, Station Road, Patna, Bihar", "matched", "800001", "Patna"),
    ("Connaught Place", "Connaught Place, New Delhi, Delhi", "matched", "110001", "New Delhi"),
    ("Hauz Khas", "Hauz Khas, South Delhi, Delhi", "matched", "110016", "South Delhi"),
    ("Gandhipuram, Coimbatore", "Gandhipuram, Coimbatore, Tamil Nadu", "matched", "641012", "Coimbatore"),
    ("Gandhipurm (misspelling)", "Gandhipurm, Coimbatore, Tamil Nadu", "matched", "641012", "Coimbatore"),
    ("Unknown Imaginary", "Unknown locality xyzqv, Nowhere District, Imaginary State", "unmatched", None, None),
    ("Darya Ganj", "Darya Ganj, Central Delhi, Delhi", "matched", "110002", "Central Delhi"),
    ("Shakarpur", "Shakarpur, East Delhi, Delhi", "matched", "110092", "East Delhi"),
    ("Locality-State Conflict", "Darya Ganj, Patna, Bihar", "conflict", None, None),
    ("Empty Address Input", "", "invalid_input", None, None),
]

for label, query, exp_status, exp_pin, exp_dist in test_cases:
    res = client.post('/predict', json={'address_text': query}).json()
    status = res['status']
    pm = res.get('primary_match')
    pin = pm['pin_code'] if pm else None
    dist = pm['district'] if pm else None
    conf = res['overall_confidence'] * 100.0
    
    print(f"[{label}]")
    print(f"  Input: {repr(query)}")
    print(f"  Status: {status} (Expected: {exp_status}) | Conf: {conf:.1f}%")
    print(f"  Primary: {pin} - {dist} (Expected PIN: {exp_pin})")
    print(f"  Warnings: {res.get('warnings')}")
    
    assert status == exp_status, f"Mismatch status for {label}: got {status}, expected {exp_status}"
    if exp_pin:
        assert pin == exp_pin, f"Mismatch PIN for {label}: got {pin}, expected {exp_pin}"
    if exp_dist:
        assert dist == exp_dist, f"Mismatch district for {label}: got {dist}, expected {exp_dist}"

print("\n=== 4. BATCH VALIDATION & CSV EXPORT ===")
csv_sample = (
    'address\n'
    '"Patna General Post Office, Station Road, Patna, Bihar"\n'
    '"Gandhipuram, Coimbatore, Tamil Nadu"\n'
    '"Unknown locality xyzqv, Nowhere District, Imaginary State"\n'
    '"Darya Ganj, Patna, Bihar"\n'
    '""\n'
)
files = {'file': ('batch_validation_test.csv', csv_sample.encode('utf-8'), 'text/csv')}
batch_job = client.post('/batch/validate', files=files).json()
job_id = batch_job['job_id']
print("Batch Job ID:", job_id)
print("Total Rows:", batch_job['total_records'])
print("Matched:", batch_job['matched_count'], "Unmatched:", batch_job['unmatched_count'])

download_csv = client.get(f'/batch/{job_id}/download').text
print("\nExported CSV Content:")
print(download_csv)

assert "800001,Patna General Post Office,Patna,Bihar,99.0,matched,NO" in download_csv
assert "641012,Gandhipuram Sub Post Office,Coimbatore,Tamil Nadu,99.0,matched,NO" in download_csv
assert "unmatched,YES" in download_csv
assert "conflict,YES" in download_csv
assert "invalid_input,YES" in download_csv

print("\n=== ALL CRITICAL DEFECTS VERIFIED FIXED AND PASSING LIVE! ===")
