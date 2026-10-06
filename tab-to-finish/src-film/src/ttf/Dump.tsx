import React from 'react';
import {FILL_T, FLAGGED, L16, manual, T, TOTAL} from './timeline';
/** timeline numbers for the audio mix (read through calculateMetadata by audio/dump.mjs) */
export const dumpTimeline = () => {
	const m = manual(L16);
	return {T, TOTAL, FILL_T, FLAGGED, clicks: m.clicks, pastes: m.pastes.map((p) => p.t), sels: m.sels.map((s) => ({a: s.a, b: s.b}))};
};
export const Dump: React.FC = () => null;
