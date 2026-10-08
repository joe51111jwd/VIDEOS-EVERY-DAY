import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Claim} from './Claim';
import {Clip, type ClipSpec} from './Clip';
import {End, type EndTile} from './End';
import {Hook} from './Hook';
import {Grain} from './brand/Grain';
import {Tag} from './brand/Tag';
import {loadFonts} from './brand/fonts';
import {C} from './brand/tokens';

export type Cut = ClipSpec & {
  at: number; // beat index where the clip starts
  beats: number; // length in beats
  tag?: {n: string; title: string; note?: string; inBeat?: number; outBeat?: number};
  flash?: number; // a white flash on the cut (0-1), for the big hits
};

/** A flash of light on a hard cut: full white for a frame, gone in five. */
const Flash: React.FC<{k: number}> = ({k}) => {
  const f = useCurrentFrame();
  const o = k * Math.max(0, 1 - f / 5);
  return o > 0 ? <AbsoluteFill style={{background: C.paper, opacity: o, mixBlendMode: 'screen'}} /> : null;
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
  tags?: {n: string; title: string; note?: string; from: number; to: number}[]; // chapter tags spanning several cuts (beats)
  cuts: Cut[];
  end: {atBeat: number; tiles: EndTile[]; stepBeats: number; markBeat: number};
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
        const from = bf(c.at);
        const dur = bf(c.at + c.beats) - from;
        // a stop that starts inside this cut freezes its picture from there on
        const stop = (ep.stops ?? []).find((s) => Math.round(s.from * fps) >= from && Math.round(s.from * fps) < from + dur);
        const cc = stop ? {...c, freezeAt: Math.round(stop.from * fps) - from} : c;
        return (
          <Sequence key={c.id} from={from} durationInFrames={dur} name={c.id}>
            <Clip c={cc} durF={dur} />
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
            <Tag n={t.n} title={t.title} note={t.note} inF={0} outF={d} />
          </Sequence>
        );
      })}
      {ep.slop ? (
        <Sequence from={0} durationInFrames={bf(ep.leaveBeat ?? 3) + 40} name="hook">
          <Hook slopSrc={ep.slop.src} slopFrom={ep.slop.from} strikeF={bf(ep.strikeBeat ?? 0)} leaveF={bf(ep.leaveBeat ?? 3)} />
        </Sequence>
      ) : null}
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
      <Grain opacity={0.06} />
      {ep.music ? <Audio src={staticFile(ep.music)} /> : null}
    </AbsoluteFill>
  );
};
