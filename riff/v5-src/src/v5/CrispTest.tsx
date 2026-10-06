import React from 'react';
import {AbsoluteFill} from 'remotion';
import {SANS, SERIF} from './tokens';
export const CrispTest: React.FC = () => (
	<AbsoluteFill style={{background: '#fff', fontFamily: SANS}}>
		<div style={{position: 'absolute', left: 40, top: 40, transform: 'scale(3)', transformOrigin: '0 0', fontSize: 16}}>
			Scaled 3x transform <span style={{fontFamily: SERIF}}>Fraunces</span>
		</div>
		<div style={{position: 'absolute', left: 40, top: 160, fontSize: 48}}>
			Native 48px text <span style={{fontFamily: SERIF}}>Fraunces</span>
		</div>
		<div style={{position: 'absolute', left: 40, top: 280, transform: 'translate(0.5px,0) scale(3.01)', transformOrigin: '0 0', fontSize: 16}}>
			<div style={{transform: 'scale(0.9)', transformOrigin: '0 0'}}>Nested 2.7x transform</div>
		</div>
		<div style={{position: 'absolute', left: 40, top: 400, zoom: 3, fontSize: 16}}>CSS zoom 3x text</div>
	</AbsoluteFill>
);
