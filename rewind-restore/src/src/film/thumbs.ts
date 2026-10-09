import type {TLThumb} from '../rr/Timeline';
import {stripP} from './plan';

/** thumbnails for the Today strip: one every 45 min from 9:00 AM to 4:30 PM (rendered by tools/thumbs.mjs) */
export const HOOK_THUMB_MINS = [540, 585, 630, 675, 720, 765, 810, 855, 900, 945, 990];
export const HOOK_THUMBS: TLThumb[] = HOOK_THUMB_MINS.map((m) => ({src: 'h-' + m}));
export const HOOK_TICKS = [
	[540, '9 AM'],
	[600, '10'],
	[660, '11'],
	[720, '12 PM'],
	[780, '1'],
	[840, '2'],
	[900, '3'],
	[960, '4'],
].map(([m, t]) => ({p: stripP(m as number), t: t as string}));
export const HOOK_CHIPS = [
	{p0: stripP(625), p1: stripP(735), t: 'Deep work · Northstar launch'},
	{p0: stripP(855), p1: stripP(940), t: 'Design sync'},
];
