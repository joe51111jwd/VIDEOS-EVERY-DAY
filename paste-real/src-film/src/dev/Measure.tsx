import React, {useLayoutEffect, useRef} from 'react';
import {AbsoluteFill} from 'remotion';
import {useFontsReady} from '../lib/tokens';
import {Hero} from '../pr/Hero';

const WS = Array.from({length: 123}, (_, i) => 390 + i * 5);
export const Measure: React.FC = () => {
	const ok = useFontsReady();
	const refs = useRef<(HTMLDivElement | null)[]>([]);
	useLayoutEffect(() => {
		if (!ok) return;
		const out = WS.map((w, i) => `${w}:${refs.current[i]?.offsetHeight}`).join(' ');
		console.log('HEIGHTS ' + out);
	}, [ok]);
	return (
		<AbsoluteFill style={{background: '#fff'}}>
			{WS.map((w, i) => (
				<div key={w} ref={(el) => { refs.current[i] = el; }} style={{position: 'absolute', left: 0, top: 0, width: w, visibility: 'hidden'}}>
					<Hero w={w} />
				</div>
			))}
		</AbsoluteFill>
	);
};
