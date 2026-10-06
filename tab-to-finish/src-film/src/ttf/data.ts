import {rng} from './tokens';

export type Vendor = {
	name: string;
	short: string;
	prefix: string;
	layout: 0 | 1 | 2 | 3;
	accent: string;
	font: 'sans' | 'serif' | 'display' | 'cond';
	city: string;
	items: string[];
	file: (n: string, i: number) => string;
};

const V: Vendor[] = [
	{name: 'Northwind Paper Co.', short: 'Northwind', prefix: 'NW-', layout: 0, accent: '#1F5C4A', font: 'serif', city: 'Portland, OR 97209', items: ['Recycled copy paper, 20 cases', 'Kraft mailers, 500 ct', 'Letterhead print run', 'Delivery'], file: (n) => `Northwind ${n}.pdf`},
	{name: 'Bluefin Logistics', short: 'Bluefin', prefix: 'BFL-', layout: 1, accent: '#1E4FD8', font: 'sans', city: 'Long Beach, CA 90802', items: ['LTL freight, 3 pallets', 'Liftgate service', 'Fuel surcharge', 'Residential delivery'], file: (n) => `Invoice_Bluefin_${n}.pdf`},
	{name: 'Harbor & Pine Catering', short: 'Harbor & Pine', prefix: 'HP', layout: 2, accent: '#B4532A', font: 'display', city: 'Seattle, WA 98121', items: ['Team lunch, 24 guests', 'Coffee and pastry service', 'Staffing, 3 hours', 'Rentals'], file: (n) => `harbor-pine-${n.toLowerCase()}.pdf`},
	{name: 'Cedar Lane Print Studio', short: 'Cedar Lane', prefix: 'CL-', layout: 3, accent: '#7A3E9D', font: 'cond', city: 'Austin, TX 78702', items: ['Trade show banners (2)', 'Business cards, 1,000', 'Rush proofing', 'Shipping'], file: (n) => `CedarLane_${n}.pdf`},
	{name: 'Alder Office Supply', short: 'Alder', prefix: 'AOS-', layout: 1, accent: '#0E7C86', font: 'sans', city: 'Denver, CO 80205', items: ['Ergonomic chairs (2)', 'Monitor arms (4)', 'Desk organizers', 'Assembly'], file: (n) => `Alder Office ${n}.pdf`},
	{name: 'Meridian Courier', short: 'Meridian', prefix: 'MC', layout: 0, accent: '#C2410C', font: 'sans', city: 'Chicago, IL 60607', items: ['Same-day deliveries (14)', 'After-hours pickup', 'Waiting time'], file: (n) => `meridian_${n}.pdf`},
	{name: 'Copperline Electric', short: 'Copperline', prefix: 'CE-', layout: 2, accent: '#B45309', font: 'serif', city: 'Phoenix, AZ 85004', items: ['Panel inspection', 'Lighting retrofit, 2nd floor', 'Materials', 'Labor, 6 hours'], file: (n) => `Copperline Electric ${n}.pdf`},
	{name: 'Fieldstone Cleaning', short: 'Fieldstone', prefix: 'FS', layout: 3, accent: '#3F6212', font: 'sans', city: 'Columbus, OH 43215', items: ['Office cleaning, October', 'Window service', 'Supplies'], file: (n) => `Fieldstone-${n}.pdf`},
	{name: 'Granite Peak IT', short: 'Granite Peak', prefix: 'GP-', layout: 1, accent: '#334155', font: 'cond', city: 'Salt Lake City, UT 84101', items: ['Managed IT, October', 'Laptop setup (3)', 'Backup storage, 2 TB', 'On-site visit'], file: (n) => `GranitePeak_${n}.pdf`},
	{name: 'Saltmarsh Coffee Roasters', short: 'Saltmarsh', prefix: 'SCR-', layout: 2, accent: '#6B4226', font: 'display', city: 'Charleston, SC 29401', items: ['House blend, 12 lb', 'Oat milk, 2 cases', 'Grinder service'], file: (n) => `Saltmarsh ${n}.pdf`},
	{name: 'Juniper Facilities', short: 'Juniper', prefix: 'JF', layout: 0, accent: '#15803D', font: 'sans', city: 'Minneapolis, MN 55401', items: ['HVAC maintenance', 'Filter replacement (12)', 'Service call'], file: (n) => `juniper_facilities_${n}.pdf`},
	{name: 'Kestrel Freight', short: 'Kestrel', prefix: 'KF-', layout: 3, accent: '#9F1239', font: 'cond', city: 'Memphis, TN 38103', items: ['FTL Memphis to Atlanta', 'Detention, 2 hours', 'Fuel surcharge'], file: (n) => `Kestrel Freight ${n}.pdf`},
	{name: 'Lantern Signworks', short: 'Lantern', prefix: 'LS', layout: 2, accent: '#A16207', font: 'serif', city: 'Nashville, TN 37203', items: ['Lobby sign, brushed brass', 'Install', 'Design revisions'], file: (n) => `Lantern_Signworks_${n}.pdf`},
	{name: 'Brightwater Plumbing', short: 'Brightwater', prefix: 'BW-', layout: 1, accent: '#0369A1', font: 'sans', city: 'Tampa, FL 33602', items: ['Water heater replacement', 'Parts', 'Labor, 3 hours'], file: (n) => `Brightwater ${n}.pdf`},
	{name: 'Tidewell Linen', short: 'Tidewell', prefix: 'TL', layout: 0, accent: '#4338CA', font: 'serif', city: 'Providence, RI 02903', items: ['Table linen service', 'Napkins, 400', 'Weekly pickup'], file: (n) => `tidewell-${n}.pdf`},
	{name: 'Quarry Hill Furniture', short: 'Quarry Hill', prefix: 'QH-', layout: 3, accent: '#57534E', font: 'display', city: 'Asheville, NC 28801', items: ['Walnut conference table', 'Delivery and setup'], file: (n) => `QuarryHill_${n}.pdf`},
	{name: 'Wren & Moss Florals', short: 'Wren & Moss', prefix: 'WM', layout: 2, accent: '#BE185D', font: 'display', city: 'Brooklyn, NY 11211', items: ['Reception arrangements', 'Weekly refresh (4)', 'Delivery'], file: (n) => `Wren and Moss ${n}.pdf`},
	{name: 'Pinecrest Security', short: 'Pinecrest', prefix: 'PS-', layout: 1, accent: '#1E3A8A', font: 'cond', city: 'Sacramento, CA 95814', items: ['Monitoring, October', 'Badge readers (2)', 'Service call'], file: (n) => `Pinecrest_${n}.pdf`},
	{name: 'Halyard Marine Supply', short: 'Halyard', prefix: 'HMS-', layout: 0, accent: '#0F766E', font: 'sans', city: 'San Diego, CA 92101', items: ['Rigging hardware', 'Line, 600 ft', 'Shipping'], file: (n) => `halyard_${n}.pdf`},
	{name: 'Silverleaf Software', short: 'Silverleaf', prefix: 'SL-', layout: 1, accent: '#6D28D9', font: 'sans', city: 'Boulder, CO 80302', items: ['Team plan, 18 seats', 'Onboarding session'], file: (n) => `Silverleaf Invoice ${n}.pdf`},
	{name: 'Ridgeline Rentals', short: 'Ridgeline', prefix: 'RR', layout: 3, accent: '#C2410C', font: 'cond', city: 'Boise, ID 83702', items: ['Box truck, 3 days', 'Mileage', 'Insurance'], file: (n) => `Ridgeline-${n}.pdf`},
	{name: 'Foxglove Design Co.', short: 'Foxglove', prefix: 'FD-', layout: 2, accent: '#9D174D', font: 'serif', city: 'Savannah, GA 31401', items: ['Brand refresh, phase 2', 'Packaging mockups', 'Revisions'], file: (n) => `Foxglove ${n}.pdf`},
	{name: 'Larkspur Staffing', short: 'Larkspur', prefix: 'LK', layout: 0, accent: '#7C2D12', font: 'sans', city: 'Kansas City, MO 64105', items: ['Temp staff, 64 hours', 'Overtime, 6 hours'], file: (n) => `Larkspur_Staffing_${n}.pdf`},
	{name: 'Orchard Street Bakery', short: 'Orchard St.', prefix: 'OSB-', layout: 2, accent: '#9A3412', font: 'display', city: 'Burlington, VT 05401', items: ['Pastry delivery, 4 weeks', 'Custom cake'], file: (n) => `orchard st bakery ${n}.pdf`},
];

