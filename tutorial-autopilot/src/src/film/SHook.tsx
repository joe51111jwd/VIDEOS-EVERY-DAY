import React from 'react';
import {at} from './beats';
import {Page} from '../type/Page';
import {Typed} from '../type/Typed';

/** "STOP ⏸ PAUSING TUTORIALS." one word per verb (verbs 0 to 2); the pause badge turns to play on verb 3 */
export const SHook: React.FC<{t: number}> = ({t}) => (
	<Page t={t + 1} index="00" label="TUTORIAL AUTOPILOT">
		<Typed
			t={t}
			x={96}
			y={236}
			size={200}
			lineHeight={1.02}
			flip={at(3)}
			keys={[
				{t: 0, text: 'STOP ⏸', cps: 30},
				{t: at(1), text: 'STOP ⏸\nPAUSING', cps: 36},
				{t: at(2), text: 'STOP ⏸\nPAUSING\nTUTORIALS.', cps: 40},
			]}
		/>
	</Page>
);
