import {continueRender, delayRender, staticFile} from 'remotion';

// ---- fonts: woff2 in public/fonts, loaded with FontFace (the google-fonts loader fails in this Chrome)
const FONTS: [string, string, string, string?][] = [
	['Bricolage', '200 800', 'Bricolage-var.woff2', '75% 100%'],
	['JetBrains Mono', '100 800', 'JetBrainsMono-var.woff2'],
	['Geist', '100 900', 'Geist-var.woff2'],
	['Geist Mono', '100 900', 'GeistMono-var.woff2'],
];
if (typeof document !== 'undefined' && typeof FontFace !== 'undefined') {
	const h = delayRender('fonts');
	Promise.all(
		FONTS.map(([fam, weight, file, stretch]) => {
			const ff = new FontFace(fam, `url(${staticFile('fonts/' + file)}) format('woff2')`, {weight, ...(stretch ? {stretch} : {})});
			(document.fonts as unknown as {add: (f: FontFace) => void}).add(ff);
			return ff.load();
		}),
	)
		.then(() => continueRender(h))
		.catch((e) => {
			console.error(e);
			continueRender(h);
		});
}

export const W = 1920;
export const H = 1080;

/** a git diff, blown up: red minus lines, green plus lines, amber for "left alone" */
export const C = {
	bg: '#0A0B0D',
	ink: '#ECEEF1',
	dim: '#5B626C',
	faint: '#2A2F36',
	// type bands
	addBand: '#0C2416',
	addInk: '#4BE37A',
	addSign: '#2FC15C',
	delBand: '#33110F',
	delInk: '#FF7A6E',
	delSign: '#F0473B',
	ambBand: '#2C2008',
	ambInk: '#F5C451',
	// product UI (dark)
	win: '#0F1115',
	panel: '#13161B',
	raise: '#191D23',
	line: '#232830',
	text: '#D6DBE1',
	sub: '#7D8590',
	green: '#3FB950',
	red: '#F85149',
	amber: '#D29922',
	blue: '#58A6FF',
};
export const F = {
	type: 'Bricolage, sans-serif',
	mono: '"JetBrains Mono", ui-monospace, monospace',
};

/** rough 2 ("Lossless"): light in a dark 3D space */
export const L = {
	bg: '#000000',
	ink: '#F5F5F7',
	sub: '#86868B',
	dim: '#3A3A3C',
	mint: '#3DF5B0',
	mintDeep: '#0FB57E',
	red: '#FF453A',
	amber: '#FFD60A',
	glass: 'rgba(28,30,34,0.72)',
	edge: 'rgba(255,255,255,0.10)',
};
export const LF = {
	sans: 'Geist, "Inter Tight", system-ui, sans-serif',
	mono: '"Geist Mono", "JetBrains Mono", ui-monospace, monospace',
};
