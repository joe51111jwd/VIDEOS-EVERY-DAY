import React from 'react';
import {useCurrentFrame} from 'remotion';
import {FPS, at} from './beats';
import {SHook} from './SHook';
import {SBlender, SBLENDER_IN} from './SBlender';
import {SNumber} from './SNumber';
import {SPaste} from './SPaste';
import {SApps} from './SApps';
import {STeach} from './STeach';
import {SWall} from './SWall';
import {SClose, SLogo, LOGO_IN} from './SEnd';

/** the cut: every section starts on a verb of the song */
export const Film: React.FC = () => {
	const t = useCurrentFrame() / FPS;
	if (t < SBLENDER_IN()) return <SHook t={t} />;
	if (t < at(12)) return <SBlender t={t} />;
	if (t < at(17)) return <SNumber t={t} />;
	if (t < at(24)) return <SPaste t={t} />;
	if (t < at(40)) return <SApps t={t} />;
	if (t < at(48)) return <STeach t={t} />;
	if (t < at(56)) return <SWall t={t} />;
	if (t < LOGO_IN()) return <SClose t={t} />;
	return <SLogo t={t} />;
};
