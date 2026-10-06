import numpy as np, soundfile as sf, json
SR=24000
starts={0:0.4,1:4.0,2:8.2,3:12.0,4:14.4,5:17.0,6:17.6,7:20.2,8:21.5,9:22.1,10:25.2,11:33.1,12:41.0}
gain={5:0.75,8:0.75}
spk={0:'n',1:'n',2:'n',3:'n',4:'u',5:'r',6:'u',7:'u',8:'r',9:'u',10:'n',11:'n',12:'n'}
T=46.0; n=int(T*SR)
tracks={k:np.zeros(n) for k in 'nur'}
for i,s in starts.items():
    a,sr=sf.read(f'public/vo/{i}.wav'); assert sr==SR
    o=int(s*SR); tracks[spk[i]][o:o+len(a)]+=a*gain.get(i,1.0)
mix=tracks['n']+tracks['u']+tracks['r']
mix=mix/np.max(np.abs(mix))*0.89
sf.write('public/vo_mix.wav',mix,SR)
fps=30; F=int(T*fps); env={}
for k,t in tracks.items():
    hop=SR//fps
    e=[float(np.sqrt(np.mean(t[f*hop:(f+1)*hop]**2))) for f in range(F)]
    m=max(e); env[k]=[round(min(1,x/m*1.6),3) for x in e]
json.dump(env,open('src/env.json','w'))
print('ok', F)
