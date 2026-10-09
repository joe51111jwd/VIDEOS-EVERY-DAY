import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Claim} from './Claim';
import {Clip, type ClipSpec} from './Clip';
import {End, type EndTile} from './End';
import {Hook} from './Hook';
import {Grain} from './brand/Grain';
import {Tag} from './brand/Tag';
import {Slab, type Line} from './brand/Slab';
import {loadFonts} from './brand/fonts';
import {C} from './brand/tokens';

export type Cut = ClipSpec & {
  at: number; // beat index where the clip starts
  beats: number; // length in beats
  tag?: {n: string; title: string; note?: string; inBeat?: number; outBeat?: number};
  flash?: number; // a white flash on the cut (0-1), for the big hits
  trans?: {type: 'fade' | 'white' | 'black'; beats: number}; // how this cut arrives: a crossfade over the previous one, or a dip through white/black centred on the cut
  bumps?: number[]; // beats (absolute) where a long shot kicks with the stomp
};

/** A dip through white or black, centred on a cut: up over the first half, down over the second. */
const Dip: React.FC<{color: string; durF: number}> = ({color, durF}) => {
  const f = useCurrentFrame();
  const h = durF / 2;
  const o = f < h ? f / h : Math.max(0, 1 - (f - h) / h);
  return <AbsoluteFill style={{background: color, opacity: Math.pow(o, 0.8)}} />;
};

/** Crossfade in: the incoming shot fades up over the outgoing one. */
const FadeIn: React.FC<{durF: number; children: React.ReactNode}> = ({durF, children}) => {
  const f = useCurrentFrame();
  const o = Math.min(1, f / Math.max(1, durF));
  return <AbsoluteFill style={{opacity: o * o * (3 - 2 * o)}}>{children}</AbsoluteFill>;
};

/** A flash of light on a hard cut: full white for a frame, gone in five. */
const Flash: React.FC<{k: number}> = ({k}) => {
  const f = useCurrentFrame();
  const o = k * Math.max(0, 1 - f / 5);
  return o > 0 ? <AbsoluteFill style={{background: C.paper, opacity: o, mixBlendMode: 'screen'}} /> : null;
};

export type TypeCue = {
  from: number; // beats
  to: number;
  lines: (Line & {inBeat?: number})[]; // each line lands on its beat (default: the cue's first beat)
  place: 'card' | 'top' | 'bottom'; // card: black frame, stack centred; top/bottom: over the picture
  width?: number; // the stack's width (default: the frame less the margins)
  gap?: number;
};

const MARGIN = 64;

const TypeCueView: React.FC<{q: TypeCue; a: number; bf: (b: number) => number}> = ({q, a, bf}) => {
  const {width: W, height: H} = useVideoConfig();
  const width = q.width ?? W - 2 * MARGIN;
  const left = (W - width) / 2;
  const lines = q.lines.map((l) => ({...l, inF: bf(l.inBeat ?? q.from) - a}));
  if (q.place === 'card') {
    return (
      <AbsoluteFill style={{background: C.black}}>
        <Slab lines={lines} width={width} left={left} vcenter={H} gap={q.gap ?? 0.09} />
      </AbsoluteFill>
    );
  }
  const top = q.place === 'top';
  return (
    <AbsoluteFill>
      {/* a shade on the side the type sits, so it reads over bright footage */}
      <AbsoluteFill style={{background: `linear-gradient(${top ? 'to bottom' : 'to top'}, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.38) 30%, rgba(0,0,0,0) 62%)`}} />
      <Slab lines={lines} width={width} left={left} top={top ? MARGIN * 0.75 : undefined} bottom={top ? undefined : MARGIN * 0.75} gap={q.gap ?? 0.14} />
    </AbsoluteFill>
  );
};

export type Episode = {
  reel: string;
  site: string;
  url: string;
  beatSec: number; // seconds per beat
  t0: number; // film seconds of beat 0
  slop?: {src: string; from: number}; // the cold open on a parody AI site (episodes); the opener starts on the portfolio instead
  strikeBeat?: number;
  leaveBeat?: number;
  tags?: {n: string; title: string; note?: string; from: number; to: number; corner?: 'bl' | 'br' | 'tl' | 'tr'}[]; // chapter tags spanning several cuts (beats)
  compactTags?: boolean; // a slate that hugs its text instead of a full-width band (landscape)
  cuts: Cut[];
  end?: {atBeat: number; tiles: EndTile[]; stepBeats: number; markBeat: number};
  type?: TypeCue[]; // Apple-ad type: stacks of stretched lines over the picture, or full-frame cards on black
  stops?: {from: number; to: number; lead: string; word: string}[]; // song stops, film seconds: the picture holds, a claim slams in
  durationSec: number;
  music?: string; // public path of the mixed soundtrack (preview only; final mux happens outside)
};

