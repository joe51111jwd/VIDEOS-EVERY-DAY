// Virtual-time shim for frame-perfect capture of live websites.
// Injected before any page script. Freezes the page's clock (performance.now, Date,
// requestAnimationFrame, timers, Web Animations / CSS animations + transitions, <video>)
// and advances it only when the capture driver calls __vt.step(dt).
(() => {
  if (window.__vt) return;
  const cfg = window.__VT_CFG || {};
  const nRAF = window.requestAnimationFrame.bind(window);
  const nCAF = window.cancelAnimationFrame.bind(window);
  const nST = window.setTimeout.bind(window);
  const nCT = window.clearTimeout.bind(window);
  const nSI = window.setInterval.bind(window);
  const nCI = window.clearInterval.bind(window);
  const nPerfNow = performance.now.bind(performance);
  const NDate = Date;
  const nDateNow = Date.now.bind(Date);

  const V = {
    now: nPerfNow(),           // virtual performance.now() at the current step
    dateBase: nDateNow() - nPerfNow(),
    calls: 0,                  // intra-step nudges so busy-wait loops still terminate
    raf: [], rafId: 1e9,
    timers: new Map(), timerId: 1e9,
    anims: new Map(),          // Animation -> {t, playing}
    media: new Map(),          // HTMLMediaElement -> {t, playing, rvfc: []}
    freeRun: false,
    frame: 0,
    nRAF,
  };
  window.__vt = V;

  const vnow = () => { V.calls++; return V.now + Math.min(V.calls * 0.0005, 15); };
  performance.now = vnow;
  const vDateNow = () => Math.floor(V.dateBase + vnow());
  class VDate extends NDate {
    constructor(...a) { if (a.length === 0) super(vDateNow()); else super(...a); }
    static now() { return vDateNow(); }
  }
  window.Date = VDate;

  window.requestAnimationFrame = (cb) => { const id = ++V.rafId; V.raf.push({ id, cb }); return id; };
  window.cancelAnimationFrame = (id) => { const i = V.raf.findIndex((r) => r.id === id); if (i >= 0) V.raf.splice(i, 1); };
  const addTimer = (cb, d, args, interval) => {
    const id = ++V.timerId;
    d = Math.max(0, Number(d) || 0);
    if (typeof cb !== 'function') { const src = String(cb); cb = () => (0, eval)(src); }
    V.timers.set(id, { due: V.now + d, cb, args, interval: interval ? Math.max(1, d) : 0, seq: id });
    return id;
  };
  window.setTimeout = (cb, d, ...args) => addTimer(cb, d, args, false);
  window.setInterval = (cb, d, ...args) => addTimer(cb, d, args, true);
  window.clearTimeout = window.clearInterval = (id) => { V.timers.delete(id); };

  // ---- optional GPU spoof (sites that downgrade on software renderers)
  if (cfg.gpu) {
    for (const C of [window.WebGLRenderingContext, window.WebGL2RenderingContext]) {
      if (!C) continue;
      const gp = C.prototype.getParameter;
      C.prototype.getParameter = function (p) {
        if (p === 0x9246) return cfg.gpu;            // UNMASKED_RENDERER_WEBGL
        if (p === 0x9245) return 'Google Inc. (Apple)'; // UNMASKED_VENDOR_WEBGL
        return gp.call(this, p);
      };
    }
  }

  // ---- Web Animations (also CSS animations and transitions)
  const AP = Animation.prototype;
  const nPlay = AP.play, nPause = AP.pause, nFinish = AP.finish, nCancel = AP.cancel, nReverse = AP.reverse;
  const ctDesc = Object.getOwnPropertyDescriptor(AP, 'currentTime');
  const setCT = (a, t) => ctDesc.set.call(a, t);
  const getCT = (a) => ctDesc.get.call(a);
  const isDocTimeline = (a) => a.timeline === document.timeline;
  AP.play = function () { nPlay.call(this); const s = V.anims.get(this); if (s) { s.t = getCT(this) ?? 0; s.playing = true; nPause.call(this); setCT(this, s.t); } };
  AP.reverse = function () { nReverse.call(this); const s = V.anims.get(this); if (s) { s.t = getCT(this) ?? 0; s.playing = true; nPause.call(this); setCT(this, s.t); } };
  AP.pause = function () { nPause.call(this); const s = V.anims.get(this); if (s) { s.playing = false; s.t = getCT(this) ?? s.t; } };
  AP.finish = function () { V.anims.delete(this); nFinish.call(this); };
  AP.cancel = function () { V.anims.delete(this); nCancel.call(this); };
  Object.defineProperty(AP, 'currentTime', {
    configurable: true, enumerable: ctDesc.enumerable,
    get() { return getCT(this); },
    set(t) { setCT(this, t); const s = V.anims.get(this); if (s && t != null) s.t = Number(t); },
  });

  function stepAnimations(dt) {
    let list;
    try { list = document.getAnimations(); } catch { return; }
    const live = new Set(list);
    for (const [a] of V.anims) if (!live.has(a)) V.anims.delete(a);
    for (const a of list) {
      if (!isDocTimeline(a)) continue;
      let s = V.anims.get(a);
      const st = a.playState;
      if (!s) {
        if (st === 'finished' || st === 'idle') continue;
        // new since last step: freeze at its start (it began at this virtual instant)
        s = { t: st === 'paused' ? (getCT(a) ?? 0) : 0, playing: st !== 'paused' };
        V.anims.set(a, s);
        nPause.call(a); setCT(a, s.t);
        continue;
      }
      if (st === 'running') { // resumed natively (e.g. CSS animation-play-state)
        s.playing = true; s.t = getCT(a) ?? s.t; nPause.call(a);
      }
      if (!s.playing) continue;
      const rate = a.playbackRate;
      s.t += dt * rate;
      let end = Infinity;
      try { end = a.effect ? a.effect.getComputedTiming().endTime : Infinity; } catch {}
      if (rate > 0 && s.t >= end) { V.anims.delete(a); nPlay.call(a); nFinish.call(a); continue; }
      if (rate < 0 && s.t <= 0) { V.anims.delete(a); nPlay.call(a); nFinish.call(a); continue; }
      setCT(a, s.t);
    }
  }

  // ---- media
  const MP = HTMLMediaElement.prototype;
  const mPlay = MP.play, mPause = MP.pause;
  const pausedDesc = Object.getOwnPropertyDescriptor(MP, 'paused');
  const mctDesc = Object.getOwnPropertyDescriptor(MP, 'currentTime');
  const mGetCT = (m) => mctDesc.get.call(m);
  const mSetCT = (m, t) => mctDesc.set.call(m, t);
  const mstate = (m) => { let s = V.media.get(m); if (!s) { s = { t: mGetCT(m) || 0, playing: false, rvfc: [], frames: 0 }; V.media.set(m, s); } return s; };
  MP.play = function () {
    const s = mstate(this);
    this.muted = true;
    if (!s.playing) { s.playing = true; this.dispatchEvent(new Event('play')); nST(() => this.dispatchEvent(new Event('playing')), 0); }
    if (!pausedDesc.get.call(this)) mPause.call(this);
    return Promise.resolve();
  };
  MP.pause = function () {
    const s = mstate(this);
    const was = s.playing; s.playing = false;
    if (!pausedDesc.get.call(this)) mPause.call(this);
    if (was) this.dispatchEvent(new Event('pause'));
  };
  Object.defineProperty(MP, 'paused', { configurable: true, get() { const s = V.media.get(this); return s ? !s.playing : pausedDesc.get.call(this); } });
  Object.defineProperty(MP, 'currentTime', {
    configurable: true,
    get() { const s = V.media.get(this); return s ? s.t : mGetCT(this); },
    set(t) { const s = mstate(this); s.t = Number(t) || 0; mSetCT(this, s.t); },
  });
  if (window.HTMLVideoElement && HTMLVideoElement.prototype.requestVideoFrameCallback) {
    HTMLVideoElement.prototype.requestVideoFrameCallback = function (cb) { const s = mstate(this); const id = ++V.rafId; s.rvfc.push({ id, cb }); return id; };
    HTMLVideoElement.prototype.cancelVideoFrameCallback = function (id) { const s = V.media.get(this); if (s) s.rvfc = s.rvfc.filter((r) => r.id !== id); };
  }
  const visible = (m) => {
    if (!m.isConnected) return false;
    const r = m.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return false;
    return r.bottom > -50 && r.top < innerHeight + 50 && r.right > -50 && r.left < innerWidth + 50;
  };
  const seek = (m, t) => new Promise((res) => {
    if (Math.abs(mGetCT(m) - t) < 1e-4 && m.readyState >= 2) return res(true);
    let done = false;
    const fin = (ok) => { if (done) return; done = true; m.removeEventListener('seeked', on); res(ok); };
    const on = () => fin(true);
    m.addEventListener('seeked', on);
    mSetCT(m, t);
    nST(() => fin(false), cfg.seekTimeout || 4000);
  });
  async function stepMedia(dt) {
    for (const m of document.querySelectorAll('video,audio')) {
      if (!V.media.has(m) && !pausedDesc.get.call(m)) { // native autoplay started it
        const s = mstate(m); s.playing = true; s.t = mGetCT(m); mPause.call(m); m.muted = true;
      }
    }
    const waits = [];
    for (const [m, s] of V.media) {
      if (!m.isConnected) { V.media.delete(m); continue; }
      if (!pausedDesc.get.call(m)) mPause.call(m);
      if (!s.playing) continue;
      const d = m.duration;
      s.t += (dt / 1000) * (m.playbackRate || 1);
      if (isFinite(d) && d > 0 && s.t >= d) {
        if (m.loop) s.t = s.t % d;
        else { s.t = d; s.playing = false; m.dispatchEvent(new Event('ended')); }
      }
      if (visible(m) || s.rvfc.length) {
        waits.push(seek(m, s.t).then(() => {
          s.frames++;
          const cbs = s.rvfc; s.rvfc = [];
          for (const r of cbs) { try { r.cb(V.now, { mediaTime: s.t, presentedFrames: s.frames, width: m.videoWidth, height: m.videoHeight, expectedDisplayTime: V.now }); } catch (e) { console.error(e); } }
        }));
      }
    }
    if (waits.length) await Promise.all(waits);
  }

  function runTimers() {
    let guard = 0;
    while (guard++ < 5000) {
      let best = null;
      for (const [id, t] of V.timers) if (t.due <= V.now && (!best || t.due < best[1].due || (t.due === best[1].due && t.seq < best[1].seq))) best = [id, t];
      if (!best) break;
      const [id, t] = best;
      if (t.interval) { t.due += t.interval; t.seq = ++V.timerId; } else V.timers.delete(id);
      try { t.cb(...(t.args || [])); } catch (e) { console.error(e); }
    }
  }
  function runRAF() {
    const q = V.raf; V.raf = [];
    for (const r of q) { try { r.cb(V.now); } catch (e) { console.error(e); } }
  }

  // One frame of virtual time.
  V.step = async (dtMs) => {
    V.now += dtMs; V.calls = 0; V.frame++;
    runTimers();
    runRAF();
    stepAnimations(dtMs);
    await stepMedia(dtMs);
  };
  V.nativeFrame = (n = 1) => new Promise((res) => { const go = (k) => (k <= 0 ? res() : nRAF(() => go(k - 1))); go(n); });
  // Free-run: advance the clock with the real display (used while a page loads).
  V.startFreeRun = (dt = 1000 / 60) => {
    if (V.freeRun) return; V.freeRun = true;
    const tick = async () => {
      if (!V.freeRun) return;
      if (V.stopWhen) { let hit = false; try { hit = !!V.stopWhen(); } catch {} if (hit) { V.freeRun = false; V.stopped = true; return; } }
      V.ticking = V.step(dt); await V.ticking; V.ticking = null;
      nRAF(tick);
    };
    nRAF(tick);
  };
  V.stopFreeRun = async () => { V.freeRun = false; if (V.ticking) await V.ticking; };
  if (cfg.freeRun !== false) V.startFreeRun();
})();
