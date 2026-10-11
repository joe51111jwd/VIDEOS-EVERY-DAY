import React, {useMemo} from 'react';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {Easing, interpolate, useCurrentFrame} from 'remotion';

/**
 * The Lossless mark: a rounded square split by a stepped seam (code indentation) into two
 * identical halves. Old and new are the same shape and fit with nothing lost; the seam glows
 * mint when they lock.
 */
const R = 0.5; // outer corner radius
// the seam, left edge to right edge; symmetric under a half turn
export const SEAM: [number, number][] = [
	[-1, 0.62],
	[-0.38, 0.62],
	[-0.38, 0],
	[0.38, 0],
	[0.38, -0.62],
	[1, -0.62],
];

export const halfShape = () => {
	const s = new THREE.Shape();
	s.moveTo(SEAM[0][0], SEAM[0][1]);
	for (const [x, y] of SEAM.slice(1)) s.lineTo(x, y);
	s.lineTo(1, 1 - R);
	s.quadraticCurveTo(1, 1, 1 - R, 1);
	s.lineTo(-1 + R, 1);
	s.quadraticCurveTo(-1, 1, -1, 1 - R);
	s.closePath();
	return s;
};

const Env: React.FC = () => {
	const {gl, scene} = useThree();
	useMemo(() => {
		const pm = new THREE.PMREMGenerator(gl);
		scene.environment = pm.fromScene(new RoomEnvironment(), 0.02).texture;
		gl.toneMapping = THREE.ACESFilmicToneMapping;
		gl.toneMappingExposure = 1.0;
	}, [gl, scene]);
	return null;
};

export type LogoPose = {
	/** 0 = halves apart, 1 = locked */
	lock: number;
	rotY: number;
	rotX: number;
	scale: number;
	/** 0..1 a key light travelling across the faces */
	sweep: number;
	/** 0..1 mint light in the seam */
	glow: number;
	finish?: 'graphite' | 'titanium';
};

const DEPTH = 0.46;
const Mark: React.FC<LogoPose & {seamOnly?: boolean}> = ({lock, rotY, rotX, scale, sweep, glow, finish = 'graphite', seamOnly}) => {
	const geo = useMemo(() => {
		const g = new THREE.ExtrudeGeometry(halfShape(), {depth: DEPTH, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.06, bevelSegments: 8, curveSegments: 32});
		g.translate(0, 0, -DEPTH / 2);
		return g;
	}, []);
	const mat = useMemo(
		() =>
			finish === 'graphite'
				? new THREE.MeshPhysicalMaterial({color: '#1c1f24', metalness: 0.9, roughness: 0.26, clearcoat: 1, clearcoatRoughness: 0.06, envMapIntensity: 2.2})
				: new THREE.MeshPhysicalMaterial({color: '#c9c4bc', metalness: 1, roughness: 0.22, clearcoat: 0.6, clearcoatRoughness: 0.1, envMapIntensity: 1.3}),
		[finish],
	);
	const seamMat = useMemo(() => new THREE.MeshBasicMaterial({color: new THREE.Color('#3DF5B0'), toneMapped: false, transparent: true}), []);
	seamMat.opacity = glow;
	// the glowing seam: thin boxes along each step, sitting in the gap
	const seam = useMemo(
		() =>
			SEAM.slice(1).map(([x, y], i) => {
				const [px, py] = SEAM[i];
				const len = Math.hypot(x - px, y - py);
				const horiz = Math.abs(y - py) < 1e-6;
				return {pos: [(x + px) / 2, (y + py) / 2, 0] as [number, number, number], size: [horiz ? len + 0.05 : 0.05, horiz ? 0.05 : len + 0.05, DEPTH + 0.16] as [number, number, number]};
			}),
		[],
	);
	const apart = 1 - lock;
	const gap = 0.075 + 0.9 * apart;
	return (
		<group rotation={[rotX, rotY, 0]} scale={scale}>
			{seamOnly ? null : (
				<>
					<group position={[gap / 2 + 0.25 * apart, gap / 2, 0.5 * apart]} rotation={[0, 0, -0.35 * apart]}>
						<mesh geometry={geo} material={mat} />
					</group>
					<group position={[-gap / 2 - 0.25 * apart, -gap / 2, -0.5 * apart]} rotation={[0, 0, Math.PI - 0.35 * apart]}>
						<mesh geometry={geo} material={mat} />
					</group>
				</>
			)}
			{glow > 0
				? seam.map((s, i) => (
						<mesh key={i} position={s.pos} material={seamMat}>
							<boxGeometry args={s.size} />
						</mesh>
					))
				: null}
			<pointLight position={[-3.2 + sweep * 6.4, 1.6, 2.4]} color="#ffffff" intensity={sweep > 0 && sweep < 1 ? 60 : 0} distance={9} />
		</group>
	);
};

const Canvas: React.FC<{size: number; pose: LogoPose; seamOnly?: boolean}> = ({size, pose, seamOnly}) => (
	<ThreeCanvas width={size} height={size} camera={{fov: 30, position: [0, 0, 6.4]}} gl={{antialias: true, alpha: true, preserveDrawingBuffer: true}}>
		<Env />
		<ambientLight intensity={0.08} />
		<directionalLight position={[-3, 4, 5]} intensity={1.6} />
		<directionalLight position={[4, -2, 3]} intensity={0.5} color="#bfe9ff" />
		<directionalLight position={[0, 5, -4]} intensity={2.4} />
		<Mark {...pose} seamOnly={seamOnly} />
	</ThreeCanvas>
);

/** the 3D mark plus a blurred copy of its seam on top, screen-blended: a cheap bloom */
export const Logo3D: React.FC<{size: number; pose: LogoPose}> = ({size, pose}) => (
	<div style={{position: 'relative', width: size, height: size}}>
		<Canvas size={size} pose={pose} />
		{pose.glow > 0 ? (
			<div style={{position: 'absolute', inset: 0, filter: `blur(${size * 0.022}px)`, mixBlendMode: 'screen', opacity: Math.min(1, pose.glow * 1.2)}}>
				<Canvas size={size} pose={pose} seamOnly />
			</div>
		) : null}
	</div>
);

const ce = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
/** the reveal: halves fly in, lock with a light flash in the seam, then a key light sweeps across */
export const usePose = (at: number, dur = 12, finish: LogoPose['finish'] = 'graphite'): LogoPose => {
	const f = useCurrentFrame() - at;
	const e = Easing.bezier(0.2, 0.9, 0.25, 1);
	return {
		lock: interpolate(f, [0, dur], [0, 1], {...ce, easing: e}),
		rotY: interpolate(f, [0, dur + 40], [-0.8, -0.22], {...ce, easing: Easing.bezier(0.16, 1, 0.3, 1)}),
		rotX: interpolate(f, [0, dur + 40], [0.45, 0.16], {...ce, easing: Easing.bezier(0.16, 1, 0.3, 1)}),
		scale: interpolate(f, [0, dur], [0.75, 1], {...ce, easing: e}),
		sweep: interpolate(f, [dur - 2, dur + 22], [0, 1], ce),
		glow: interpolate(f, [dur - 2, dur, dur + 24], [0, 1, 0.6], ce),
		finish,
	};
};
