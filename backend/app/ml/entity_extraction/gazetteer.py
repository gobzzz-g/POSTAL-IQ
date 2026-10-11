from typing import Set, Dict, List, Tuple, Optional

# Authoritative list of Indian States and Union Territories
INDIAN_STATES: Dict[str, str] = {
    "andhra pradesh": "Andhra Pradesh",
    "arunachal pradesh": "Arunachal Pradesh",
    "assam": "Assam",
    "bihar": "Bihar",
    "chhattisgarh": "Chhattisgarh",
    "goa": "Goa",
    "gujarat": "Gujarat",
    "haryana": "Haryana",
    "himachal pradesh": "Himachal Pradesh",
    "jharkhand": "Jharkhand",
    "karnataka": "Karnataka",
    "kerala": "Kerala",
    "madhya pradesh": "Madhya Pradesh",
    "maharashtra": "Maharashtra",
    "manipur": "Manipur",
    "meghalaya": "Meghalaya",
    "mizoram": "Mizoram",
    "nagaland": "Nagaland",
    "odisha": "Odisha",
    "orissa": "Odisha",
    "punjab": "Punjab",
    "rajasthan": "Rajasthan",
    "sikkim": "Sikkim",
    "tamil nadu": "Tamil Nadu",
    "telangana": "Telangana",
    "tripura": "Tripura",
    "uttar pradesh": "Uttar Pradesh",
    "uttarakhand": "Uttarakhand",
    "west bengal": "West Bengal",
    # Union Territories
    "delhi": "Delhi",
    "new delhi": "Delhi",
    "national capital territory of delhi": "Delhi",
    "nct": "Delhi",
    "chandigarh": "Chandigarh",
    "puducherry": "Puducherry",
    "pondicherry": "Puducherry",
    "ladakh": "Ladakh",
    "jammu and kashmir": "Jammu & Kashmir",
    "jammu & kashmir": "Jammu & Kashmir",
    "andaman and nicobar islands": "Andaman & Nicobar",
    "dadra and nagar haveli and daman and diu": "Dadra & Nagar Haveli and Daman & Diu",
    "lakshadweep": "Lakshadweep",
}

# Prominent city to district mappings for common Indian metros
CITY_TO_DISTRICT: Dict[str, str] = {
    "bengaluru": "Bengaluru Urban",
    "bangalore": "Bengaluru Urban",
    "mumbai": "Mumbai Suburban",
    "bombay": "Mumbai Suburban",
    "new delhi": "New Delhi",
    "chennai": "Chennai",
    "madras": "Chennai",
    "hyderabad": "Hyderabad",
    "secunderabad": "Hyderabad",
    "kolkata": "Kolkata",
    "calcutta": "Kolkata",
    "pune": "Pune",
    "ahmedabad": "Ahmedabad",
    "jaipur": "Jaipur",
    "gurugram": "Gurugram",
    "gurgaon": "Gurugram",
    "noida": "Gautam Buddha Nagar",
    "kochi": "Ernakulam",
    "cochin": "Ernakulam",
    "trivandrum": "Thiruvananthapuram",
    "thiruvananthapuram": "Thiruvananthapuram",
    "mysuru": "Mysuru",
    "mysore": "Mysuru",
    "bhubaneswar": "Khordha",
    "patna": "Patna",
    "coimbatore": "Coimbatore",
    "madurai": "Madurai",
    "tiruchirappalli": "Tiruchirappalli",
    "salem": "Salem",
    "lucknow": "Lucknow",
    "kanpur": "Kanpur",
    "varanasi": "Varanasi",
    "indore": "Indore",
    "bhopal": "Bhopal",
    "surat": "Surat",
    "vadodara": "Vadodara",
    "nagpur": "Nagpur",
    "nashik": "Nashik",
    "thane": "Thane",
    "gandhinagar": "Gandhi Nagar",
}

# Standard districts with their associated state
STANDARD_DISTRICTS: Dict[str, Tuple[str, str]] = {
    "central delhi": ("Central Delhi", "Delhi"),
    "east delhi": ("East Delhi", "Delhi"),
    "new delhi": ("New Delhi", "Delhi"),
    "north delhi": ("North Delhi", "Delhi"),
    "north east delhi": ("North East Delhi", "Delhi"),
    "north west delhi": ("North West Delhi", "Delhi"),
    "south delhi": ("South Delhi", "Delhi"),
    "south east delhi": ("South East Delhi", "Delhi"),
    "south west delhi": ("South West Delhi", "Delhi"),
    "west delhi": ("West Delhi", "Delhi"),
    "shahdara": ("Shahdara", "Delhi"),
    "coimbatore": ("Coimbatore", "Tamil Nadu"),
    "chennai": ("Chennai", "Tamil Nadu"),
    "patna": ("Patna", "Bihar"),
    "hyderabad": ("Hyderabad", "Telangana"),
    "bengaluru urban": ("Bengaluru Urban", "Karnataka"),
    "bengaluru rural": ("Bengaluru Rural", "Karnataka"),
    "mumbai suburban": ("Mumbai Suburban", "Maharashtra"),
    "mumbai city": ("Mumbai City", "Maharashtra"),
    "pune": ("Pune", "Maharashtra"),
    "gurugram": ("Gurugram", "Haryana"),
    "gautam buddha nagar": ("Gautam Buddha Nagar", "Uttar Pradesh"),
    "ernakulam": ("Ernakulam", "Kerala"),
    "thiruvananthapuram": ("Thiruvananthapuram", "Kerala"),
    "kolkata": ("Kolkata", "West Bengal"),
    "north 24 parganas": ("North 24 Parganas", "West Bengal"),
    "south 24 parganas": ("South 24 Parganas", "West Bengal"),
    "khordha": ("Khordha", "Odisha"),
    "jaipur": ("Jaipur", "Rajasthan"),
    "ahmedabad": ("Ahmedabad", "Gujarat"),
    "lucknow": ("Lucknow", "Uttar Pradesh"),
    "kanpur nagar": ("Kanpur Nagar", "Uttar Pradesh"),
    "mysuru": ("Mysuru", "Karnataka"),
    "gandhi nagar": ("Gandhi Nagar", "Gujarat"),
    "gandhinagar": ("Gandhi Nagar", "Gujarat"),
}

