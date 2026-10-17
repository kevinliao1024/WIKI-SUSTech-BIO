"""Compare a local SONAR teaching fixture against the original frozen scientific engine.
Usage: python scripts/verify_sonar_source.py /path/to/SAP/program
Requires the existing SAP Python environment. Reads inputs; never copies raw FCS.
"""
import sys
import json
import hashlib
from pathlib import Path
import numpy as np

source = Path(sys.argv[1]).resolve()
sys.path.insert(0, str(source / 'scientific_reference/src'))
import science_api as api
root = Path(__file__).resolve().parents[1]
data = json.loads((root/'static/sonar-contribution/data/flow.v1.json').read_text())
context = api.load_context()
assert data['contextId'] == context['context_id']
assert data['analysisVersion'] == context['ras_estimator_id']
for sample in data['samples']:
    path = source/'scientific_reference'/sample['sourceFile']
    assert hashlib.sha256(path.read_bytes()).hexdigest() == sample['sha256']
    original = api.process_fcs(path, context)
    x = original['array']
    assert len(x) == sample['originalCount']
    for row in sample['events']:
        i = row[0]
        np.testing.assert_array_equal(row[1:6], x[i, [1, 3, 0, 9, 5]])
        assert row[6:] == [bool(original['masks'][k][i]) for k in ['quality','cell','singlet','reporter']]
    for gate, count in sample['counts'].items():
        assert count == int(original['masks'][gate].sum())
    if sample['id'] != 'S7_MOCK1':
        result = api.calculate_ras(original)
        assert abs(result['ras'] - sample['ras']['ras']) < 1e-12
        # Independently use selected raw paired channels and source background.
        selected = x[original['masks']['reporter']]
        ratio = float((selected[:,5]-data['background']['green']).sum()/(selected[:,9]-data['background']['red']).sum())
        assert abs(ratio - sample['ras']['ras']) < 1e-12
        knots, values = data['model']['knots'],data['model']['values']
        inverse = float(np.interp(ratio,values,knots))
        assert abs(inverse-sample['res']['res_mass_fraction']) < 1e-12
    print(sample['id'], 'PASS raw events, masks, full counts and applicable RAS/RES')
print('PASS: no numeric or gate-membership difference from frozen source at 1e-12 ratio tolerance.')
