import numpy as np, soundfile as sf
SR=44100; T=34.5; N=int(T*SR); rng=np.random.default_rng(11)
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
# --- arrangement ---
B=0.5  # 120 bpm
prog=[[53,57,60,64],[57,60,64,67],[50,53,57,60],[48,52,55,59]]  # Fmaj7 Am7 Dm7 Cmaj7
roots=[41,45,38,36]
# S1 cold open 0-4.3: pulse + accent hits on each spoken change
for i,t0 in enumerate(np.arange(0,4.3,B)):
    add(kick(0.55),t0)
    for k in range(4): add(shaker(),t0+k*B/4,1.0,pan=0.3 if k%2 else -0.3)
for t0 in [0.55,1.3,1.95,3.0,3.85]:
    add(clap(),t0,1.0,rev=0.25); add(tick(),t0,1.0)
chord(prog[0],0.0,2.0,0.8); chord(prog[1],2.0,2.3,0.8)
add(sub(roots[0],2.0),0.0); add(sub(roots[1],2.3),2.0)
add(swell(1.0),3.3,0.6)
add(hit(),4.3,0.9,rev=0.4)
# S2 reveal 6.1
add(hit(),6.1,0.8,rev=0.6)
add(shimmer(65,3.5),6.1,1.0,rev=0.8)
chord([53,60,64,69],6.1,2.0,0.9)
add(swell(0.6),7.4,0.5)
# S3 demo groove 8.0-24.0, soft so the voices sit on top
t0=8.0; i=0
while t0<24.0-1e-6:
    k=i%4
    chord(prog[k],t0,2.0,0.7)
    add(sub(roots[k],1.9,0.85),t0)
    for b in range(4):
        tb=t0+b*B
        if b in (0,2): add(kick(0.45),tb)
        for s_ in range(4): add(shaker(),tb+s_*B/4,0.7,pan=0.3 if s_%2 else -0.3)
    t0+=2.0; i+=1
add(swell(0.8),23.2,0.6)
# S4 montage 24-30: full beat, an accent on every cut
cuts=[24.0,25.5,27.0,28.5]
for j,c in enumerate(cuts):
    add(hit(),c,0.45+0.1*j,rev=0.4); add(clap(),c,1.2,rev=0.3)
    chord([m+12 for m in prog[j]],c,1.5,0.55); chord(prog[j],c,1.5,0.7)
    add(sub(roots[j],1.45,1.0),c)
t0=24.0
while t0<30.0-1e-6:
    add(kick(0.6),t0)
    for s_ in range(4): add(shaker(),t0+s_*B/4,1.0,pan=0.3 if s_%2 else -0.3)
    t0+=B
add(swell(1.0),29.0,0.7)
# S5 end 30.0
add(hit(),30.0,0.9,rev=0.5)
chord([41,48,53,57,60,64],30.0,4.5,1.0,0.03)
add(shimmer(77,4.5),30.0,1.0,rev=0.8)
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
sf.write('public/music_v4.wav',mix,SR); print('ok')