# Locality anchors for geographic conflict detection
KNOWN_LOCALITY_ANCHORS: Dict[str, Tuple[str, str]] = {
    "connaught place": ("New Delhi", "Delhi"),
    "darya ganj": ("Central Delhi", "Delhi"),
    "daryaganj": ("Central Delhi", "Delhi"),
    "shakarpur": ("East Delhi", "Delhi"),
    "hauz khas": ("South Delhi", "Delhi"),
    "kalkaji": ("South East Delhi", "Delhi"),
    "gandhipuram": ("Coimbatore", "Tamil Nadu"),
    "gandhipurm": ("Coimbatore", "Tamil Nadu"),
    "t nagar": ("Chennai", "Tamil Nadu"),
    "koramangala": ("Bengaluru Urban", "Karnataka"),
    "kormangala": ("Bengaluru Urban", "Karnataka"),
    "gachibowli": ("Hyderabad", "Telangana"),
    "hitech city": ("Hyderabad", "Telangana"),
    "bandra": ("Mumbai Suburban", "Maharashtra"),
    "andheri": ("Mumbai Suburban", "Maharashtra"),
    "hinjewadi": ("Pune", "Maharashtra"),
    "whitefield": ("Bengaluru Urban", "Karnataka"),
    "salt lake": ("North 24 Parganas", "West Bengal"),
    "cyber city": ("Gurugram", "Haryana"),
}

LANDMARK_INDICATORS: List[str] = [
    "opposite", "near", "behind", "adjacent to", "next to",
    "beside", "facing", "in front of", "close to", "metro station",
    "bus stop", "railway station", "flyover", "circle", "junction"
]

DISTRICT_SYNONYM_CLUSTERS: List[Set[str]] = [
    {"bangalore", "bangalore rural", "bengaluru", "bengaluru urban", "bengaluru rural"},
    {"gurgaon", "gurugram"},
    {"mumbai", "mumbai suburban", "bombay", "mumbai city"},
    {"calcutta", "kolkata"},
    {"madras", "chennai"},
    {"allahabad", "prayagraj"},
    {"benares", "banaras", "varanasi"},
    {"baroda", "vadodara"},
    {"trivandrum", "thiruvananthapuram"},
    {"calicut", "kozhikode"},
    {"cochin", "kochi", "ernakulam"},
    {"poona", "pune"},
    {"belgaum", "belagavi"},
    {"gulbarga", "kalaburagi"},
    {"mysore", "mysuru"},
    {"mangalore", "mangaluru", "dakshina kannada", "south kanara"},
    {"hubli", "hubballi", "dharwad"},
    {"shimoga", "shivamogga"},
    {"bijapur", "vijayapura"},
    {"bellary", "ballari"},
    {"aurangabad", "chhatrapati sambhajinagar"},
    {"faizabad", "ayodhya"},
    {"puducherry", "pondicherry"},
    {"cawnpore", "kanpur"},
    {"waltair", "vizag", "visakhapatnam"},
    {"gandhinagar", "gandhi nagar"},
    {"east delhi", "north east delhi", "north west delhi", "north delhi", "central delhi", "new delhi", "south delhi", "south west delhi", "west delhi", "delhi"}
]

STATE_SYNONYM_CLUSTERS: List[Set[str]] = [
    {"delhi", "new delhi", "national capital territory of delhi", "nct", "nct of delhi"},
    {"odisha", "orissa"},
    {"puducherry", "pondicherry"},
    {"uttarakhand", "uttaranchal"},
    {"jammu and kashmir", "jammu & kashmir"},
    {"andaman and nicobar islands", "andaman & nicobar", "andaman and nicobar"},
    {"dadra and nagar haveli and daman and diu", "dadra and nagar haveli", "daman and diu"}
]

def are_districts_compatible(dist1: Optional[str], dist2: Optional[str]) -> bool:
    if not dist1 or not dist2:
        return True
    d1 = dist1.strip().lower()
    d2 = dist2.strip().lower()
    if d1 == d2 or d1 in d2 or d2 in d1:
        return True
    for cluster in DISTRICT_SYNONYM_CLUSTERS:
        if d1 in cluster and d2 in cluster:
            return True
    return False

def are_states_compatible(state1: Optional[str], state2: Optional[str]) -> bool:
    if not state1 or not state2:
        return True
    s1 = state1.strip().lower()
    s2 = state2.strip().lower()
    if s1 == s2 or s1 in s2 or s2 in s1:
        return True
    for cluster in STATE_SYNONYM_CLUSTERS:
        if s1 in cluster and s2 in cluster:
            return True
    return False
