import React from 'react';
import {Browser} from '../apps/Browser';
import {Notes} from '../apps/Notes';
import {Sheet} from '../apps/Sheet';
import {Code, Terminal} from '../apps/Terminal';
import {Call, Chat, Mail} from '../apps/Social';
import type {WinBox} from '../mac/Window';
import {CALL_PEOPLE, CHAT_CHANNELS, CHAT_MSGS, CODE_FILES, CODE_LINES, DEV_TERM, HERO_TABS, LAUNCH_NOTE, MAILS, PG_SCROLL, PRICING_SHEET} from './data';

export type Ctx = {focused: boolean; tabsShown?: number; tabPop?: (i: number) => number; scroll?: number; hl?: number; termShown?: number};
export type WinSpec = {id: string; box: WinBox; el: (box: WinBox, c: Ctx) => React.ReactNode};

const web = (id: string, box: WinBox, src: string, url: string, tabs: {fav: string; title: string}[], active = 0, scroll = 0, dark = false): WinSpec => ({
	id,
	box,
	el: (b, c) => <Browser box={b} tabs={tabs} active={active} url={url} page={{src, scroll, dark}} focused={c.focused} />,
});

// ---------------------------------------------------------------- 10:42 AM: the perfect setup (tiled)
export const HERO: WinSpec[] = [
	{id: 'sheet', box: {x: 1150, y: 580, w: 742, h: 472}, el: (b, c) => <Sheet box={b} doc={PRICING_SHEET} focused={c.focused} />},
	{id: 'term', box: {x: 28, y: 702, w: 1110, h: 350}, el: (b, c) => <Terminal box={b} title="northstar — zsh — 132×18" lines={DEV_TERM} focused={c.focused} shown={c.termShown} />},
	{id: 'notes', box: {x: 1150, y: 48, w: 742, h: 520}, el: (b, c) => <Notes box={b} doc={LAUNCH_NOTE} focused={c.focused} hl={c.hl ?? 1} />},
	{
		id: 'safari',
		box: {x: 28, y: 48, w: 1110, h: 642},
		el: (b, c) => <Browser box={b} tabs={HERO_TABS} active={0} url="paulgraham.com/ds.html" page={{src: 'pg', scroll: c.scroll ?? PG_SCROLL}} focused={c.focused} shown={c.tabsShown} tabPop={c.tabPop} />,
	},
];
export const HERO_FOCUS = 'safari';

// ---------------------------------------------------------------- the day piling on (spawn order)
const T = (fav: string, title: string) => ({fav, title});
export const CHAOS: WinSpec[] = [
	{id: 'mail', box: {x: 150, y: 330, w: 900, h: 600}, el: (b, c) => <Mail box={b} mails={MAILS} focused={c.focused} />},
	{id: 'call', box: {x: 1010, y: 120, w: 820, h: 560}, el: (b, c) => <Call box={b} title="Design sync" people={CALL_PEOPLE} focused={c.focused} />},
	web('verge', {x: 260, y: 80, w: 1180, h: 760}, 'verge', 'theverge.com', [T('verge', 'The Verge'), T('x', 'Home / X'), T('github', 'Pull requests')], 0, 0, true),
	{id: 'chat', box: {x: 880, y: 380, w: 900, h: 620}, el: (b, c) => <Chat box={b} channel="launch" channels={CHAT_CHANNELS} msgs={CHAT_MSGS} focused={c.focused} />},
	web('mbp', {x: 90, y: 160, w: 1120, h: 720}, 'mbp', 'apple.com/macbook-pro', [T('apple', 'MacBook Pro - Apple'), T('verge', 'The Verge')], 0, 0, true),
	web('maps', {x: 700, y: 210, w: 1080, h: 700}, 'gmaps', 'google.com/maps', [T('gmaps', 'Google Maps'), T('stripe', 'Stripe Dashboard')]),
	web('hn', {x: 330, y: 300, w: 980, h: 700}, 'hn', 'news.ycombinator.com', [T('hn', 'Hacker News'), T('x', 'Home / X'), T('linear', 'Inbox – Linear')]),
	web('stripe', {x: 760, y: 90, w: 1080, h: 720}, 'stripe', 'stripe.com/pricing', [T('stripe', 'Pricing & Fees | Stripe'), T('hn', 'Hacker News')]),
];

