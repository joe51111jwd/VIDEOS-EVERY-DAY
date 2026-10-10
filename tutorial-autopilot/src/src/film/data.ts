import {Step} from '../ap/Panel';

const s = (...xs: string[]): Step[] => xs.map((text) => ({text}));

export const DONUT = {
	title: 'Blender for Beginners: Make a Donut (Part 1)',
	channel: 'Low Poly Club · 2.1M views',
	dur: 7391,
	total: 41,
	steps: s(
		'Delete the default cube',
		'Add a torus',
		'Shade smooth + Subdivision',
		'Duplicate the top for icing',
		'Give the icing a pink material',
		'Scatter the sprinkles',
		'Frame the camera',
		'Render it',
	),
	// tutorial timestamp reached after each step
	pos: [0, 132, 410, 1020, 1840, 2650, 3700, 5230, 6410, 7391],
};

export const NEXT = {
	title: 'Deploy your first Next.js site',
	channel: 'Shipfast · 640K views',
	dur: 1085,
	total: 12,
	steps: s('Open the project', 'Write the page', 'Build it', 'Deploy to production', 'Check it is live'),
};

export const CUT = {
	title: 'Jump cuts in 5 minutes',
	channel: 'Edit Room · 1.3M views',
	dur: 750,
	total: 9,
	steps: s('Import the clips', 'Play through the take', 'Zoom the timeline', 'Razor at the playhead', 'Ripple delete the gap'),
};

export const PIVOT = {
	title: 'Pivot tables in 10 minutes',
	channel: 'Sheets School · 3.4M views',
	dur: 642,
	total: 11,
	steps: s('Select the data', 'Insert › Pivot table', 'Region into Rows', 'Revenue into Values', 'Product into Columns', 'Format as currency', 'Sort by Grand Total'),
};

export const STEP_LIST = [
	'DELETE THE DEFAULT CUBE',
	'ADD › MESH › TORUS',
	'SHADE SMOOTH',
	'ADD A SUBDIVISION MODIFIER',
	'SCALE Z TO 0.72',
	'DUPLICATE THE TOP HALF',
	'SEPARATE IT AS ICING',
	'SOLIDIFY 0.06 M',
	'PROPORTIONAL EDIT THE DRIPS',
	'SNAP TO THE DONUT SURFACE',
	'NEW MATERIAL: DOUGH',
	'NEW MATERIAL: ICING',
	'SUBSURFACE 0.15',
	'MODEL ONE SPRINKLE',
	'PARTICLE SYSTEM: HAIR',
	'RENDER AS OBJECT',
	'RANDOM ROTATION 1.0',
	'COLOUR THE SPRINKLES',
	'ADD A PLATE',
	'RENDER IT',
];

export const WALL = [
	['BLENDER', 'MAKE A DONUT', '2:03:11'],
	['SHEETS', 'PIVOT TABLES IN 10 MINUTES', '10:42'],
	['NEXT.JS', 'DEPLOY YOUR FIRST SITE', '18:05'],
	['PREMIERE', 'JUMP CUTS IN 5 MINUTES', '12:30'],
	['FIGMA', 'AUTO LAYOUT, EXPLAINED', '22:14'],
	['EXCEL', 'XLOOKUP FOR BEGINNERS', '9:58'],
	['NOTION', 'BUILD A SECOND BRAIN', '41:20'],
	['SHOPIFY', 'A STORE FROM SCRATCH', '1:12:08'],
];
