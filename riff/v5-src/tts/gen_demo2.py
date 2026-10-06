import soundfile as sf, json
from kokoro_onnx import Kokoro
k = Kokoro("tts/kokoro-v1.0.onnx", "tts/voices-v1.0.bin")
R="af_bella"; U="af_heart"
lines = {
 "r1": (R, "Ooh, nice. Moody and dark... or bright and fun?", 1.05),
 "u2": (U, "Moody. Deep blue background...", 1.05),
 "u3": (U, "actually, make it green.", 1.05),
 "r2": (R, "Green it is. Should I add a saxophone?", 1.05),
 "u4": (U, "Yes! On the left.", 1.05),
 "r3": (R, "Done. Want the venue at the bottom, too?", 1.05),
}
out={}
for key,(v,t,s) in lines.items():
    a,sr=k.create(t,voice=v,speed=s,lang="en-us")
    sf.write(f"public/vo/d_{key}.wav",a,sr); out[key]=round(len(a)/sr,3)
print(json.dumps(out))
