import numpy as np, soundfile as sf
import json
SR=44100; T=38.5; N=int(T*SR); rng=np.random.default_rng(11)
def buf(): return np.zeros((N,2))
dry=buf(); send=buf()  # send -> reverb
def add(sig,t,g=1.0,pan=0.0,rev=0.0):
    o=int(t*SR); e=min(N,o+len(sig)); s=sig[:e-o]*g
    l=s*np.sqrt(0.5*(1-pan)); r=s*np.sqrt(0.5*(1+pan))
    dry[o:e,0]+=l; dry[o:e,1]+=r
    if rev: send[o:e,0]+=l*rev; send[o:e,1]+=r*rev
def tt(d): return np.arange(int(d*SR))/SR
def note(m): return 440*2**((m-69)/12)
def onepole(x,a):
    # vectorized-ish lowpass via cumulative approach (IIR) - loop in chunks
    y=np.empty_like(x); s=0.0
    for i in range(len(x)): s+=a*(x[i]-s); y[i]=s
    return y
# --- instruments ---
def ep(m,d,vel=1.0):  # electric piano: sine + decaying 2nd/3rd + bell partial
    t=tt(d); f=note(m)
    x=np.sin(2*np.pi*f*t)+0.35*np.exp(-t*3)*np.sin(2*np.pi*2*f*t)+0.12*np.exp(-t*6)*np.sin(2*np.pi*3.01*f*t)\
      +0.06*np.exp(-t*9)*np.sin(2*np.pi*7.02*f*t)
    env=np.minimum(1,t/0.006)*np.exp(-t*1.1)*np.minimum(1,(d-t)/0.15)
    return x*env*0.22*vel
def chord(ms,t0,d,g=1.0,spread=0.012):
    for i,m in enumerate(ms): add(ep(m,d,0.9),t0+i*spread,g,pan=(i-len(ms)/2)*0.15,rev=0.45)
def sub(m,d,g=1.0):
    t=tt(d); x=np.sin(2*np.pi*note(m)*t)
    return x*np.minimum(1,t/0.01)*np.minimum(1,(d-t)/0.05)*np.exp(-t*0.8)*0.5*g
def kick(g=1.0):
    t=tt(0.4); f=42+95*np.exp(-t*38)
    return np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t*8)*0.9*g
def shaker():
    t=tt(0.06); x=rng.standard_normal(len(t)); x=np.diff(np.concatenate([[0],x]))
    return x*np.exp(-t*70)*0.035
def clap():
    t=tt(0.3); x=rng.standard_normal(len(t)); x=x-onepole(x,0.2)
    e=np.exp(-t*30)+0.6*np.exp(-np.maximum(0,t-0.012)*30)*(t>0.012)
    return x*e*0.12
def tick():
    t=tt(0.03); return np.sin(2*np.pi*3200*t)*np.exp(-t*220)*0.08
def hit():  # cinematic low hit
    t=tt(3.0); f=38+40*np.exp(-t*7)
    x=np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t*1.4)
    n=onepole(rng.standard_normal(len(t)),0.03)*np.exp(-t*4)*0.8
    return (x+n)*0.8
def swell(d):
    t=tt(d); x=rng.standard_normal(len(t))
    y=onepole(x,0.02)+onepole(x,0.08)*(t/d)
    return y*(t/d)**2*0.35
def shimmer(m,d):
    t=tt(d); x=sum(np.sin(2*np.pi*note(m+k)*t+rng.random()*6) for k in (0,7,12,19,24))
    return x*np.minimum(1,t/0.8)*np.exp(-t*0.6)*0.03
