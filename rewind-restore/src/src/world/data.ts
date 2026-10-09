import type {Tab} from '../apps/Browser';
import type {NoteDoc} from '../apps/Notes';
import type {SheetDoc} from '../apps/Sheet';
import type {TLine} from '../apps/Terminal';

export const HERO_TABS: Tab[] = [
	{fav: 'pg', title: "Do Things that Don't Scale"},
	{fav: 'stripe', title: 'Pricing & Fees | Stripe'},
	{fav: 'linear', title: 'Linear – Product development'},
	{fav: 'vercel', title: 'Vercel'},
	{fav: 'react', title: 'React'},
	{fav: 'tailwind', title: 'Tailwind CSS'},
	{fav: 'mdn', title: 'view-transition-name – MDN'},
	{fav: 'apple', title: 'AppKit | Apple Developer'},
	{fav: 'hn', title: 'Hacker News'},
	{fav: 'wiki', title: 'Undo – Wikipedia'},
	{fav: 'raycast', title: 'Raycast'},
	{fav: 'arxiv', title: 'Attention Is All You Need'},
];
/** the restored scroll position (CSS px): the highlighted line sits about a third down */
export const PG_SCROLL = 2916 - 190;

export const LAUNCH_NOTE: NoteDoc = {
	title: 'Northstar — launch plan',
	stamp: 'October 9, 2026 at 10:41 AM',
	list: [
		{title: 'Northstar — launch plan', when: '10:41 AM', preview: 'Ship Thursday, 9 AM PT'},
		{title: 'Pricing notes', when: '10:12 AM', preview: 'Free · Pro $15 · Team'},
		{title: 'Interview: Maya (Ramp)', when: 'Yesterday', preview: '"I rebuild my setup every…'},
		{title: 'Hiring plan Q4', when: 'Monday', preview: 'Founding designer first'},
		{title: 'Book list', when: 'Sunday', preview: 'High Output Management'},
	],
	blocks: [
		{k: 'p', text: 'Ship Thursday, 9 AM PT. One video, one link, reply to everyone.'},
		{k: 'h', text: 'Before launch'},
		{k: 'todo', text: 'Waitlist page live and tested on a phone', done: true},
		{k: 'todo', text: 'Cut the 30 s video to the beat', done: true},
		{k: 'todo', text: 'Pricing: Free · Pro $15 · Team $40/seat'},
		{k: 'todo', text: 'Line up 20 founders for first-day feedback'},
		{k: 'h', text: 'Positioning'},
		{k: 'p', text: 'Every analytics tool shows you the past. Northstar tells you what to do next.', hl: true},
	],
};

export const PRICING_SHEET: SheetDoc = {
	file: 'Northstar pricing model',
	tabs: ['Model', 'Cohorts', 'Assumptions'],
	title: 'Pricing model',
	cols: [
		{h: 'Plan', w: 126},
		{h: 'Price', w: 92, align: 'right'},
		{h: 'Users', w: 104, align: 'right'},
		{h: 'Conv.', w: 84, align: 'right'},
		{h: 'MRR', w: 128, align: 'right'},
	],
	rows: [
		['Free', '$0', '18,400', '—', '$0'],
		['Pro', '$15', '2,310', '12.6%', '$34,650'],
		['Team', '$40', '640', '3.5%', '$25,600'],
		['Enterprise', 'Custom', '12', '0.1%', '$18,000'],
	],
	total: ['Total', '', '21,362', '', '$78,250'],
	sel: [2, 4],
	bars: [0.32, 0.41, 0.55, 0.68, 0.84, 1],
};

const g = '#8BD18B';
const d = '#7C7C84';
const b = '#6CB6FF';
const y = '#E5C07B';
export const DEV_TERM: TLine[] = [
	[['~/projects/northstar', b], [' main', d], [' ❯ ', g], ['npm run dev', '#E6E6EA']],
	'',
	[['> northstar@0.9.2 dev', d]],
	[['> next dev --turbopack', d]],
	'',
	[['   ▲ Next.js 15.2.1', '#E6E6EA'], [' (Turbopack)', d]],
	[['   - Local:        ', d], ['http://localhost:3000', b]],
	'',
	[[' ✓ ', g], ['Ready in 1.2s', '#E6E6EA']],
	[[' ○ ', d], ['Compiling /pricing ...', '#E6E6EA']],
	[[' ✓ ', g], ['Compiled /pricing in 588ms', '#E6E6EA']],
	[[' GET ', y], ['/pricing ', '#E6E6EA'], ['200', g], [' in 612ms', d]],
];

export const CHAT_MSGS = [
	{who: 'dan' as const, name: 'Dan Whitfield', time: '2:02 PM', text: 'Pushed the pricing page, can someone sanity-check the Team tier?'},
	{who: 'maya' as const, name: 'Maya Lin', time: '2:09 PM', text: 'Design sync moved to 2:15, joining from the airport 🙃'},
	{who: 'theo' as const, name: 'Theo Park', time: '2:11 PM', text: 'Stripe webhook is failing on staging again'},
	{who: 'sofia' as const, name: 'Sofia Reyes', time: '2:14 PM', text: '@you where did we land on the launch video?'},
];
export const CHAT_CHANNELS = ['general', 'launch', 'design', 'eng', 'pricing', 'random'];

