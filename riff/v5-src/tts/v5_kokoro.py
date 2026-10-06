# Placeholder voices (local Kokoro). The real pass uses v5_eleven.py.
import json, soundfile as sf
from kokoro_onnx import Kokoro
k = Kokoro("tts/kokoro-v1.0.onnx", "tts/voices-v1.0.bin")
V = {"Maya": ("af_heart", 1.06), "Riff": ("af_bella", 1.04)}
for ln in json.load(open("tts/v5_lines.json")):
    v, sp = V[ln["who"]]
    a, sr = k.create(ln["text"], voice=v, speed=sp, lang="en-us")
    sf.write(f"public/v5/vo/{ln['id'].replace('?', '_q')}.wav", a, sr)
    print(ln["id"], round(len(a) / sr, 2))
