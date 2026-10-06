import React from 'react';
import {FILL_T, FLAGGED, L16, manual, OP, OPEN, openSt, SHIFT, T, TOTAL} from './timeline';
/** timeline numbers for the audio mix (read through calculateMetadata by audio/dump.mjs) */
export const dumpTimeline = () => {
	const m = manual(L16);
	return {T, TOTAL, FILL_T, FLAGGED, OPEN, SHIFT, OP, openSt: Array.from({length: Math.round(OPEN * 60) + 1}, (_, k) => openSt(k / 60)), clicks: m.clicks, pastes: m.pastes.map((p) => p.t), sels: m.sels.map((s) => ({a: s.a, b: s.b}))};
};
export const Dump: React.FC = () => null;
