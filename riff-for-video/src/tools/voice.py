"""Cut the ElevenLabs takes into one stereo 48 kHz wav per line and write word times for the captions.
usage: python tools/voice.py <takes_dir>   (takes_dir holds l<N>.mp3 from Higgsfield's ElevenLabs TTS)
Each line: (id, take, text, keep-ranges in seconds). Word times come from faster-whisper on the cut file."""
import json, subprocess, sys
import numpy as np
import soundfile as sf

TAKES = sys.argv[1]
LINES = [
    ('cut', 'l1', 'Cut here.', None),
    ('lose', 'l2', 'Lose that.', None),
    ('moody', 'l3', 'Make it moody.', None),
    ('back', 'l4', 'Play that back.', [(0.62, 9)]),
    ('remove', 'l5', 'Hmm, remove that cut.', None),
    ('trim', 'l6', 'Trim two seconds off the end.', None),
    ('here', 'l7', 'Slow-mo from here…', None),
    ('there', 'l8', '…to there.', None),
    ('color', 'l9', 'Open color.', None),
    ('teal', 'l10', 'Deep teal.', None),
    ('less', 'l11', 'Little less.', None),
    ('goback', 'l12', 'Perfect. Go back.', [(0, 0.86), (1.66, 9)]),
    ('smile', 'l13', 'Find the shot where she smiles.', None),
    ('beat', 'l14', 'Cut it to the beat.', None),
    ('vertical', 'l15', 'Make a vertical one for X.', None),
]
SR = 48000

def load(path):
    pcm = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout
    return np.frombuffer(pcm, dtype=np.float32).copy()

def trim_silence(a, thr=0.008, pad=0.02):
    env = np.abs(a)
    idx = np.where(env > thr)[0]
    if not len(idx):
        return a
    s = max(0, idx[0] - int(pad * SR))
    e = min(len(a), idx[-1] + int(0.06 * SR))
    return a[s:e]

def fade(a, ms=6):
    n = int(SR * ms / 1000)
    a[:n] *= np.linspace(0, 1, n)
    a[-n:] *= np.linspace(1, 0, n)
    return a

from faster_whisper import WhisperModel
model = WhisperModel('small.en', device='cpu', compute_type='int8')
out = {}
for lid, take, text, keep in LINES:
    a = load(f'{TAKES}/{take}.mp3')
    if keep:
        parts = [fade(a[int(s * SR):int(min(e, len(a) / SR) * SR)].copy(), 8) for s, e in keep]
        a = np.concatenate(parts)
    a = fade(trim_silence(a))
    # level: peak-normalise to -3 dBFS, the mix sets the final level
    a = a / (np.max(np.abs(a)) + 1e-9) * 0.707
    sf.write(f'public/vo/{lid}.wav', np.stack([a, a], 1), SR, subtype='PCM_16')
    a16 = subprocess.run(['ffmpeg', '-v', 'error', '-i', f'public/vo/{lid}.wav', '-ac', '1', '-ar', '16000', '-f', 'f32le', '-'], capture_output=True).stdout
    segs, _ = model.transcribe(np.frombuffer(a16, dtype=np.float32), word_timestamps=True, beam_size=5)
    words = [[w.word.strip(), round(float(w.start), 3), round(float(w.end), 3)] for s in segs for w in s.words]
    out[lid] = {'text': text, 'dur': round(len(a) / SR, 3), 'words': words}
    print(lid, out[lid]['dur'], ' '.join(w[0] for w in words), [w[1] for w in words])
json.dump(out, open('src/edit/vo.json', 'w'), indent=1)
