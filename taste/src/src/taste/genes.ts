import {Gene, Pal, Slop, Taste} from './Site';

const SLOP_HEADS = [
	'Unlock Your Potential with AI',
	'The Future of Work Is Here',
	'Supercharge Your Workflow',
	'Build Faster. Ship Smarter.',
	'Your All-in-One Platform',
	'Transform Your Business Today',
	'Elevate Your Brand with AI',
	'Seamless. Powerful. Intelligent.',
	'Revolutionize the Way You Work',
	'Scale Without Limits',
	'The Smarter Way to Grow',
	'Next-Gen Tools for Modern Teams',
	'Empower Your Team',
	'Reimagine What’s Possible',
	'AI That Works for You',
	'Effortless Productivity',
	'Innovation Starts Here',
	'Grow Your Audience 10x',
	'Simplify Everything',
	'Built for the Future',
];
const SLOP_BRANDS = ['Nexora', 'Flowly', 'Synthra', 'Quantix', 'Lumina AI', 'Vectra', 'Brightly', 'Zentrix', 'Omnia', 'Clarity AI', 'Novu', 'Elevato', 'Optima', 'Aurorai', 'Pulsify', 'Stellar', 'Vertexa', 'Hyperion', 'Nimbus', 'Kairo'];
const BLOBS: [string, string][] = [
	['#8B5CF6', '#3B82F6'],
	['#EC4899', '#8B5CF6'],
	['#06B6D4', '#6366F1'],
	['#A855F7', '#EC4899'],
	['#6366F1', '#22D3EE'],
];
export const SLOP: Slop[] = SLOP_HEADS.map((head, i) => ({
	kind: 'slop',
	brand: SLOP_BRANDS[i],
	head,
	sub: 'The all-in-one AI platform that helps teams work smarter, faster and better. Trusted by 10,000+ companies.',
	dark: i % 3 === 1,
	blob: BLOBS[i % BLOBS.length],
	layout: i % 2 ? 'left' : 'center',
}));

type B = {brand: string; head: string; kicker: string; photos: string[]; body?: string};
const BRANDS: B[] = [
	{brand: 'Ember & Oak', body: 'Small batches, roasted on Thursdays, delivered before the weekend.', head: 'Slow coffee\nfor *fast* mornings', kicker: 'Roastery & café · Since 2019', photos: ['cups', 'latte', 'beans', 'mug', 'cafe']},
	{brand: 'Halden', body: 'Lugged steel frames, built one at a time for the way you ride.', head: 'Built to\n*go further*', kicker: 'Steel bicycles, made to order', photos: ['bike', 'road']},
	{brand: 'Maison Lin', body: 'Undyed wool from three farms, knitted by hand in small runs.', head: 'Wool,\n*slowly*', kicker: 'Knitwear · Handmade in Lisbon', photos: ['knit', 'rack', 'store']},
	{brand: 'North House', body: 'Linen sheets, sea air and nothing on the schedule.', head: 'A quiet room\n*by the sea*', kicker: 'Twelve rooms on the coast', photos: ['bedroom', 'white', 'beach']},
	{brand: 'Field', body: 'Sourdough, rye and morning buns, out of the oven at seven.', head: 'Bread worth\n*waking up* for', kicker: 'Bakery · Open from 7', photos: ['bread']},
	{brand: 'Ora', body: 'A cleanser, a serum, a balm. Everything your skin asked for.', head: 'Skin,\n*simply*', kicker: 'Five products. Nothing else.', photos: ['sand', 'makeup']},
	{brand: 'Atelier Nine', body: 'Twelve pieces in wool, cotton and leather, cut to be kept.', head: 'The *autumn*\nedit', kicker: 'Collection 09 · Out now', photos: ['stripes', 'milan', 'yellow', 'blue']},
	{brand: 'Saltwater', body: 'Small trips to quiet places, planned down to the last table.', head: 'Go *somewhere*\nslower', kicker: 'Journeys for two', photos: ['beach', 'peaks', 'hills']},
	{brand: 'Studio Loft', body: 'Oak, linen and light. Pieces made to stay for decades.', head: 'Rooms that\n*breathe*', kicker: 'Furniture · Made in Oslo', photos: ['loft', 'interior', 'house']},
];
const LAYOUTS: Taste['layout'][] = ['bleed', 'split', 'masthead', 'frame'];

const rnd = (n: number) => {
	const s = Math.sin(n * 91.7 + 13.1) * 43758.5453;
	return s - Math.floor(s);
};

/** a round of 20: `taste` = how far it has converged (0 = mostly slop, 1 = all you) */
const round = (seed: number, taste: number, pals: Pal[], fonts: Taste['font'][]): Gene[] =>
	Array.from({length: 20}, (_, i) => {
		const r = rnd(seed * 100 + i);
		if (r > taste + 0.15) return SLOP[(i * 7 + seed) % SLOP.length];
		const b = BRANDS[(i * 5 + seed * 3) % BRANDS.length];
		return {
			kind: 'taste',
			brand: b.brand,
			head: b.head,
			kicker: b.kicker,
			body: b.body,
			photo: b.photos[(i + seed) % b.photos.length],
			layout: LAYOUTS[(i * 3 + seed) % LAYOUTS.length],
			pal: pals[(i + seed * 2) % pals.length],
			font: fonts[(i * 2 + seed) % fonts.length],
			q: Math.min(1, 0.25 + taste * 0.8 + 0.2 * rnd(seed + i * 3)),
		} as Taste;
	});

export const R1: Gene[] = SLOP;
export const R2 = round(2, 0.55, ['cold', 'paper', 'cold', 'night', 'olive'], ['sans', 'sans', 'serif', 'cond']);
export const R3 = round(3, 0.82, ['paper', 'night', 'cold', 'sand', 'terra'], ['serif', 'sans', 'cond']);
export const R4 = round(4, 0.95, ['paper', 'night', 'terra', 'sand'], ['serif', 'cond', 'serif']);
export const R5 = round(5, 1.2, ['paper', 'night', 'terra', 'sand', 'paper'], ['serif', 'cond', 'serif']);
export const ROUNDS = [R1, R2, R3, R4, R5];

/** the one it lands on */
export const WINNER: Taste = {kind: 'taste', brand: 'Ember & Oak', head: 'Slow coffee\nfor *fast* mornings', kicker: 'Roastery & café · Since 2019', photo: 'cups', layout: 'split', pal: 'paper', font: 'serif', q: 1};
export const WINNER2: Taste = {kind: 'taste', brand: 'Ember & Oak', head: 'Slow coffee\nfor *fast* mornings', kicker: 'Roastery & café · Since 2019', photo: 'latte', layout: 'bleed', pal: 'night', font: 'serif', q: 1};

/** the swipe deck in the cold open: nope, nope, like, like */
export const DECK: Gene[] = [SLOP[0], SLOP[3], {...R4[2], q: 0.9} as Gene, WINNER2, R5[6], R5[1]];
