import numpy as np, soundfile as sf, json
SR=24000; T=34.5; n=int(T*SR); rng=np.random.default_rng(5)
clips=[('c0',0.15,'u'),('c1',0.95,'u'),('c2',1.75,'u'),('c3',2.55,'u'),('c4',3.5,'u'),
 ('4',8.4,'u'),('d_r1',11.35,'r'),('d_u2',14.2,'u'),('d_u3',15.95,'u'),('d_r2',17.45,'r'),('d_u4',19.8,'u'),('d_r3',21.1,'r')]
tr={k:np.zeros(n) for k in 'ur'}
for name,s,k in clips:
    a,sr=sf.read(f'public/vo/{name}.wav'); assert sr==SR
    o=int(s*SR); tr[k][o:o+len(a)]+=a
# light room: short IR, 10% wet; Riff a touch more "produced" (slightly brighter, tiny room)
irl=int(0.5*SR); t=np.arange(irl)/SR; ir=rng.standard_normal(irl)*np.exp(-t*12)
L=1<<int(np.ceil(np.log2(n+irl)))
def room(x,w):
    y=np.fft.irfft(np.fft.rfft(x,L)*np.fft.rfft(ir,L),L)[:n]; y/= (np.max(np.abs(y))+1e-9)
    return x/ (np.max(np.abs(x))+1e-9) + y*w
mix=room(tr['u'],0.08)+room(tr['r'],0.10)
# gentle compression
mix=np.tanh(mix*1.4)/np.tanh(1.4); mix=mix/np.max(np.abs(mix))*0.89
sf.write('public/vo_v4.wav',mix,SR)
F=int(T*30); env={}
for k,x in tr.items():
    hop=SR//30; e=[float(np.sqrt(np.mean(x[f*hop:(f+1)*hop]**2))) for f in range(F)]
    m=max(e); env[k]=[round(min(1,v/m*1.6),3) for v in e]
json.dump(env,open('src/v4/env.json','w')); print('ok')
