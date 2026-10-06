import soundfile as sf, json, sys
from kokoro_onnx import Kokoro
k = Kokoro("tts/kokoro-v1.0.onnx", "tts/voices-v1.0.bin")
N, U, R = "am_michael", "af_heart", "af_nicole"
lines = [
 (N, "Every AI you've ever talked to... makes you wait.", 1.0),
 (N, "You talk. It waits. It thinks. And then, finally, it answers.", 1.0),
 (N, "That's not a conversation. That's a walkie-talkie.", 1.0),
 (N, "This is Riff.", 0.95),
 (U, "Make me a poster for a jazz night, Friday at nine.", 1.05),
 (R, "Mm-hmm.", 1.0),
 (U, "Big serif title. Deep blue background...", 1.05),
 (U, "actually, make it green.", 1.05),
 (R, "On it.", 1.0),
 (U, "And put the saxophone on the left.", 1.05),
 (N, "Riff designs while you're still talking. It listens, builds, and changes its mind mid-sentence. Just like you do.", 1.05),
 (N, "First pixels in two seconds. Real, editable designs. No text box. No send button. Just talk.", 1.05),
 (N, "Riff. Design at the speed of your voice.", 0.95),
]
out = {}
for i,(v,t,s) in enumerate(lines):
    a, sr = k.create(t, voice=v, speed=s, lang="en-us")
    sf.write(f"public/vo/{i}.wav", a, sr)
    out[i] = round(len(a)/sr, 3)
print(json.dumps(out))