// ---------------------------------------------------------------- earlier moments (the montage)
export type Moment = {id: string; day: string; time: string; label: string; wins: WinSpec[]; focus: string};
export const MOMENTS: Moment[] = [
	{
		id: 'm-yday',
		day: 'Yesterday',
		time: '6:40 PM',
		label: 'Fixing the pricing toggle',
		focus: 'code',
		wins: [
			web('localhost', {x: 1010, y: 60, w: 880, h: 640}, 'shadcn', 'localhost:3000/pricing', [T('shadcn', 'Northstar – Pricing'), T('mdn', 'MDN')], 0, 0, true),
			{id: 'term2', box: {x: 1010, y: 712, w: 880, h: 340}, el: (b, c) => <Terminal box={b} title="northstar — zsh" lines={DEV_TERM.slice(0, 9)} focused={c.focused} />},
			{id: 'code', box: {x: 30, y: 60, w: 968, h: 992}, el: (b, c) => <Code box={b} file="page.tsx" files={CODE_FILES} lines={CODE_LINES} focused={c.focused} first={1} />},
		],
	},
	{
		id: 'm-mon',
		day: 'Monday',
		time: '4:15 PM',
		label: 'Investor update',
		focus: 'linear',
		wins: [
			web('vercel2', {x: 640, y: 70, w: 1250, h: 780}, 'vercel', 'vercel.com/northstar', [T('vercel', 'Vercel'), T('github', 'GitHub')], 0, 0, true),
			web('linear', {x: 40, y: 230, w: 1150, h: 800}, 'linear', 'linear.app/northstar', [T('linear', 'Linear'), T('notion', 'Roadmap')], 0, 0, true),
		],
	},
	{
		id: 'm-sun',
		day: 'Sunday',
		time: '11:48 PM',
		label: 'Late-night research',
		focus: 'arxiv',
		wins: [
			web('wiki', {x: 980, y: 52, w: 910, h: 640}, 'wiki', 'en.wikipedia.org/wiki/Undo', [T('wiki', 'Undo – Wikipedia'), T('arxiv', 'arXiv')]),
			web('claude', {x: 1060, y: 470, w: 830, h: 580}, 'anthropic', 'platform.claude.com/docs', [T('claude', 'Claude Docs')], 0, 0, true),
			web('arxiv', {x: 30, y: 52, w: 1000, h: 980}, 'arxiv', 'arxiv.org/abs/1706.03762', [T('arxiv', 'Attention Is All You Need'), T('wiki', 'Undo – Wikipedia'), T('claude', 'Claude Docs'), T('hn', 'Hacker News')]),
		],
	},
	{
		id: 'm-thu',
		day: 'Last Thursday',
		time: '10:30 AM',
		label: 'Offsite planning',
		focus: 'maps2',
		wins: [
			web('raycast', {x: 1000, y: 90, w: 890, h: 600}, 'raycast', 'raycast.com', [T('raycast', 'Raycast')], 0, 0, true),
			web('maps2', {x: 40, y: 160, w: 1180, h: 870}, 'gmaps', 'google.com/maps', [T('gmaps', 'Google Maps'), T('stripe', 'Stripe')]),
		],
	},
	{
		id: 'm-tue',
		day: 'Sep 30',
		time: '9:05 AM',
		label: 'Design review',
		focus: 'tw',
		wins: [
			web('react2', {x: 960, y: 300, w: 930, h: 740}, 'react', 'react.dev', [T('react', 'React')], 0, 0, true),
			web('tw', {x: 30, y: 60, w: 1180, h: 800}, 'tailwind', 'tailwindcss.com', [T('tailwind', 'Tailwind CSS'), T('react', 'React')], 0, 0, true),
		],
	},
];