export type Invoice = {
	i: number;
	v: Vendor;
	no: string;
	day: number;
	date: string; // on the document
	cell: string; // in the sheet
	amount: number;
	amountStr: string;
	due: string;
	items: {d: string; q: number; amt: number}[];
	sub: number;
	tax: number;
	file: string;
};

const money = (x: number) => '$' + x.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
export const fmt = money;
const MON = 'Oct';


const build = (): Invoice[] => {
	const r = rng(20261006);
	const out: Invoice[] = [];
	const counters = V.map(() => 1000 + Math.floor(r() * 8000));
	// first two are the ones James does by hand: make them clean, distinct, readable
	const fixed = [0, 1, 2, 3];
	for (let i = 0; i < 200; i++) {
		const vi = i < fixed.length ? fixed[i] : Math.floor(r() * V.length);
		const v = V[vi];
		counters[vi] += 1 + Math.floor(r() * 7);
		const no = v.prefix === 'INV-' ? `INV-${10421 + i}` : `${v.prefix}${counters[vi]}`;
		const day = i === 0 ? 2 : i === 1 ? 3 : 1 + Math.floor(r() * 31);
		const amount =
			i === 0 ? 1284.5 : i === 1 ? 3460.0 : i === 2 ? 742.18 : Math.round(Math.exp(Math.log(86) + r() * (Math.log(9840) - Math.log(86))) * 100) / 100;
		const tax = Math.round(amount * 0.0725 * 100) / 100;
		const sub = Math.round((amount - tax) * 100) / 100;
		const n = Math.min(v.items.length, 1 + Math.floor(r() * v.items.length));
		const shares = new Array(n).fill(0).map(() => 0.3 + r());
		const tot = shares.reduce((a, b) => a + b, 0);
		let left = sub;
		const items = shares.map((s, k) => {
			const amt = k === n - 1 ? Math.round(left * 100) / 100 : Math.round(((sub * s) / tot) * 100) / 100;
			left -= amt;
			return {d: v.items[k], q: 1 + Math.floor(r() * 3), amt};
		});
		const dd = String(day).padStart(2, '0');
		out.push({
			i,
			v,
			no,
			day,
			date: `${MON} ${day}, 2026`,
			cell: `10/${dd}/2026`,
			amount,
			amountStr: money(amount),
			due: `Net 30`,
			items,
			sub,
			tax,
			file: v.file(no.replace(/^[A-Z]+-?/, ''), i),
		});
	}
	return out;
};

export const INVOICES = build();
export const BILL_TO = ['Lumen Studio LLC', 'Accounts Payable', '410 Mercer Street, Suite 3', 'New York, NY 10012'];
