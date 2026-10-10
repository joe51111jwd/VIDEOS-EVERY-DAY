"""Write the film's timing file from the edit: verb starts, the break's downbeat kick, the two final chants, the end."""
import os
import json, sys
W = os.environ.get('MUSIC', '/home/user/work/music/')
E = json.load(open(W + 'medley/edl.json'))
M = lambda j: E['p0'] + j * E['P']
verbs = json.load(open(W + 'medley/verbs_edit.json'))
KICK = -0.0183           # kicks sit 18 ms ahead of the grid beat in the edit
CHANT = -0.025           # the chant's first consonant vs its grid beat
out = {
    'beat': E['P'],
    'filmStartSrc': 0.0,
    'verbs': verbs,
    'hits': {'lock': round(M(64) + KICK, 4), 'chant1': round(M(66) + CHANT, 4), 'chant2': round(M(70) + CHANT, 4)},
    'end': 34.27,
}
json.dump(out, open(sys.argv[1], 'w'), indent=1)
print('verbs', len(verbs), 'first', verbs[0]['src'], 'last', verbs[-1]['src'], 'hits', out['hits'], 'end', out['end'])
