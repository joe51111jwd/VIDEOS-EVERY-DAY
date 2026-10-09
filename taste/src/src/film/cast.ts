// Real Awwwards Site of the Day winners (live screenshots in public/aw/, captured by tools/aw-capture.mjs).
// Inputs (what you like) and outputs (what AI makes once it has your taste) never share a site.

/** cold open: the sites you love, one per beat */
export const HOOK = ['hobro', 'boc', 'zeroz'];
/** the ask: "a homepage for my studio" */
export const ASK = {prompt: 'Design a homepage for my studio', after: 'lxl'};
/** the deck you swipe: right = like, left = nope (index of the one slop card) */
export const DECKC = ['cominvi', 'era', 'SLOP', 'kononenko', 'likova', 'izanami', 'moto', 'unitedcarriers', 'landberg'];
/** what it makes on the drop */
export const DROP = [
	{n: 'coffeetech', prompt: 'Site for my coffee brand'},
	{n: 'honey', prompt: 'Homepage for my interiors studio'},
	{n: 'moon', prompt: 'Launch page for my exhibit'},
	{n: 'vero', prompt: 'Site for my bridal atelier'},
];
/** every AI, now with your taste */
export const APPS = [
	{name: 'ChatGPT', prompt: 'Landing page for my agency', to: 'produx'},
	{name: 'Claude', prompt: 'Portfolio for a film director', to: 'partizan'},
	{name: 'Figma', prompt: 'Homepage for an eco brand', to: 'alethia'},
	{name: 'Cursor', prompt: 'Site for my creative studio', to: 'nothin'},
];
export const WALL = ['hobro', 'boc', 'zeroz', 'lxl', 'cominvi', 'era', 'kononenko', 'likova', 'izanami', 'moto', 'unitedcarriers', 'landberg', 'coffeetech', 'honey', 'moon', 'vero', 'produx', 'partizan', 'alethia', 'nothin', 'mosby', 'pxpush', 'sstr', 'serotoninn', 'aardvark', 'aireport', 'k95', 'montreal', 'sharplink', 'odyssee', 'noho', 'lisa', 'pensatori', 'tuscan', 'butter', 'twks', 'zacamil', 'bleibtgleich'];
export const TASTE_NAME: [string, string] = ['Dark', 'Cinematic'];
/** palettes pulled from each liked site (k-means on the screenshot) */
export const PAL: Record<string, string[]> = {
	cominvi: ['#161C29', '#B9B7B4'],
	era: ['#1C478C', '#E9E4D8'],
	kononenko: ['#706755', '#BCBCBD'],
	likova: ['#192035', '#8A92A7'],
	izanami: ['#3C403A', '#5F6258'],
	moto: ['#AFB4B8'],
};