export const MAILS = [
	{from: 'Stripe', subj: 'Your payout of $12,418.20 is on the way', prev: 'Expected to arrive Friday, October 10.', time: '2:16 PM', unread: true},
	{from: 'Maya Lin', subj: 'Re: launch video — v3', prev: 'Love the cut. One thing on the end card…', time: '2:03 PM', unread: true},
	{from: 'Linear', subj: '14 issues assigned to you', prev: 'NOR-482 Pricing toggle flickers on Safari', time: '1:48 PM', unread: true},
	{from: 'Vercel', subj: 'Deployment failed: northstar-web', prev: 'Build error in app/pricing/page.tsx', time: '1:31 PM', unread: true},
	{from: 'Calendar', subj: 'Invitation: Design sync @ 2:15 PM', prev: 'Maya Lin has invited you', time: '1:02 PM'},
	{from: 'Dan Whitfield', subj: 'Q4 hiring plan', prev: 'Attached the doc we talked about', time: '12:40 PM'},
	{from: 'GitHub', subj: '[northstar] PR #212 needs your review', prev: 'feat: annual billing toggle', time: '12:12 PM', unread: true},
];

export const CALL_PEOPLE = [
	{who: 'maya' as const, name: 'Maya Lin', talking: true},
	{who: 'dan' as const, name: 'Dan Whitfield'},
	{who: 'sofia' as const, name: 'Sofia Reyes'},
	{who: 'leo' as const, name: 'Leo Grant'},
];

const kw = '#C586C0';
const fn = '#DCDCAA';
const st = '#CE9178';
const ty = '#4EC9B0';
const vr = '#9CDCFE';
const cm = '#6A9955';
export const CODE_LINES: TLine[] = [
	[['import', kw], [' { ', '#CCC'], ['useState', vr], [' } ', '#CCC'], ['from', kw], [" 'react'", st]],
	[['import', kw], [' { ', '#CCC'], ['Toggle', vr], [' } ', '#CCC'], ['from', kw], [" '@/components/ui/toggle'", st]],
	'',
	[['const', '#569CD6'], [' PLANS', vr], [' = [', '#CCC']],
	[['  { ', '#CCC'], ['name', vr], [': ', '#CCC'], ["'Pro'", st], [', ', '#CCC'], ['monthly', vr], [': ', '#CCC'], ['15', '#B5CEA8'], [', ', '#CCC'], ['annual', vr], [': ', '#CCC'], ['144', '#B5CEA8'], [' },', '#CCC']],
	[['  { ', '#CCC'], ['name', vr], [': ', '#CCC'], ["'Team'", st], [', ', '#CCC'], ['monthly', vr], [': ', '#CCC'], ['40', '#B5CEA8'], [', ', '#CCC'], ['annual', vr], [': ', '#CCC'], ['384', '#B5CEA8'], [' },', '#CCC']],
	[[']', '#CCC']],
	'',
	[['export', kw], [' default', kw], [' function', '#569CD6'], [' Pricing', fn], ['() {', '#CCC']],
	[['  const', '#569CD6'], [' [', '#CCC'], ['annual', vr], [', ', '#CCC'], ['setAnnual', fn], ['] = ', '#CCC'], ['useState', fn], ['(', '#CCC'], ['false', '#569CD6'], [')', '#CCC']],
	[['  // fix: flicker on Safari when toggling', cm]],
	[['  return', kw], [' (', '#CCC']],
	[['    <', '#808080'], ['section', '#569CD6'], [' className', vr], ['=', '#CCC'], ['"mx-auto max-w-5xl py-24"', st], ['>', '#808080']],
	[['      <', '#808080'], ['Toggle', ty], [' pressed', vr], ['={', '#CCC'], ['annual', vr], ['} ', '#CCC'], ['onPressedChange', vr], ['={', '#CCC'], ['setAnnual', fn], ['} />', '#808080']],
	[['      {', '#CCC'], ['PLANS', vr], ['.', '#CCC'], ['map', fn], ['((', '#CCC'], ['p', vr], [') => (', '#CCC']],
	[['        <', '#808080'], ['PlanCard', ty], [' key', vr], ['={', '#CCC'], ['p', vr], ['.', '#CCC'], ['name', vr], ['} ', '#CCC'], ['plan', vr], ['={', '#CCC'], ['p', vr], ['} ', '#CCC'], ['annual', vr], ['={', '#CCC'], ['annual', vr], ['} />', '#808080']],
	[['      ))}', '#CCC']],
	[['    </', '#808080'], ['section', '#569CD6'], ['>', '#808080']],
	[['  )', '#CCC']],
	[['}', '#CCC']],
];
export const CODE_FILES = ['app/', '  layout.tsx', '  page.tsx', '  pricing/', '  page.tsx', 'components/', '  plan-card.tsx', '  ui/', 'lib/', 'package.json'];
