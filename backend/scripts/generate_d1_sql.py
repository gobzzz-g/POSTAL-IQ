import sqlite3
import os

def generate():
    conn = sqlite3.connect('postaliq.db')
    c = conn.cursor()
    c.execute('SELECT id, pin_code, post_office_name, office_type, delivery_status, locality, district, state, taluk, latitude, longitude, has_verified_coords FROM post_offices ORDER BY id')
    rows = c.fetchall()
    conn.close()

    os.makedirs('migrations/d1_data', exist_ok=True)

    def sql_escape(v):
        if v is None:
            return 'NULL'
        if isinstance(v, (int, float)):
            return str(v)
        if isinstance(v, bool):
            return '1' if v else '0'
        s = str(v).replace("'", "''")
        return f"'{s}'"

    batch_size = 100
    chunk_size = 25000  # 25,000 rows per file (~2.5 MB each)
    file_idx = 1
    cur_count = 0

    f = open(f'migrations/d1_data/chunk_{file_idx:02d}.sql', 'w', encoding='utf-8')

    for i in range(0, len(rows), batch_size):
        batch = rows[i:i+batch_size]
        values_list = []
        for r in batch:
            vals = [sql_escape(val) for val in r]
            values_list.append('(' + ', '.join(vals) + ')')
        
        stmt = 'INSERT OR REPLACE INTO post_offices (id, pin_code, post_office_name, office_type, delivery_status, locality, district, state, taluk, latitude, longitude, has_verified_coords) VALUES\n' + ',\n'.join(values_list) + ';\n'
        f.write(stmt)
        cur_count += len(batch)
        
        if cur_count >= chunk_size and (i + batch_size) < len(rows):
            f.close()
            file_idx += 1
            cur_count = 0
            f = open(f'migrations/d1_data/chunk_{file_idx:02d}.sql', 'w', encoding='utf-8')

    f.close()

    print(f'Generated {file_idx} chunk SQL files in migrations/d1_data/ for {len(rows)} records.')

if __name__ == '__main__':
    generate()
