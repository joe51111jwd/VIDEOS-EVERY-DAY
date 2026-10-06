import numpy as np, soundfile as sf, json
SR=24000; T=8.5; n=int(T*SR)
starts={0:0.15,1:0.95,2:1.75,3:2.55,4:3.5,5:4.5}
spk={0:'u',1:'u',2:'u',3:'u',4:'u',5:'n'}
tr={'u':np.zeros(n),'n':np.zeros(n)}
for i,s in starts.items():
    a,sr=sf.read(f'public/vo/c{i}.wav'); o=int(s*SR); tr[spk[i]][o:o+len(a)]+=a
mix=tr['u']+tr['n']; mix=mix/np.max(np.abs(mix))*0.89
sf.write('public/vo_cold.wav',mix,SR)
env={}
for k,t in tr.items():
    hop=SR//30; e=[float(np.sqrt(np.mean(t[f*hop:(f+1)*hop]**2))) for f in range(int(T*30))]
    m=max(e); env[k]=[round(min(1,x/m*1.6),3) for x in e]
json.dump(env,open('src/env_cold.json','w'))
# music sting
SR2=44100; N=int(T*SR2); rng=np.random.default_rng(3); L=np.zeros(N)
def add(s,t,g=1):
    o=int(t*SR2); e=min(N,o+len(s)); L[o:e]+=s[:e-o]*g
def lp(x,a):
    y=np.zeros_like(x); s=0.0
    for i in range(len(x)): s+=a*(x[i]-s); y[i]=s
    return y
def hit():
    m=int(0.5*SR2); t=np.arange(m)/SR2
    k=np.sin(2*np.pi*np.cumsum(45+140*np.exp(-t*30))/SR2)*np.exp(-t*6)
    c=rng.standard_normal(m); c=(c-lp(c,0.2))*np.exp(-t*25)*0.35
    return k+c
def boom():
    m=int(3*SR2); t=np.arange(m)/SR2
    return np.sin(2*np.pi*np.cumsum(28+70*np.exp(-t*5))/SR2)*np.exp(-t*1.2)+lp(rng.standard_normal(m),0.04)*np.exp(-t*2.5)*0.7
def bass(f,d):
    m=int(d*SR2); t=np.arange(m)/SR2
    return (np.sin(2*np.pi*f*t)+0.4*np.sign(np.sin(2*np.pi*f*t)))*np.exp(-t*3)*0.35
for t,f in [(0.0,55),(0.55,55),(1.3,65.4),(1.95,73.4),(3.0,82.4),(3.85,98)]:
    add(hit(),t,0.9); add(bass(f,0.5),t)
# hats driving between hits
for t in np.arange(0.0,4.2,0.125):
    m=int(0.04*SR2); x=rng.standard_normal(m); x=(x-lp(x,0.5))*np.exp(-np.arange(m)/SR2*90)*0.08
    add(x,t)
add(boom(),4.3,1.0)
# low tension pad 4.3-8.5
m=int(4.2*SR2); t=np.arange(m)/SR2; pad=np.zeros(m)
for f in (110,164.8,220,261.6):
    for d in (-0.3,0.3): pad+=np.sin(2*np.pi*(f+d)*t)
pad=pad*np.minimum(1,t/1.0)*0.06
add(pad,4.3)
L/=np.max(np.abs(L)); L*=0.9
sf.write('public/music_cold.wav',np.stack([L,L],1),SR2); print('ok')
