import React from 'react';
import {AbsoluteFill, Easing, interpolate, Sequence, useCurrentFrame} from 'remotion';
import {LAST_HIT, fb} from '../lib/beats';
import {C, F, H, W} from '../lib/theme';
import {DiffCard, DiffRow} from '../type/Diff';
import {CODE, Code, Line, Morph} from '../ui/Code';
import {Feed, HARNESS, Mark, SKIPPED, TOTAL_FNS, Tree, Win, ease, fmt} from '../ui/App';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const snap = Easing.bezier(0.7, 0, 0.2, 1);
const rowH = (size: number, pad = 18) => size * 0.86 + pad * 2;
const money = (s: string) =>
	s.startsWith('$') ? '$' + Number(s.slice(1)).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : s; // 'throws' stays as is

/** A scene runs from beat k0 to beat k1; inside it, l(k) is the local frame of film beat k. */
const start = (k0: number) => (k0 <= 0 ? 0 : fb(k0));
const Scene: React.FC<{k0: number; k1: number; children: React.ReactNode}> = ({k0, k1, children}) => (
	<Sequence from={start(k0)} durationInFrames={fb(k1) - start(k0)}>
		{children}
	</Sequence>
);
const local = (k0: number) => (k: number) => fb(k) - start(k0);

// big type rows pinned to the top / bottom edge of the frame (the "sandwich" scenes)
const M = 24;
const Top: React.FC<{children: React.ReactNode}> = ({children}) => <div style={{position: 'absolute', left: 0, top: M, width: W}}>{children}</div>;
const Bottom: React.FC<{children: React.ReactNode}> = ({children}) => (
	<div style={{position: 'absolute', left: 0, bottom: M, width: W, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end'}}>{children}</div>
);

// skipped functions sit at k % 263 === 131 in the feed (7 of 1,846)
const skippedBy = (n: number) => (n <= 131 ? 0 : Math.min(SKIPPED, Math.floor((n - 132) / 263) + 1));

/* ------------------------------------------------------------------ S0 hook: beats 0-4 */
// The opening line plays over this; the struck row lands on its last word, the drop is the cut.
const Hook: React.FC = () => {
	const f = useCurrentFrame();
	const STRIKE = 50;
	const scroll = interpolate(f, [0, fb(4)], [0, 30]);
	return (
		<AbsoluteFill style={{background: C.bg}}>
			<AbsoluteFill style={{opacity: 0.2, paddingLeft: 40}}>
				<Code
					lines={CODE.messy}
					size={24}
					lh={38}
					scroll={scroll}
					height={H}
					style={(i) => {
						const at = STRIKE + 6 + (i - scroll) * 0.9;
						return f >= at ? {bg: 'rgba(248,81,73,0.32)', sign: '-'} : undefined;
					}}
				/>
			</AbsoluteFill>
			<DiffCard
				bg="transparent"
				size={196}
				hunk={{text: '@@ -1,48213 @@  northstar-shop', at: -6}}
				rows={[
					{kind: ' ', ln: 1, text: 'YOUR AI WROTE', at: -7, band: 'rgba(10,11,13,0.92)'},
					{kind: '-', ln: 2, text: '48,213 LINES.', at: fb(1), strike: STRIKE},
				]}
			/>
		</AbsoluteFill>
	);
};

/* ------------------------------------------------------------------ S1 the rewrite: beats 4-12 */
const MorphPane: React.FC<{at: number; dur: number}> = ({at, dur}) => {
	const f = useCurrentFrame();
	const done = at + dur + 2;
	const strip = interpolate(f, [done, done + 6], [0, 1], {...clamp, easing: ease});
	const badge = interpolate(f, [done - 2, done + 4], [0, 1], clamp);
	const lines = Math.round(interpolate(f, [at, at + dur], [220, 57], clamp));
	return (
		<>
			<div style={{height: 60, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 18, padding: '0 26px', borderBottom: `1px solid ${C.line}`, fontSize: 21}}>
				<span style={{color: C.text}}>lib/checkout.ts</span>
				<span style={{color: C.sub}}>calculateCheckoutTotal()</span>
				<div style={{flex: 1}} />
				<span style={{color: C.sub}}>{lines} lines</span>
				<span
					style={{
						opacity: badge,
						color: C.green,
						background: 'rgba(63,185,80,0.12)',
						border: '1px solid rgba(63,185,80,0.35)',
						borderRadius: 8,
						padding: '4px 12px',
					}}
				>
					220 → 57
				</span>
			</div>
			<div style={{flex: 1, minHeight: 0, padding: '10px 0 0 6px'}}>
				<Morph old={CODE.messy} next={CODE.clean} at={at} dur={dur} size={23} lh={35} height={760} />
			</div>
			<div
				style={{
					height: 100,
					flexShrink: 0,
					display: 'flex',
					alignItems: 'center',
					gap: 26,
					padding: '0 30px',
					borderTop: '1px solid rgba(63,185,80,0.35)',
					background: 'rgba(46,160,67,0.12)',
					opacity: strip,
					transform: `translateY(${(1 - strip) * 30}px)`,
				}}
			>
				<span style={{fontFamily: F.type, fontWeight: 800, fontStretch: '80%', fontSize: 46, color: C.addInk}}>✓ PROVEN IDENTICAL</span>
				<span style={{fontSize: 22, color: '#9FD8AE'}}>original vs rewrite · 1,000 generated inputs · 0 differences</span>
			</div>
		</>
	);
};

const RepoRun: React.FC<{from: number; to: number}> = ({from, to}) => {
	const f = useCurrentFrame();
	const p = interpolate(f, [from, to], [1, TOTAL_FNS], {...clamp, easing: Easing.bezier(0.45, 0, 0.25, 1)});
	const n = Math.floor(p);
	const sk = skippedBy(n);
	return (
		<div style={{flex: 1, display: 'flex', flexDirection: 'column', padding: '34px 40px 0', minWidth: 0}}>
			<div style={{display: 'flex', alignItems: 'flex-end', gap: 60}}>
				<div>
					<div style={{fontFamily: F.type, fontWeight: 800, fontStretch: '80%', fontSize: 190, lineHeight: 0.9, color: C.addInk, fontVariantNumeric: 'tabular-nums'}}>{fmt(n - sk)}</div>
					<div style={{fontSize: 24, color: C.sub, marginTop: 14}}>functions rewritten · proven identical</div>
				</div>
				<div style={{paddingBottom: 6}}>
					<div style={{fontFamily: F.type, fontWeight: 800, fontStretch: '80%', fontSize: 92, lineHeight: 0.9, color: C.ambInk}}>{sk}</div>
					<div style={{fontSize: 24, color: C.sub, marginTop: 14}}>skipped · can't prove</div>
				</div>
				<div style={{flex: 1}} />
				<div style={{paddingBottom: 6, textAlign: 'right'}}>
					<div style={{fontFamily: F.type, fontWeight: 700, fontStretch: '80%', fontSize: 64, lineHeight: 0.9, color: '#AEB6C0'}}>of {fmt(TOTAL_FNS)}</div>
					<div style={{fontSize: 24, color: C.sub, marginTop: 14}}>northstar-shop</div>
				</div>
			</div>
			<div style={{height: 1, background: C.line, margin: '34px 0 6px'}} />
			<Feed p={p} rows={10} rowH={48} size={22} />
		</div>
	);
};

const Rewrite: React.FC = () => {
	const f = useCurrentFrame();
	const l = local(4);
	const MORPH_AT = 1;
	const MORPH_DUR = 18;
	const punch = interpolate(f, [0, 9], [1.045, 1], {...clamp, easing: ease});
	const sh = interpolate(f, [l(5.8), l(6.2)], [0, 1], {...clamp, easing: snap});
	const scale = (1 - sh * 0.3) * punch;
	const flash = interpolate(f, [0, 5], [0.22, 0], clamp);
	const phaseB = f >= l(7);
	const n = Math.floor(interpolate(f, [l(7.25), l(11.2)], [1, TOTAL_FNS], {...clamp, easing: Easing.bezier(0.45, 0, 0.25, 1)}));
	const status = phaseB ? (
		<span>
			<span style={{color: C.green}}>{fmt(n - skippedBy(n))} proven</span> · {skippedBy(n)} skipped
		</span>
	) : f < MORPH_AT + MORPH_DUR ? (
		'rewriting…'
	) : (
		<span style={{color: C.green}}>✓ 1 of 1 proven</span>
	);
	return (
		<AbsoluteFill style={{background: C.bg}}>
			<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
				<div style={{transform: `scale(${scale})`}}>
					<Win w={1780} h={1000} mode="Upkeep" status={status}>
						<Tree w={400} firstAt={MORPH_AT + MORPH_DUR} greenAt={l(7.25)} greenDur={l(11) - l(7.25)} rowH={32} size={19} />
						<div style={{flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0}}>
							{phaseB ? <RepoRun from={l(7.25)} to={l(11.2)} /> : <MorphPane at={MORPH_AT} dur={MORPH_DUR} />}
						</div>
					</Win>
				</div>
			</AbsoluteFill>
			<Top>
				<DiffRow kind="+" ln={1} text="REWRITES EVERY FUNCTION." at={l(6)} size={112} gutter={210} />
			</Top>
			<Bottom>
				<DiffRow kind="+" ln={2} text="PROVES NOTHING BROKE." at={l(7)} size={112} gutter={210} />
			</Bottom>
			<AbsoluteFill style={{background: '#fff', opacity: flash, pointerEvents: 'none'}} />
		</AbsoluteFill>
	);
};

/* ------------------------------------------------------------------ S2 the difference: beats 12-16 */
const Difference: React.FC = () => {
	const l = local(12);
	return (
		<DiffCard
			size={176}
			hunk={{text: '@@ -other code cleaners +Code Cleaner @@', at: 0}}
			rows={[
				{kind: '-', ln: 12, text: 'REFACTOR AND HOPE.', at: 0, strike: l(13)},
				{kind: '+', ln: 12, text: 'REWRITE AND PROVE.', at: l(13.5)},
			]}
		/>
	);
};

/* ------------------------------------------------------------------ S3 the proof: beats 16-28 */
type PRow = {i: number; in: string; old: string; next: string; same: boolean};

const ProofTable: React.FC<{rows: PRow[]; landF: number; size?: number; rh?: number; visible?: number}> = ({rows, landF, size = 30, rh = 70, visible = 6}) => {
	const shown = rows.slice(-visible);
	const cols = (
		[
			['input', 130, 'left'],
			['cart', 0, 'left'],
			['original', 250, 'right'],
			['', 70, 'center'],
			['rewrite', 250, 'right'],
			['', 70, 'right'],
		] as const
	).map(([k, w, a]) => ({k, w, a}));
	return (
		<div style={{display: 'flex', flexDirection: 'column'}}>
			<div style={{height: 54, display: 'flex', alignItems: 'center', gap: 24, padding: '0 30px', fontSize: size * 0.72, color: '#5B626C', borderBottom: `1px solid ${C.line}`}}>
				{cols.map((c, j) => (
					<span key={j} style={{width: c.w || undefined, flex: c.w ? undefined : 1, textAlign: c.a}}>
						{c.k}
					</span>
				))}
			</div>
			<div style={{height: visible * rh, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', overflow: 'hidden'}}>
				{shown.map((r, j) => {
					const newest = j === shown.length - 1;
					const t = newest ? interpolate(landF, [0, 5], [0, 1], {...clamp, easing: ease}) : 1;
					const hl = newest ? interpolate(landF, [0, 10], [1, 0], clamp) : 0;
					const red = !r.same;
					return (
						<div
							key={r.i}
							style={{
								height: rh * (newest ? t : 1),
								flexShrink: 0,
								display: 'flex',
								alignItems: 'center',
								gap: 24,
								padding: '0 30px',
								fontSize: size,
								overflow: 'hidden',
								borderBottom: '1px solid #171B21',
								background: red ? 'rgba(248,81,73,0.2)' : `rgba(63,185,80,${0.14 * hl})`,
							}}
						>
							<span style={{width: 130, color: '#5B626C'}}>#{String(r.i).padStart(4, '0')}</span>
							<span style={{flex: 1, color: '#AEB6C0', whiteSpace: 'nowrap', overflow: 'hidden'}}>{r.in}</span>
							<span style={{width: 250, textAlign: 'right', color: r.old.startsWith('$') ? C.text : C.sub}}>{money(r.old)}</span>
							<span style={{width: 70, textAlign: 'center', color: red ? C.red : C.green, fontWeight: 700}}>{red ? '≠' : '='}</span>
							<span style={{width: 250, textAlign: 'right', color: red ? '#FF8A80' : r.next.startsWith('$') ? C.text : C.sub}}>{money(r.next)}</span>
							<span style={{width: 70, textAlign: 'right', color: red ? C.red : C.green}}>{red ? '✗' : '✓'}</span>
						</div>
					);
				})}
			</div>
		</div>
	);
};

const Proof: React.FC = () => {
	const f = useCurrentFrame();
	const l = local(16);
	const a2 = f >= l(24);
	// attempt 1: one input per beat, the fifth one breaks — on the beat dropping out
	const lands1 = [16, 17, 18, 19, 20].map((k) => l(k));
	const n1 = lands1.filter((x) => f >= x).length;
	const caught = n1 >= 5;
	// attempt 2: all 1,000, accelerating into the slam
	const n2 = Math.floor(interpolate(f, [l(24), l(27.35)], [0, 1000], {...clamp, easing: Easing.in(Easing.cubic)}));
	const rows: PRow[] = a2
		? HARNESS.rows.slice(0, Math.max(1, n2)).map((r) => ({i: r.i, in: r.in, old: r.old, next: r.new, same: r.same}))
		: HARNESS.rows.slice(0, n1).map((r) => ({i: r.i, in: r.in, old: r.old, next: r.bad, same: r.badSame}));
	const landF = a2 ? 99 : f - (lands1[n1 - 1] ?? 0);
	const done2 = a2 && n2 >= 1000;
	const fb5 = HARNESS.firstBad;
	const statusColor = a2 ? (done2 ? C.green : C.sub) : caught ? C.red : C.sub;
	const status = a2
		? done2
			? '✓ 1,000 / 1,000 identical · rewrite kept'
			: `attempt 2 · ${fmt(n2)} / 1,000`
		: caught
			? '✗ output changed on input #0005 · rewrite rejected'
			: `attempt 1 · ${n1} / 1,000`;
	const shake = !a2 && caught ? interpolate(f - lands1[4], [0, 2, 4, 6, 8], [0, -10, 8, -4, 0], clamp) : 0;
	return (
		<AbsoluteFill style={{background: C.bg}}>
			<Top>
				<DiffRow kind=" " ln={16} text="OLD VS NEW. 1,000 INPUTS." at={0} size={112} gutter={210} />
			</Top>
			<div
				style={{
					position: 'absolute',
					left: 100,
					width: W - 200,
					top: M + rowH(112) + 26,
					height: 690,
					borderRadius: 16,
					background: C.win,
					boxShadow: '0 0 0 1px #20252C, 0 40px 120px rgba(0,0,0,0.6)',
					overflow: 'hidden',
					fontFamily: F.mono,
					transform: `translateX(${shake}px)`,
				}}
			>
				<div style={{height: 70, display: 'flex', alignItems: 'center', gap: 18, padding: '0 30px', background: C.panel, borderBottom: `1px solid ${C.line}`, fontSize: 23}}>
					<Mark size={34} />
					<span style={{color: C.text}}>Proof</span>
					<span style={{color: C.sub}}>calculateCheckoutTotal() · original vs rewrite</span>
					<div style={{flex: 1}} />
					<span style={{color: statusColor}}>{status}</span>
				</div>
				<ProofTable rows={rows} landF={landF} />
				<div style={{height: 120, display: 'flex', alignItems: 'center', padding: '0 30px', fontSize: 25, gap: 30}}>
					{!a2 && caught ? (
						<>
							<span style={{color: C.red}}>why</span>
							<span style={{color: '#E8A39C'}}>
								rewrite rounded the NY tax rate · 887.5 → 888 bps · tax ${(fb5.oldTax / 100).toFixed(2)} → ${(fb5.badTax / 100).toFixed(2)}
							</span>
						</>
					) : a2 ? (
						<>
							<span style={{color: C.green}}>fix</span>
							<span style={{color: '#9FD8AE'}}>NY tax rate kept at 887.5 bps · re-running all 1,000 inputs</span>
						</>
					) : (
						<span style={{color: C.sub}}>same input into both versions · every output must match to the cent</span>
					)}
				</div>
			</div>
			<Bottom>
				{f < l(24) + 8 ? <DiffRow kind="-" ln={17} text="OFF BY 2¢. REJECTED." at={l(21)} collapse={l(24)} size={112} gutter={210} /> : null}
				{a2 ? <DiffRow kind="+" ln={17} text={`${fmt(n2)} / 1,000 IDENTICAL`} at={l(24)} size={112} gutter={210} /> : null}
			</Bottom>
		</AbsoluteFill>
	);
};

/* ------------------------------------------------------------------ S4 kept: beats 28-32 (the beat slams back) */
const Kept: React.FC = () => {
	const f = useCurrentFrame();
	const l = local(28);
	const wipe = interpolate(f, [0, 5], [100, 0], {...clamp, easing: ease});
	const fade = interpolate(f, [3, 16], [1, 0.0], clamp);
	return (
		<DiffCard
			size={196}
			rows={[
				{kind: '+', ln: 1000, text: '1,000 OF 1,000.', at: 0},
				{kind: '+', ln: 1001, text: 'REWRITE KEPT.', at: l(28.5)},
			]}
		>
			<AbsoluteFill style={{opacity: 0.16, paddingLeft: 40, paddingTop: 20}}>
				<Code lines={[...CODE.clean, ...CODE.clean]} size={24} lh={38} height={H} style={() => ({bg: 'rgba(46,160,67,0.35)', sign: '+'})} />
			</AbsoluteFill>
			<AbsoluteFill style={{background: C.addBand, clipPath: `inset(0 ${wipe}% 0 0)`, opacity: fade}} />
		</DiffCard>
	);
};

/* ------------------------------------------------------------------ S5 it won't guess: beats 32-36 */
const SKIP_ROWS: [string, string, string, 'ok' | 'skip'][] = [
	['getFlashSale()', '1,000 inputs', '✓ identical', 'ok'],
	['applyFlashPrice()', '1,000 inputs', '✓ identical', 'ok'],
	['flashSaleEndsIn()', 'reads the clock', '— skipped · left as is', 'skip'],
	['formatCountdown()', '1,000 inputs', '✓ identical', 'ok'],
];
const Guess: React.FC = () => {
	const f = useCurrentFrame();
	const l = local(32);
	const hl = interpolate(f, [2, 5, 14], [0, 1, 0.55], clamp);
	const code = interpolate(f, [l(32.5), l(32.5) + 6], [0, 1], {...clamp, easing: ease});
	const size2 = 128;
	return (
		<AbsoluteFill style={{background: C.bg}}>
			<div
				style={{
					position: 'absolute',
					left: 100,
					width: W - 200,
					top: 40,
					height: H - 40 - M - 2 * rowH(size2) - 34,
					borderRadius: 16,
					background: C.win,
					boxShadow: '0 0 0 1px #20252C, 0 40px 120px rgba(0,0,0,0.6)',
					overflow: 'hidden',
					fontFamily: F.mono,
				}}
			>
				<div style={{height: 66, display: 'flex', alignItems: 'center', gap: 18, padding: '0 30px', background: C.panel, borderBottom: `1px solid ${C.line}`, fontSize: 22}}>
					<Mark size={32} />
					<span style={{color: C.text}}>lib/flash-sale.ts</span>
					<div style={{flex: 1}} />
					<span style={{color: C.sub}}>
						<span style={{color: C.green}}>3 proven</span> · <span style={{color: C.amber}}>1 skipped</span>
					</span>
				</div>
				{SKIP_ROWS.map(([name, what, verdict, kind], j) => {
					const skip = kind === 'skip';
					return (
						<div
							key={j}
							style={{
								height: 80,
								display: 'flex',
								alignItems: 'center',
								gap: 26,
								padding: '0 30px',
								fontSize: 33,
								borderBottom: '1px solid #171B21',
								background: skip ? `rgba(210,153,34,${0.1 + 0.16 * hl})` : undefined,
							}}
						>
							<span style={{flex: 1, color: skip ? C.ambInk : C.text}}>{name}</span>
							<span style={{color: skip ? '#D9B66A' : C.sub}}>{what}</span>
							<span style={{width: 460, textAlign: 'right', color: skip ? C.ambInk : C.green}}>{verdict}</span>
						</div>
					);
				})}
				<div style={{padding: '26px 30px 0 30px', fontSize: 31, lineHeight: '50px', opacity: code, transform: `translateY(${(1 - code) * 16}px)`}}>
					<div>
						<span style={{color: '#FF7B72'}}>export function </span>
						<span style={{color: '#D2A8FF'}}>flashSaleEndsIn</span>
						<span style={{color: C.text}}>(sale: Sale) {'{'}</span>
					</div>
					<div style={{paddingLeft: 40}}>
						<span style={{color: '#FF7B72'}}>return </span>
						<span style={{color: C.text}}>sale.endsAt - </span>
						<span style={{color: C.ambInk, background: 'rgba(210,153,34,0.22)', borderBottom: `3px solid ${C.amber}`}}>Date.now()</span>
						<span style={{color: C.text}}>;</span>
						
					</div>
					<div style={{color: C.text}}>{'}'}</div>
					<div style={{color: '#8B949E', marginTop: 6}}>// a different answer every run: no proof, so no rewrite</div>
				</div>
			</div>
			<Bottom>
				<DiffRow kind="!" ln={32} text="CAN'T PROVE IT?" at={0} size={size2} gutter={220} />
				<DiffRow kind="!" ln={33} text="WON'T TOUCH IT." at={l(33)} size={size2} gutter={220} />
			</Bottom>
		</AbsoluteFill>
	);
};

/* ------------------------------------------------------------------ S6 port: beats 36-40 */
const Pane: React.FC<{title: string; lines: Line[]; insertAt?: number; per?: number; w: number}> = ({title, lines, insertAt, per = 0.7, w}) => {
	const f = useCurrentFrame();
	return (
		<div style={{width: w, flexShrink: 0, borderRight: `1px solid ${C.line}`, display: 'flex', flexDirection: 'column'}}>
			<div style={{height: 46, display: 'flex', alignItems: 'center', padding: '0 20px', fontSize: 19, color: C.sub, borderBottom: `1px solid ${C.line}`}}>{title}</div>
			<div style={{padding: '8px 0 0 0'}}>
				<Code
					lines={lines}
					size={16}
					lh={25}
					height={560}
					style={
						insertAt === undefined
							? undefined
							: (i) => {
									const t = f - (insertAt + i * per);
									if (t < 0) return {dim: 0};
									return {bg: `rgba(46,160,67,${0.1 + 0.2 * interpolate(t, [0, 12], [1, 0], clamp)})`, sign: '+'};
								}
					}
				/>
			</div>
		</div>
	);
};
const Port: React.FC = () => {
	const f = useCurrentFrame();
	const l = local(36);
	const ok = interpolate(f, [l(36.75), l(36.75) + 5], [0, 1], {...clamp, easing: ease});
	const bars = interpolate(f, [l(37), l(37) + 10], [0, 1], {...clamp, easing: ease});
	const big = interpolate(f, [l(37.5), l(37.5) + 5], [0, 1], {...clamp, easing: ease});
	const BAR = 360;
	return (
		<AbsoluteFill style={{background: C.bg}}>
			<Top>
				<DiffRow kind="+" ln={36} text="PORT IT TO RUST." at={0} size={112} gutter={210} />
			</Top>
			<div style={{position: 'absolute', left: 100, top: M + rowH(112) + 26}}>
				<Win
					w={W - 200}
					h={690}
					mode="Port"
					port="Port → Rust"
					status={<span style={{color: ok > 0.5 ? C.green : C.sub}}>{ok > 0.5 ? '✓ 50,000 / 50,000 identical' : 'porting…'}</span>}
				>
					<Pane title="checkout.ts" lines={CODE.clean} w={590} />
					<Pane title="checkout.rs" lines={CODE.rust} insertAt={1} per={0.42} w={590} />
					<div style={{flex: 1, padding: '28px 34px', display: 'flex', flexDirection: 'column', gap: 18}}>
						<div style={{fontSize: 21, color: C.sub}}>TypeScript vs Rust · same 50,000 inputs</div>
						<div style={{fontFamily: F.type, fontWeight: 800, fontStretch: '80%', fontSize: 64, color: C.addInk, opacity: ok, lineHeight: 1}}>✓ IDENTICAL</div>
						<div style={{height: 1, background: C.line, margin: '6px 0'}} />
						<div style={{fontSize: 21, color: C.sub}}>time per checkout</div>
						{[
							['TypeScript', 368, '#7D8590'],
							['Rust', 99, C.green],
						].map(([k, ns, col]) => (
							<div key={k as string} style={{display: 'flex', flexDirection: 'column', gap: 8}}>
								<div style={{display: 'flex', fontSize: 22, color: C.text}}>
									<span style={{flex: 1}}>{k}</span>
									<span style={{color: col as string}}>{Math.round((ns as number) * bars)} ns</span>
								</div>
								<div style={{height: 22, borderRadius: 6, background: '#191D23'}}>
									<div style={{height: 22, borderRadius: 6, width: (BAR * (ns as number) * bars) / 368, background: col as string}} />
								</div>
							</div>
						))}
						<div style={{fontFamily: F.type, fontWeight: 800, fontStretch: '80%', fontSize: 84, color: C.addInk, opacity: big, lineHeight: 1, marginTop: 8}}>3.7× FASTER</div>
					</div>
				</Win>
			</div>
			<Bottom>
				<DiffRow kind="+" ln={37} text="3.7× FASTER. STILL IDENTICAL." at={l(37.5)} size={112} gutter={210} />
			</Bottom>
		</AbsoluteFill>
	);
};

/* ------------------------------------------------------------------ S7 end card: beats 40-44, the last hit flips the codebase green */
const End: React.FC = () => {
	const f = useCurrentFrame();
	const l = local(40);
	const hit = l(LAST_HIT);
	const flipped = f >= hit;
	const mark = interpolate(f, [0, l(41)], [0, 1], clamp);
	const word = interpolate(f, [2, 9], [0, 1], {...clamp, easing: ease});
	const t1 = interpolate(f, [l(41), l(41) + 6], [0, 1], {...clamp, easing: ease});
	const t2 = interpolate(f, [l(42), l(42) + 6], [0, 1], {...clamp, easing: ease});
	const flash = flipped ? interpolate(f - hit, [0, 6], [0.28, 0], clamp) : 0;
	const pop = flipped ? interpolate(f - hit, [0, 6], [1.06, 1], {...clamp, easing: ease}) : 1;
	return (
		<AbsoluteFill style={{background: C.bg}}>
			<AbsoluteFill style={{opacity: flipped ? 0.42 : 0.2, paddingLeft: 40}}>
				{flipped ? (
					<Code lines={[...CODE.clean, ...CODE.clean]} size={24} lh={38} height={H} style={() => ({bg: 'rgba(46,160,67,0.4)', sign: '+'})} />
				) : (
					<Code lines={CODE.messy} size={24} lh={38} scroll={40 + f * 0.25} height={H} style={() => ({bg: 'rgba(248,81,73,0.3)', sign: '-'})} />
				)}
			</AbsoluteFill>
			<AbsoluteFill style={{background: 'radial-gradient(ellipse 58% 50% at 50% 50%, rgba(10,11,13,0.97) 45%, rgba(10,11,13,0.35) 100%)'}} />
			<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', transform: `scale(${pop})`}}>
				<div style={{display: 'flex', alignItems: 'center', gap: 46}}>
					<Mark size={200} t={mark} />
					<div style={{fontFamily: F.type, fontWeight: 800, fontStretch: '85%', fontSize: 178, letterSpacing: '-0.02em', color: C.ink, opacity: word, transform: `translateX(${(1 - word) * -30}px)`}}>
						Code Cleaner
					</div>
				</div>
				<div style={{marginTop: 54, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, fontFamily: F.type, fontWeight: 700, fontStretch: '85%', fontSize: 64}}>
					<div style={{color: C.ink, opacity: t1, transform: `translateY(${(1 - t1) * 14}px)`}}>Rewrites your codebase.</div>
					<div style={{color: C.addInk, opacity: t2, transform: `translateY(${(1 - t2) * 14}px)`}}>Proves nothing broke.</div>
				</div>
				<div style={{position: 'absolute', bottom: 64, fontFamily: F.mono, fontSize: 26, color: C.sub, opacity: t2}}>Early access ↓</div>
			</AbsoluteFill>
			<AbsoluteFill style={{background: '#fff', opacity: flash}} />
		</AbsoluteFill>
	);
};

export const Film: React.FC = () => (
	<AbsoluteFill style={{background: C.bg}}>
		<Scene k0={0} k1={4}>
			<Hook />
		</Scene>
		<Scene k0={4} k1={12}>
			<Rewrite />
		</Scene>
		<Scene k0={12} k1={16}>
			<Difference />
		</Scene>
		<Scene k0={16} k1={28}>
			<Proof />
		</Scene>
		<Scene k0={28} k1={32}>
			<Kept />
		</Scene>
		<Scene k0={32} k1={36}>
			<Guess />
		</Scene>
		<Scene k0={36} k1={40}>
			<Port />
		</Scene>
		<Scene k0={40} k1={44.5}>
			<End />
		</Scene>
	</AbsoluteFill>
);
