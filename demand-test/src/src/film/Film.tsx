import React, {useMemo} from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {BoardFrame, FlipWipe} from '../flap/Scenes';
import {Board, boardSize, counter, geom, schedule, Msg} from '../flap/Flap';
import {C, E, FPS, H, W, kf, prog} from '../lib/theme';
import {at, hit, WORD, CLUNK, DING, END} from './beats';
import {Phone, Notif} from '../ui/Phone';
import {Browser} from '../ui/kit';
import {AppPrompt} from '../ui/AppPrompt';
import {Store} from '../ui/Store';
import {Ads} from '../ui/Ads';
import {Buyers} from '../ui/Buyers';
import {Verdict} from '../ui/Verdict';

// beats are counted from the film's first downbeat, 7 to a bar (Money is in 7/4)
const b = (k: number) => at(Math.floor(k / 7), k % 7);

// ---- the main board: 13 x 5, carries every big line
const MAIN = geom(13, 5, 1700);
const MAIN_MSGS: Msg[] = [
	{t: b(0), lines: ['STOP BUILDING', 'THINGS NOBODY', 'WANTS.'], flips: [3, 7]}, // the loop's first thud
	{t: b(14), lines: ['ggggggggggggg', '', 'BUILD IT.', '', 'ggggggggggggg'], top: 0}, // the bass comes in
	{t: b(50.5), lines: ['NOT OPINIONS.', ''], top: 1},
	{t: hit(WORD), lines: ['NOT OPINIONS.', '', 'MONEY.'], top: 1, flips: [3, 6]}, // whole on the sung word's first consonant
];
// ---- the logo: the register clunk after the stop flips the frame to it, the bell fills the prism
const LOGO_MSGS: Msg[] = [
	{t: 0, lines: ['', 'g DEMAND TEST', '', 'KNOW BEFORE', 'YOU BUILD.'], top: 0},
	{t: hit(DING), lines: ['roygbvroygbvr', 'g DEMAND TEST', 'bvroygbvroygb', 'KNOW BEFORE', 'YOU BUILD.'], top: 0, spread: 0, flips: [0, 0]},
];

// ---- the step strip over the app: one row
const STRIP = geom(21, 1, 1800, 0.66, 0.1);
const STEPS = [18, 23, 28, 33, 38, 43];
const STRIP_MSGS: Msg[] = [
	{t: b(STEPS[0]), lines: ['TYPE ANY IDEA.'], spread: 0.2},
	{t: b(STEPS[1]), lines: ['IT BUILDS THE STORE.'], spread: 0.2},
	{t: b(STEPS[2]), lines: ['IT RUNS THE ADS.'], spread: 0.2},
	{t: b(STEPS[3]), lines: ['STRANGERS TRY TO PAY.'], spread: 0.2},
	{t: b(STEPS[4]), lines: ['YOU GET THE VERDICT.'], spread: 0.2},
];

// ---- the departures board of ideas: 24 x 6
const IDEAS = geom(24, 6, 1800);
const IDEA_ROWS = ['MAGNET SOCKS  312 gBUILD', 'UBER FOR CATS   2 rKILL ', 'DOG DNA KIT   148 gBUILD', 'AI TOASTER      0 rKILL ', 'SAUNA BLANKET  96 gBUILD'];
const IDEA_MSGS: Msg[] = IDEA_ROWS.map((_, i) => ({
	t: b(43.6 + i * 1),
	lines: ['TESTED LAST NIGHT       ', ...IDEA_ROWS.slice(0, i + 1)],
	top: 0,
	align: 'left' as const,
	spread: 0.1,
}));

// ---- proof: the phone wakes up to buyers
const NOTIFS: Notif[] = [
	// one buyer on each sound of the register loop
	...['Austin', 'Leeds', 'Toronto', 'Denver', 'Lyon', 'Brooklyn', 'Melbourne'].map((c, i) => ({t: b(5 + i), body: `Someone in ${c} just tried to buy your socks. $24`})),
	{t: b(12), body: 'Verdict: build it. 312 people tried to pay overnight.', go: true},
];
const proofCount = (t: number) => {
	const n = NOTIFS.filter((x) => !x.go && t >= x.t).length;
	if (t < b(9)) return n;
	return kf(t, [b(9), b(12)], [n, 312], E.inOut);
};
const PROOF_LABEL = geom(12, 1, 860, 0.66, 0.1);
const PROOF_DIG = geom(4, 1, 860, 0.66, 0.08);