export const Film: React.FC<{ep: Episode}> = ({ep}) => {
  loadFonts();
  const fps = 60;
  const bf = (b: number) => Math.round((ep.t0 + b * ep.beatSec) * fps);
  return (
    <AbsoluteFill style={{background: C.black}}>
      {ep.cuts.map((c) => {
        const cutF = bf(c.at);
        // a crossfade starts the shot early, under the end of the previous one
        const ov = c.trans?.type === 'fade' ? Math.round(c.trans.beats * ep.beatSec * fps) : 0;
        const from = cutF - ov;
        const dur = bf(c.at + c.beats) - from;
        const bumped = c.bumps ? {...c, bumpF: c.bumps.map((b) => bf(b) - from)} : c;
        const src = ov ? {...bumped, from: Math.max(0, c.from - (ov / fps) * (c.speed ?? 1))} : bumped;
        // a stop that starts inside this cut freezes its picture from there on
        const stop = (ep.stops ?? []).find((s) => Math.round(s.from * fps) >= from && Math.round(s.from * fps) < from + dur);
        const cc = stop ? {...src, freezeAt: Math.round(stop.from * fps) - from} : src;
        const clip = <Clip c={cc} durF={dur} />;
        return (
          <Sequence key={c.id} from={from} durationInFrames={dur} name={c.id}>
            {ov ? <FadeIn durF={ov}>{clip}</FadeIn> : clip}
            {c.flash ? <Flash k={c.flash} /> : null}
            {c.tag ? (
              <Tag
                n={c.tag.n}
                title={c.tag.title}
                note={c.tag.note}
                inF={bf(c.at + (c.tag.inBeat ?? 0.5)) - from}
                outF={bf(c.at + (c.tag.outBeat ?? c.beats - 0.5)) - from}
              />
            ) : null}
          </Sequence>
        );
      })}
      {ep.cuts.filter((c) => c.trans && c.trans.type !== 'fade').map((c) => {
        const d = Math.round(c.trans!.beats * ep.beatSec * fps);
        return (
          <Sequence key={`dip-${c.id}`} from={bf(c.at) - Math.round(d / 2)} durationInFrames={d} name={`dip-${c.id}`}>
            <Dip color={c.trans!.type === 'white' ? C.paper : C.black} durF={d} />
          </Sequence>
        );
      })}
      {(ep.stops ?? []).map((s, i) => {
        const a = Math.round(s.from * fps);
        const d = Math.round(s.to * fps) - a;
        return (
          <Sequence key={`stop${i}`} from={a} durationInFrames={d} name={`stop-${s.word}`}>
            <Claim lead={s.lead} word={s.word} durF={d} />
          </Sequence>
        );
      })}
      {(ep.tags ?? []).map((t) => {
        const a = bf(t.from);
        const d = bf(t.to) - a;
        return (
          <Sequence key={`tag${t.n}`} from={a} durationInFrames={d + 10} name={`tag-${t.title}`}>
            <Tag n={t.n} title={t.title} note={t.note} inF={0} outF={d} compact={ep.compactTags} corner={t.corner} />
          </Sequence>
        );
      })}
      {ep.slop ? (
        <Sequence from={0} durationInFrames={bf(ep.leaveBeat ?? 3) + 40} name="hook">
          <Hook slopSrc={ep.slop.src} slopFrom={ep.slop.from} strikeF={bf(ep.strikeBeat ?? 0)} leaveF={bf(ep.leaveBeat ?? 3)} />
        </Sequence>
      ) : null}
      {ep.end ? (
        <Sequence from={bf(ep.end.atBeat)} name="end">
          <End
            tiles={ep.end.tiles}
            stepF={Math.round(ep.end.stepBeats * ep.beatSec * fps)}
            markF={bf(ep.end.markBeat) - bf(ep.end.atBeat)}
            reel={ep.reel}
            site={ep.site}
            url={ep.url}
          />
        </Sequence>
      ) : null}
      {(ep.type ?? []).map((q, i) => {
        const a = bf(q.from);
        return (
          <Sequence key={`type${i}`} from={a} durationInFrames={bf(q.to) - a} name={`type-${q.lines.map((l) => l.t).join(' ')}`}>
            <TypeCueView q={q} a={a} bf={bf} />
          </Sequence>
        );
      })}
      <Grain opacity={0.06} />
      {ep.music ? <Audio src={staticFile(ep.music)} /> : null}
    </AbsoluteFill>
  );
};
