CREATE TABLE IF NOT EXISTS post_offices (
	id INTEGER NOT NULL PRIMARY KEY, 
	pin_code VARCHAR(6) NOT NULL, 
	post_office_name VARCHAR(150) NOT NULL, 
	office_type VARCHAR(30) NOT NULL, 
	delivery_status VARCHAR(30) NOT NULL, 
	locality VARCHAR(150) NOT NULL, 
	district VARCHAR(100) NOT NULL, 
	state VARCHAR(100) NOT NULL, 
	division VARCHAR(100), 
	region VARCHAR(100), 
	circle VARCHAR(100), 
	taluk VARCHAR(100), 
	telephone VARCHAR(50), 
	related_suboffice VARCHAR(150), 
	related_headoffice VARCHAR(150), 
	latitude REAL, 
	longitude REAL, 
	has_verified_coords BOOLEAN, 
	search_text TEXT, 
	dataset_version VARCHAR(50), 
	created_at DATETIME, 
	updated_at DATETIME
);

CREATE INDEX IF NOT EXISTS ix_post_offices_pin_code ON post_offices (pin_code);
CREATE INDEX IF NOT EXISTS ix_post_offices_post_office_name ON post_offices (post_office_name);
CREATE INDEX IF NOT EXISTS ix_post_offices_district ON post_offices (district);
CREATE INDEX IF NOT EXISTS ix_post_offices_state ON post_offices (state);
CREATE INDEX IF NOT EXISTS idx_district_state ON post_offices (district, state);
