import React from 'react';
import {DISPLAY} from '../lib/tokens';

type Stretch = 'condensed' | 'expanded' | 'normal';
const STRETCH_PCT: Record<Stretch, string> = {condensed: '62%', expanded: '125%', normal: '100%'};
const STRETCH_KW: Record<Stretch, string> = {condensed: 'extra-condensed', expanded: 'expanded', normal: 'normal'};

let ctx: CanvasRenderingContext2D | null = null;
/** width of `text` in Archivo at size 100 */
export const measure = (text: string, weight: number, stretch: Stretch, tracking = 0) => {
	if (!ctx) ctx = document.createElement('canvas').getContext('2d');
	if (!ctx) return text.length * 60;
	ctx.font = `${weight} 100px "${DISPLAY}"`;
	// Chrome supports fontStretch keywords on canvas
	(ctx as unknown as {fontStretch: string}).fontStretch = STRETCH_KW[stretch];
	return ctx.measureText(text).width + tracking * 100 * Math.max(0, text.length - 1);
};
/** font size that makes `text` exactly `w` px wide */
export const fitSize = (text: string, w: number, weight = 800, stretch: Stretch = 'condensed', tracking = 0) => (100 * w) / Math.max(1, measure(text, weight, stretch, tracking));

export const CHROME = 'linear-gradient(180deg, #FFFFFF 0%, #F4F4F7 26%, #C9CAD1 52%, #9C9EA6 74%, #E6E7EB 100%)';
export const CHROME_DIM = 'linear-gradient(180deg, #E8E8EC 0%, #C2C3CA 45%, #7E8089 100%)';

/** big chrome display type; `w` fits the line to that width */
export const Big: React.FC<{
	text: string;
	w?: number;
	size?: number;
	weight?: number;
	stretch?: Stretch;
	tracking?: number;
	fill?: string;
	sheen?: number; // -1..2 sweep position of a light sheen
	style?: React.CSSProperties;
	sy?: number; // vertical stretch
}> = ({text, w, size, weight = 800, stretch = 'condensed', tracking = -0.01, fill = CHROME, sheen, style, sy = 1}) => {
	const fs = size ?? fitSize(text, w ?? 1600, weight, stretch, tracking);
	const sheenBg = sheen !== undefined ? `linear-gradient(100deg, rgba(255,255,255,0) ${(sheen - 0.15) * 100}%, rgba(255,255,255,0.95) ${sheen * 100}%, rgba(255,255,255,0) ${(sheen + 0.15) * 100}%), ` : '';
	return (
		<div
			style={{
				fontFamily: DISPLAY,
				fontWeight: weight,
				fontStretch: STRETCH_PCT[stretch],
				fontSize: fs,
				lineHeight: 0.8,
				letterSpacing: `${tracking}em`,
				whiteSpace: 'nowrap',
				backgroundImage: sheenBg + fill,
				WebkitBackgroundClip: 'text',
				backgroundClip: 'text',
				color: 'transparent',
				transform: sy !== 1 ? `scaleY(${sy})` : undefined,
				transformOrigin: '50% 100%',
				paddingTop: fs * 0.04,
				...style,
			}}
		>
			{text}
		</div>
	);
};
