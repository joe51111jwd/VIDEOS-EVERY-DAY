import numpy as np, soundfile as sf
SR=44100; T=46.0; N=int(T*SR); rng=np.random.default_rng(7)
L=np.zeros(N); R=np.zeros(N)
def add(sig,t,g=1.0,pan=0.0):
    o=int(t*SR); e=min(N,o+len(sig)); s=sig[:e-o]
    L[o:e]+=s*g*(1-max(0,pan)); R[o:e]+=s*g*(1+min(0,pan))
def env(n,a,d):
    t=np.arange(n)/SR; return np.minimum(1,t/max(a,1e-4))*np.exp(-t/d)
def lp(x,a):  # one-pole lowpass
    y=np.zeros_like(x); s=0.0
    for i in range(len(x)): s+=a*(x[i]-s); y[i]=s
    return y
def kick():
    n=int(0.45*SR); t=np.arange(n)/SR
    f=45+110*np.exp(-t*35); ph=2*np.pi*np.cumsum(f)/SR
    return np.sin(ph)*np.exp(-t*7)*1.0 + rng.standard_normal(n)*np.exp(-t*300)*0.15
def clap():
    n=int(0.25*SR); t=np.arange(n)/SR; x=rng.standard_normal(n)
    x=x-lp(x,0.15); return x*np.exp(-t*22)*0.35
def hat(open_=False):
    n=int((0.18 if open_ else 0.05)*SR); t=np.arange(n)/SR; x=rng.standard_normal(n)
    x=x-lp(x,0.5); return x*np.exp(-t*(18 if open_ else 90))*0.12
def tick():
    n=int(0.04*SR); t=np.arange(n)/SR
    return (np.sin(2*np.pi*2400*t)+0.5*rng.standard_normal(n))*np.exp(-t*160)*0.22
def saw(f,n):
    t=np.arange(n)/SR; x=np.zeros(n)
    for k in range(1,12): x+=np.sin(2*np.pi*f*k*t+rng.random()*6)/k
    return x
def note(m): return 440*2**((m-69)/12)
def pad(chord,dur,g):
    n=int(dur*SR); x=np.zeros(n)
    for m in chord:
        for det in (-0.08,0.08): x+=saw(note(m)*(1+det/100*6),n)
    x=lp(x,0.04); a=np.minimum(1,np.arange(n)/(0.4*SR)); r=np.minimum(1,(n-np.arange(n))/(0.4*SR))
    return x*a*r*g/len(chord)
def bass(m,dur):
    n=int(dur*SR); t=np.arange(n)/SR
    x=np.sin(2*np.pi*note(m)*t)+0.3*np.sin(2*np.pi*note(m)*2*t)
    return x*np.minimum(1,t/0.005)*np.exp(-t*2.5)*0.45
def pluck(m):
    n=int(0.35*SR); t=np.arange(n)/SR
    x=np.sign(np.sin(2*np.pi*note(m)*t))*0.5+np.sin(2*np.pi*note(m)*t)
    return lp(x,0.25)*np.exp(-t*12)*0.12
def riser(dur):
    n=int(dur*SR); t=np.arange(n)/SR; x=rng.standard_normal(n)
    a=0.02+0.5*(t/dur)**2; y=np.zeros(n); s=0
    for i in range(n): s+=a[i]*(x[i]-s); y[i]=s
    sweep=np.sin(2*np.pi*np.cumsum(200+1800*(t/dur)**2)/SR)*0.08
    return (y*0.5+sweep)*(t/dur)**1.5
def boom():
    n=int(2.5*SR); t=np.arange(n)/SR
    f=30+60*np.exp(-t*6); return np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t*1.6)*0.9 + lp(rng.standard_normal(n),0.05)*np.exp(-t*3)*0.6
prog=[[57,60,64],[53,57,60],[48,52,55],[55,59,62]]  # Am F C G
roots=[33,29,36,31]
# intro: dark pad + clock ticks
add(pad([45,52,57,60],10.8,0.5),0.0)
for s in np.arange(0.5,10.0,1.0): add(tick(),s,1.0,0.3 if int(s)%2 else -0.3)
add(riser(1.5),10.5,0.9)
add(boom(),12.0,0.9)
# groove 12.0 - 40.5 at 120bpm
for b in range(24,81):
    t=b*0.5
    add(kick(),t,0.85)
    if b>=28 and b%2==1: add(clap(),t,1.0)
    if b>=28:
        add(hat(),t+0.25,1.0,0.2)
        if b%4==3: add(hat(True),t+0.25,0.8,-0.2)
for i,c in enumerate(range(24,81,4)):
    t=c*0.5; k=i%4
    add(pad(prog[k],2.0,0.35),t)
    add(bass(roots[k],0.48),t); add(bass(roots[k],0.48),t+0.75); add(bass(roots[k]+12,0.4),t+1.25)
    if t>=25.0:
        arp=prog[k]+[prog[k][0]+12]
        for j in range(8): add(pluck(arp[j%4]+12),t+j*0.25,1.0,(-0.4 if j%2 else 0.4))
add(riser(1.0),40.0,0.7)
add(boom(),41.0,0.8)
add(pad([45,52,57,60,64],5.0,0.45),41.0)
add(pluck(81),41.0,1.5); add(pluck(76),41.25,1.2); add(pluck(72),41.5,1.0)
m=np.stack([L,R],1); m/=np.max(np.abs(m)); m*=0.9
fade=np.ones(N); fo=int(1.5*SR); fade[-fo:]=np.linspace(1,0,fo); m*=fade[:,None]
sf.write('public/music.wav',m,SR); print('done')