const Proof: React.FC<{t: number}> = ({t}) => {
	const labelEvs = useMemo(() => schedule([{t: b(5), lines: ['TRIED TO PAY'], spread: 0.15}], 12, 1, 7), []);
	const label2 = useMemo(() => schedule([{t: b(12), lines: ['OVERNIGHT.'], spread: 0.15}], 12, 1, 9), []);
	const digits = useMemo(() => [counter(proofCount, 4, b(4), b(13), '0')], []);
	const ls = boardSize(PROOF_LABEL);
	const ds = boardSize(PROOF_DIG);
	const x0 = 900;
	const push = 1 + 0.035 * prog(t, b(4), b(13), E.lin);
	return (
		<AbsoluteFill style={{background: C.housing}}>
			<div style={{position: 'absolute', inset: 0, transform: `scale(${push})`}}>
				<div style={{position: 'absolute', left: 170, top: (H - 940 * 0.96) / 2}}>
					<Phone t={t} notifs={NOTIFS} scale={0.96} />
				</div>
				<div style={{position: 'absolute', left: x0, top: 170}}>
					<Board t={t} evs={labelEvs} g={PROOF_LABEL} />
				</div>
				<div style={{position: 'absolute', left: x0, top: 170 + ls.h + 40}}>
					<Board t={t} evs={digits} g={PROOF_DIG} init={[['0', '0', '0', '0']]} />
				</div>
				<div style={{position: 'absolute', left: x0, top: 170 + ls.h + 40 + ds.h + 40}}>
					<Board t={t} evs={label2} g={PROOF_LABEL} />
				</div>
			</div>
			<AbsoluteFill style={{background: 'radial-gradient(ellipse 120% 90% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.5))'}} />
		</AbsoluteFill>
	);
};

/** steps: the strip on top, the app below */
const BW = 1760;
const BH = 838;
const Steps: React.FC<{t: number; stripEvs: ReturnType<typeof schedule>}> = ({t, stripEvs}) => {
	const ss = boardSize(STRIP);
	const k = STEPS.findIndex((s, i) => t >= b(s) && t < b(STEPS[i + 1] ?? 999));
	const page = (() => {
		const cw = BW;
		const ch = BH - 58;
		switch (k) {
			case 0:
				return <AppPrompt t={t} w={cw} h={ch} tType={b(18.4)} tClick={b(22)} />;
			case 1:
				return <Store t={t} w={cw} h={ch} ts={[b(23), b(23.5), b(24), b(25), b(25.5), b(26.5)]} />;
			case 2:
				return <Ads t={t} w={cw} h={ch} ts={[b(28.3), b(29), b(29.7), b(28.3), b(32.8)]} />;
			case 3:
				return <Buyers t={t} w={cw} h={ch} tClick={b(34)} rows={[34.6, 35.2, 35.7, 36.1, 36.5, 36.8, 37.1, 37.35, 37.6, 37.8].map(b)} count={(tt) => kf(tt, [b(34), b(34.6), b(37.9)], [0, 1, 312], E.in)} />;
			default:
				return <Verdict t={t} w={cw} h={ch} tBoard={b(38.7)} tStats={b(39.4)} step={0.18} />;
		}
	})();
	const url = ['demandtest.com/new', 'pairs.shop', 'demandtest.com/pairs/ads', 'demandtest.com/pairs/buyers', 'demandtest.com/pairs/verdict'][Math.max(0, k)];
	const drift = 1 + 0.02 * prog(t, b(STEPS[Math.max(0, k)]), b(STEPS[Math.max(0, k)] + 5), E.lin);
	return (
		<AbsoluteFill style={{background: C.housing}}>
			<div style={{position: 'absolute', left: (W - ss.w) / 2, top: 26}}>
				<Board t={t} evs={stripEvs} g={STRIP} />
			</div>
			<div style={{position: 'absolute', left: (W - BW) / 2, top: 26 + ss.h + 26, transform: `scale(${drift})`, transformOrigin: '50% 0%'}}>
				<Browser w={BW} h={BH} url={url}>
					{page}
				</Browser>
			</div>
		</AbsoluteFill>
	);
};

export const Film: React.FC = () => {
	const t = useCurrentFrame() / FPS;
	const mainEvs = useMemo(() => schedule(MAIN_MSGS, 13, 5, 3), []);
	const stripEvs = useMemo(() => schedule(STRIP_MSGS, 21, 1, 5), []);
	const ideaEvs = useMemo(() => schedule(IDEA_MSGS, 24, 6, 11, false), []);
	const logoEvs = useMemo(() => schedule(LOGO_MSGS, 13, 5, 13), []);
	const main = (tt: number, push?: [number, number, number]) => <BoardFrame t={tt} evs={mainEvs} g={MAIN} push={push} />;
	const tw = hit(CLUNK);

	if (t < b(4)) return main(t, [0, b(4), 0.04]);
	if (t < b(4) + 0.36) return <FlipWipe t={t} t0={b(4)} A={main(t, [0, b(4), 0.04])} B={<Proof t={t} />} />;
	if (t < b(13)) return <Proof t={t} />;
	if (t < b(18)) return main(t, [b(13), b(18), 0.05]);
	if (t < b(18) + 0.36) return <FlipWipe t={t} t0={b(18)} A={main(t, [b(13), b(18), 0.05])} B={<Steps t={t} stripEvs={stripEvs} />} />;
	if (t < b(43)) return <Steps t={t} stripEvs={stripEvs} />;
	if (t < b(50)) return <BoardFrame t={t} evs={ideaEvs} g={IDEAS} push={[b(43), b(50), 0.03]} />;
	if (t < tw) return main(t, [b(50), tw, 0.05]);
	const logo = <BoardFrame t={t} evs={logoEvs} g={MAIN} push={[tw, END, 0.03]} />;
	if (t < tw + 0.36) return <FlipWipe t={t} t0={tw} A={main(t, [b(50), tw, 0.05])} B={logo} />;
	return logo;
};
