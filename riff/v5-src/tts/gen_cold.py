import soundfile as sf, json
from kokoro_onnx import Kokoro
k = Kokoro("tts/kokoro-v1.0.onnx", "tts/voices-v1.0.bin")
lines = [
 ("af_heart", "Make it blue...", 1.1),
 ("af_heart", "no, green!", 1.1),
 ("af_heart", "Bigger title.", 1.1),
 ("af_heart", "Add a saxophone...", 1.1),
 ("af_heart", "on the left.", 1.1),
 ("am_michael", "That poster just designed itself... while she was still talking.", 1.05),
]
out={}
for i,(v,t,s) in enumerate(lines):
    a,sr=k.create(t,voice=v,speed=s,lang="en-us")
    sf.write(f"public/vo/c{i}.wav",a,sr); out[i]=round(len(a)/sr,3)
print(json.dumps(out))