# --- arrangement (driven by the v5 cue sheet) ---
C={c['id']:c for c in json.load(open('src/v5/cues.json'))}
B=0.5
prog=[[53,57,60,64],[57,60,64,67],[50,53,57,60],[48,52,55,59]]
roots=[41,45,38,36]
warm=C['warm']['a']+0.3; big=C['big']['a']+0.4; menu=C['menu']['a']+0.45
pull=C['app?']['a']+0.25; title=C['app?']['b']+0.15; resume=C['yes']['a']-0.25
usual=C['sure']['a']+0.35; poster=C['bold']['a']+0.3; cup=C['cup']['a']+0.55; story=C['yes2']['a']+0.15
extras=C['extras']['a']+0.3; end=C['love']['b']+0.6
# S1 cold open: tight pulse, accents on each spoken change
t0=0.0
while t0<pull-1e-6:
    add(kick(0.5),t0)
    for k in range(4): add(shaker(),t0+k*B/4,0.9,pan=0.3 if k%2 else -0.3)
    t0+=B
for a in [0.85,warm,big,menu]:
    add(clap(),a,0.9,rev=0.25); add(tick(),a,1.0)
chord(prog[0],0.0,2.0,0.75); chord(prog[1],2.0,2.0,0.75); chord(prog[2],4.0,pull-4.0+0.6,0.7)
add(sub(roots[0],2.0),0.0); add(sub(roots[1],2.0),2.0); add(sub(roots[2],pull-4.0+0.5),4.0)
add(swell(title-pull),pull,0.8)
# title: the drop
add(hit(),title,1.0,rev=0.5)
add(shimmer(65,3.0),title,1.0,rev=0.8)
chord([41,48,53,57,60],title,2.2,0.9,0.02)
add(swell(0.5),resume-0.5,0.4)
# S2 groove through the app + poster
t0=resume; i=0
while t0<extras-1e-6:
    k=i%4
    chord(prog[k],t0,2.0,0.62)
    add(sub(roots[k],1.9,0.8),t0)
    for b in range(4):
        tb=t0+b*B
        if b in (0,2): add(kick(0.42),tb)
        for s_ in range(4): add(shaker(),tb+s_*B/4,0.65,pan=0.3 if s_%2 else -0.3)
    t0+=2.0; i+=1
for a in [usual,poster,cup,story]:
    add(hit(),a,0.35,rev=0.4); add(clap(),a,0.8,rev=0.3)
# S3 extras: full beat, brighter
t0=extras; i=0
while t0<end-1e-6:
    k=i%4
    chord([m+12 for m in prog[k]],t0,2.0,0.5); chord(prog[k],t0,2.0,0.65)
    add(sub(roots[k],1.9,1.0),t0)
    for b in range(4):
        tb=t0+b*B
        add(kick(0.58),tb)
        if b in (1,3): add(clap(),tb,1.0,rev=0.2)
        for s_ in range(4): add(shaker(),tb+s_*B/4,1.0,pan=0.3 if s_%2 else -0.3)
    t0+=2.0; i+=1
add(swell(1.0),end-1.0,0.7)
# S4 end
add(hit(),end+0.5,0.9,rev=0.5)
chord([41,48,53,57,60,64],end+0.5,4.5,1.0,0.03)
add(shimmer(77,4.5),end+0.5,1.0,rev=0.8)
# --- reverb: convolve send with synthetic IR ---
irl=int(2.6*SR); t=np.arange(irl)/SR
ir=np.stack([rng.standard_normal(irl),rng.standard_normal(irl)],1)*np.exp(-t*2.4)[:,None]
ir[:,0]=onepole(ir[:,0],0.35); ir[:,1]=onepole(ir[:,1],0.35)
n=1<<int(np.ceil(np.log2(N+irl)))
wet=np.stack([np.fft.irfft(np.fft.rfft(send[:,c],n)*np.fft.rfft(ir[:,c],n),n)[:N] for c in range(2)],1)
wet/=np.max(np.abs(wet))+1e-9
mix=dry/np.max(np.abs(dry))+wet*0.35
mix=np.tanh(mix*1.2)/np.tanh(1.2)
fo=int(1.2*SR); mix[-fo:]*=np.linspace(1,0,fo)[:,None]
mix/=np.max(np.abs(mix)); mix*=0.9
sf.write('public/v5/music.wav',mix,SR); print('ok')
