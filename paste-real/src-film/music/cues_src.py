# Builds the source cue sheet for the ALL CAPS instrumental (source time, seconds):
# bars/beats from the measured downbeats, drum hits from the Demucs drum stem, stops and slams.
import json, os
D = os.path.dirname(os.path.abspath(__file__))
ev = json.load(open(f'{D}/analysis/drum_events.json'))
db = json.load(open(f'{D}/analysis/downbeats.json'))
down = {d['bar']: d['downbeat'] for d in db if d['bar'] <= 36}
beats = []
for k in range(1, 36):
    a, b = down[k], down[k + 1]
    q = (b - a) / 4
    for j in range(4):
        beats.append({'t': round(a + j * q, 4), 'bar': k, 'beat': j + 1})
hits = []
for e in ev:
    if e['t'] < 4.7 or e['t'] > 100: continue
    if e['c'] == 'S' and e['s'] >= 0.85 and e['cent'] > 2900: kind = 'snare'
    elif e['c'] == 'K' and e['s'] >= 0.45: kind = 'kick'
    elif e['c'] == 'h' and e['s'] >= 0.45: kind = 'hat'
    else: continue
    hits.append({'t': e['t'], 'kind': kind, 's': e['s']})
cues = {
    'bpm': 87.435,
    'intro': {'chordA': 0.026, 'chordB': 3.05, 'drumsIn': 4.795, 'loopIn': 5.83},
    'downbeats': down,
    'beats': beats,
    'hits': hits,
    'stops': [
        {'from': 25.79, 'to': 26.749, 'slamBar': 9},
        {'from': 31.58, 'to': 32.235, 'slamBar': 11},
        {'from': 43.83, 'to': 45.952, 'slamBar': 16},
        {'from': 97.58, 'to': 98.09, 'slamBar': 35},
    ],
    'sections': [
        {'name': 'intro', 'from': 0.0, 'to': 4.795},
        {'name': 'A1 (bars 1-2, intro groove)', 'from': 4.795, 'to': 10.285},
        {'name': 'A (bars 3-6, 1-bar loop)', 'from': 10.285, 'to': 21.266},
        {'name': 'turn (bars 7-8, stop)', 'from': 21.266, 'to': 26.753},
        {'name': 'B (bars 9-14, 2-bar loop, stop at 10)', 'from': 26.753, 'to': 43.223},
        {'name': 'long stop (bar 15)', 'from': 43.223, 'to': 45.954},
        {'name': 'B2 (bars 16-24)', 'from': 45.954, 'to': 70.67},
        {'name': 'A again (bars 26-30)', 'from': 73.4, 'to': 87.1},
    ],
}
json.dump(cues, open(f'{D}/cues_src.json', 'w'), indent=1)
print(len(beats), 'beats', len(hits), 'hits', sum(h['kind']=='snare' for h in hits), 'snares', sum(h['kind']=='kick' for h in hits), 'kicks')
