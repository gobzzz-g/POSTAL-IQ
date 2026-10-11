import re
from typing import Dict

# Dictionary of standard abbreviations found in Indian postal addresses
INDIAN_ADDRESS_ABBREVIATIONS: Dict[str, str] = {
    # Thoroughfare & Navigation
    r"\brd\b": "road",
    r"\bst\b": "street",
    r"\bave\b": "avenue",
    r"\bmrg\b": "marg",
    r"\bln\b": "lane",
    r"\bcl\b": "cross",
    r"\bmn\b": "main",
    r"\bmain rd\b": "main road",
    r"\b1st\b": "first",
    r"\b2nd\b": "second",
    r"\b3rd\b": "third",
    r"\b4th\b": "fourth",
    
    # Premise & Housing
    r"\bflt\b": "flat",
    r"\bapt\b": "apartment",
    r"\bapts\b": "apartments",
    r"\bbldg\b": "building",
    r"\bsoc\b": "society",
    r"\bhsg\b": "housing",
    r"\bhse\b": "house",
    r"\bno\b": "number",
    r"\bsec\b": "sector",
    r"\bsct\b": "sector",
    r"\bblk\b": "block",
    r"\bph\b": "phase",
    r"\blyt\b": "layout",
    r"\bext\b": "extension",
    r"\bextn\b": "extension",
    r"\bcol\b": "colony",
    r"\bclny\b": "colony",
    r"\bngr\b": "nagar",
    r"\bpuram\b": "puram",
    r"\bindl\b": "industrial",
    r"\bind\b": "industrial",
    r"\best\b": "estate",
    
    # Relative positions / landmarks
    r"\bopp\b": "opposite",
    r"\bopposite to\b": "opposite",
    r"\bnr\b": "near",
    r"\bb/h\b": "behind",
    r"\bbh\b": "behind",
    r"\badj\b": "adjacent to",
    r"\bstn\b": "station",
    r"\brly\b": "railway",
    r"\bhosp\b": "hospital",
    
    # Postal & Administrative
    r"\bpo\b": "post office",
    r"\bp\.o\b": "post office",
    r"\bgpo\b": "general post office",
    r"\bho\b": "head post office",
    r"\bso\b": "sub post office",
    r"\bbo\b": "branch post office",
    r"\bdt\b": "district",
    r"\bdist\b": "district",
    r"\btal\b": "taluk",
    r"\btk\b": "taluk",
    
    # Prominent Indian Acronyms
    r"\bcp\b": "connaught place",
    r"\bbkc\b": "bandra kurla complex",
    r"\becity\b": "electronic city",
    r"\bitpb\b": "itpb whitefield",
    r"\bomr\b": "old mahabalipuram road",
    r"\bhsr\b": "hsr layout",
    
    # State standard abbreviations
    r"\bka\b": "karnataka",
    r"\bmh\b": "maharashtra",
    r"\bdl\b": "delhi",
    r"\btn\b": "tamil nadu",
    r"\bts\b": "telangana",
    r"\btg\b": "telangana",
    r"\bwb\b": "west bengal",
    r"\bup\b": "uttar pradesh",
    r"\bgj\b": "gujarat",
    r"\bkl\b": "kerala",
    r"\brj\b": "rajasthan",
    r"\bhr\b": "haryana",
    r"\bmp\b": "madhya pradesh",
    r"\bap\b": "andhra pradesh",
    r"\bpb\b": "punjab",
    r"\bod\b": "odisha",
    r"\bbr\b": "bihar",
    r"\bjh\b": "jharkhand",
}

def expand_abbreviations(text: str) -> str:
    expanded = text
    for pattern, replacement in INDIAN_ADDRESS_ABBREVIATIONS.items():
        expanded = re.sub(pattern, replacement, expanded, flags=re.IGNORECASE)
    return expanded
