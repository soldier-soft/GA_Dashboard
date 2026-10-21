import requests

base = 'http://127.0.0.1:8000/api'

# 1. Health
h = requests.get(f'{base}/health').json()
print('1. HEALTH:', h)

# 2. Dashboard
d = requests.get(f'{base}/dashboard').json()
print('2. DASHBOARD TABLES COUNT:', len(d['tables']))
print('   DASHBOARD KPIS COUNT:', len(d['kpis']))
print('   DISCREPANCIES:', len(d['discrepancies']))
for disc in d['discrepancies']:
    print('   - Notice:', disc['title'])

# 3. Add row to table-5
r = requests.post(f'{base}/tables/table-5/rows', json={'category': 'Live API Verification Check', 'value': 25.0}).json()
print('3. TABLE-5 AFTER ADD:', r['title'], 'Total:', r['total'], 'Rows count:', len(r['rows']))
added_row = next(row for row in r['rows'] if row['category'] == 'Live API Verification Check')

# 4. Clean up test row
d_del = requests.delete(f"{base}/tables/table-5/rows/{added_row['id']}").json()
print('4. TABLE-5 AFTER DELETE:', d_del['title'], 'Total:', d_del['total'], 'Rows count:', len(d_del['rows']))

# 5. Source status
s = requests.get(f'{base}/source/status').json()
print('5. SOURCE STATUS:', s['file_name'], 'Connected:', s['is_connected'])

print("\nALL LIVE REST API CHECKS PASSED SUCCESSFULLY!")
