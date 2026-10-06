import numpy as np, soundfile as sf, json
SR=24000; D=5.0; T=46.0+D; n=int(T*SR)
clips=[('0',0.4,'n'),('1',4.0,'n'),('2',8.2,'n'),('3',12.0,'n'),('4',14.4,'u'),
 ('d_r1',17.35,'r'),('d_u2',20.2,'u'),('d_u3',21.95,'u'),('d_r2',23.45,'r'),('d_u4',25.8,'u'),('d_r3',27.1,'r'),
 ('10',25.2+D,'n'),('11',33.1+D,'n'),('12',41.0+D,'n')]
tr={k:np.zeros(n) for k in 'nur'}
for name,s,k in clips:
    a,sr=sf.read(f'public/vo/{name}.wav'); assert sr==SR
    o=int(s*SR); tr[k][o:o+len(a)]+=a
mix=tr['n']+tr['u']+tr['r']; mix=mix/np.max(np.abs(mix))*0.89
sf.write('public/vo_mix2.wav',mix,SR)
F=int(T*30); env={}
for k,t in tr.items():
    hop=SR//30; e=[float(np.sqrt(np.mean(t[f*hop:(f+1)*hop]**2))) for f in range(F)]
    m=max(e); env[k]=[round(min(1,x/m*1.6),3) for x in e]
json.dump(env,open('src/env.json','w')); print('ok',F)
