import React from 'react';
import {C, E, prog} from '../lib/theme';
import {at} from './beats';
import {Page} from '../type/Page';
import {Typed} from '../type/Typed';

const SIZE = 140;
const ADV = 0.565 * SIZE; // Geist Mono advance with the -0.035em tracking

/** "A 2-HOUR TUTORIAL." on verb 13, "DONE IN 41 SECONDS." on verb 14, the 2 hours struck out on verb 16 */
export const SNumber: React.FC<{t: number}> = ({t}) => {
	const L1 = 'A 2-HOUR TUTORIAL.';
	const strike = prog(t, at(15), at(15) + 0.14, E.out);
	const gone = prog(t, at(15) + 0.05, at(15) + 0.3, E.out);
	return (
		<Page t={t - at(12) + 1} index="02" label="THE TIME">
			<Typed t={t} x={96} y={300} size={SIZE} cps={46} color={gone > 0 ? `rgba(18,16,16,${1 - 0.6 * gone})` : C.ink} keys={[{t: at(12), text: L1}]} />
			<div style={{position: 'absolute', left: 96 - 10, top: 300 + SIZE * 0.5, width: (L1.length * ADV + 20) * strike, height: 16, background: C.orange}} />
			<Typed t={t} x={96} y={300 + SIZE * 1.3} size={SIZE} cps={46} keys={[{t: at(13), text: 'DONE IN ~41 SECONDS~.'}]} />
		</Page>
	);
};
