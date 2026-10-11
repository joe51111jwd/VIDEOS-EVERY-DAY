import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {DURATION, fb} from '../lib/beats';
import {Grain, Vignette} from './kit';
import {ShotHook, ShotName, ShotRepo, ShotRewrite, ShotVersus} from './shots1';
import {ShotAgain, ShotEnd, ShotKept, ShotLine, ShotPort, ShotProof, ShotSkip, ShotWhole} from './shots2';

const at = (k: number) => (k <= 0 ? 0 : fb(k));
const Shot: React.FC<{k0: number; k1: number; children: React.ReactNode}> = ({k0, k1, children}) => (
	<Sequence from={at(k0)} durationInFrames={Math.min(DURATION, fb(k1)) - at(k0)}>
		{children}
	</Sequence>
);

export const Film2: React.FC = () => (
	<AbsoluteFill style={{background: '#000'}}>
		<Shot k0={0} k1={4}>
			<ShotHook />
		</Shot>
		<Shot k0={3.6} k1={6}>
			<ShotName />
		</Shot>
		<Shot k0={6} k1={10}>
			<ShotRewrite />
		</Shot>
		<Shot k0={10} k1={12}>
			<ShotRepo />
		</Shot>
		<Shot k0={12} k1={16}>
			<ShotVersus />
		</Shot>
		<Shot k0={16} k1={22.5}>
			<ShotProof />
		</Shot>
		<Shot k0={22.5} k1={28}>
			<ShotAgain />
		</Shot>
		<Shot k0={28} k1={32}>
			<ShotKept />
		</Shot>
		<Shot k0={32} k1={36}>
			<ShotSkip />
		</Shot>
		<Shot k0={36} k1={40}>
			<ShotPort />
		</Shot>
		<Shot k0={40} k1={44}>
			<ShotWhole />
		</Shot>
		<Shot k0={44} k1={48}>
			<ShotLine />
		</Shot>
		<Shot k0={48} k1={60}>
			<ShotEnd />
		</Shot>
		<Vignette />
		<Grain />
	</AbsoluteFill>
);
