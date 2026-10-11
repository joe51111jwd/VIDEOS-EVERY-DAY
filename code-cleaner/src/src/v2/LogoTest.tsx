import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Logo3D, usePose} from './Logo3D';
import {L, LF} from '../lib/theme';

export const LogoTest: React.FC = () => {
	const a = usePose(0, 12, 'graphite');
	const b = usePose(0, 12, 'titanium');
	return (
		<AbsoluteFill style={{background: L.bg, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 10}}>
			<Logo3D size={560} pose={a} />
			<Logo3D size={560} pose={b} />
			<div style={{fontFamily: LF.sans, fontWeight: 600, fontSize: 150, letterSpacing: '-0.05em', color: L.ink}}>Lossless</div>
		</AbsoluteFill>
	);
};
