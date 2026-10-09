import React from 'react';

type P = {s?: number; c?: string; w?: number};
const S: React.FC<P & {children: React.ReactNode; vb?: string}> = ({s = 16, c = 'currentColor', w = 1.7, children, vb = '0 0 24 24'}) => (
	<svg width={s} height={s} viewBox={vb} fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" style={{display: 'block', flexShrink: 0}}>
		{children}
	</svg>
);

export const IChevL: React.FC<P> = (p) => <S {...p}><path d="M15 5l-7 7 7 7" /></S>;
export const IChevR: React.FC<P> = (p) => <S {...p}><path d="M9 5l7 7-7 7" /></S>;
export const IChevD: React.FC<P> = (p) => <S {...p}><path d="M6 9l6 6 6-6" /></S>;
export const ISidebar: React.FC<P> = (p) => <S {...p}><rect x="3" y="4.5" width="18" height="15" rx="3" /><path d="M9 4.5v15" /></S>;
export const IShare: React.FC<P> = (p) => <S {...p}><path d="M12 3v12" /><path d="M8 7l4-4 4 4" /><path d="M6 11v8a2 2 0 002 2h8a2 2 0 002-2v-8" /></S>;
export const IPlus: React.FC<P> = (p) => <S {...p}><path d="M12 5v14M5 12h14" /></S>;
export const ITabs: React.FC<P> = (p) => <S {...p}><rect x="3.5" y="3.5" width="7" height="7" rx="1.6" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.6" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.6" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.6" /></S>;
export const ILock: React.FC<P> = (p) => <S {...p}><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 018 0v3" /></S>;
export const ISearch: React.FC<P> = (p) => <S {...p}><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-4.2-4.2" /></S>;
export const IReload: React.FC<P> = (p) => <S {...p}><path d="M20 12a8 8 0 11-2.4-5.7" /><path d="M20 4v5h-5" /></S>;
export const IMic: React.FC<P> = (p) => <S {...p}><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0014 0M12 18v3" /></S>;
export const IVideo: React.FC<P> = (p) => <S {...p}><rect x="3" y="6" width="13" height="12" rx="2.5" /><path d="M16 10l5-3v10l-5-3" /></S>;
export const IScreen: React.FC<P> = (p) => <S {...p}><rect x="3" y="4" width="18" height="13" rx="2" /><path d="M12 14V8M9 10l3-3 3 3M8 21h8" /></S>;
export const IPeople: React.FC<P> = (p) => <S {...p}><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0113 0" /><circle cx="17" cy="9" r="2.8" /><path d="M16 14.2a5 5 0 016 5" /></S>;
export const IChat: React.FC<P> = (p) => <S {...p}><path d="M4 5h16v11H9l-5 4z" /></S>;
export const IDots: React.FC<P> = (p) => <S {...p}><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></S>;
export const IPhoneDown: React.FC<P> = (p) => <S {...p}><path d="M3 14c5-5 13-5 18 0l-2.5 2.5-3.5-1.5v-3c-2-.7-4-.7-6 0v3L5.5 16.5z" fill={p.c || 'currentColor'} /></S>;
export const IHash: React.FC<P> = (p) => <S {...p}><path d="M9 4L7 20M17 4l-2 16M4 9h16M3 15h16" /></S>;
export const IBell: React.FC<P> = (p) => <S {...p}><path d="M6 16V11a6 6 0 0112 0v5l2 2H4z" /><path d="M10 20a2 2 0 004 0" /></S>;
export const IInbox: React.FC<P> = (p) => <S {...p}><path d="M3 13l3-8h12l3 8v6H3z" /><path d="M3 13h5l1 3h6l1-3h5" /></S>;
export const IStar: React.FC<P> = (p) => <S {...p}><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" /></S>;
export const ISend: React.FC<P> = (p) => <S {...p}><path d="M4 12l16-8-6 16-2-7z" /></S>;
export const ITrash: React.FC<P> = (p) => <S {...p}><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" /></S>;
export const ICompose: React.FC<P> = (p) => <S {...p}><path d="M4 20h4L19 9l-4-4L4 16z" /><path d="M14 6l4 4" /></S>;
export const IFolder: React.FC<P> = (p) => <S {...p}><path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></S>;
export const IFile: React.FC<P> = (p) => <S {...p}><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v4h4" /></S>;
export const IBranch: React.FC<P> = (p) => <S {...p}><circle cx="6" cy="5" r="2" /><circle cx="6" cy="19" r="2" /><circle cx="18" cy="7" r="2" /><path d="M6 7v10M18 9c0 5-12 3-12 8" /></S>;
export const ICheck: React.FC<P> = (p) => <S {...p}><path d="M5 12.5l4.5 4.5L19 7" /></S>;
export const ICal: React.FC<P> = (p) => <S {...p}><rect x="3.5" y="5" width="17" height="15" rx="2.5" /><path d="M3.5 10h17M8 3v4M16 3v4" /></S>;
export const ITable: React.FC<P> = (p) => <S {...p}><rect x="3.5" y="4.5" width="17" height="15" rx="2" /><path d="M3.5 9.5h17M3.5 14.5h17M9.5 4.5v15" /></S>;
export const IChart: React.FC<P> = (p) => <S {...p}><path d="M5 20V10M10 20V5M15 20v-7M20 20v-4" /></S>;
export const IText: React.FC<P> = (p) => <S {...p}><path d="M5 6V4h14v2M12 4v16M9 20h6" /></S>;
export const IShape: React.FC<P> = (p) => <S {...p}><rect x="3.5" y="10.5" width="10" height="10" rx="1.5" /><circle cx="16" cy="8" r="4.5" /></S>;
export const IMedia: React.FC<P> = (p) => <S {...p}><rect x="3.5" y="4.5" width="17" height="15" rx="2" /><circle cx="9" cy="10" r="1.6" /><path d="M20.5 16l-5-5-8 8.5" /></S>;
export const IComment: React.FC<P> = (p) => <S {...p}><path d="M5 5h14v10H11l-4 4v-4H5z" /></S>;
export const IFormat: React.FC<P> = (p) => <S {...p}><path d="M5 19L11 5l6 14M7.5 14h7" /></S>;
export const IList: React.FC<P> = (p) => <S {...p}><path d="M9 6h11M9 12h11M9 18h11" /><circle cx="4.5" cy="6" r="1" /><circle cx="4.5" cy="12" r="1" /><circle cx="4.5" cy="18" r="1" /></S>;
export const ITerminal: React.FC<P> = (p) => <S {...p}><path d="M5 7l5 5-5 5M12 18h7" /></S>;
export const IPlay: React.FC<P> = (p) => <S {...p}><path d="M7 4l13 8-13 8z" fill={p.c || 'currentColor'} /></S>;
export const IPause: React.FC<P> = (p) => <S {...p}><path d="M7 4h3v16H7zM14 4h3v16h-3z" fill={p.c || 'currentColor'} /></S>;

/** ⌘ ⌃ ⌥ ⇧ drawn as paths (the bundled Inter subset has no keyboard symbols) */
export const GCmd: React.FC<P> = ({s = 16, c = 'currentColor', w = 1.6}) => (
	<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={w} style={{display: 'block'}}>
		<path d="M9 9V6.5A2.5 2.5 0 106.5 9H17.5A2.5 2.5 0 1015 6.5V17.5A2.5 2.5 0 1017.5 15H6.5A2.5 2.5 0 109 17.5V9z" strokeLinejoin="round" />
	</svg>
);
export const GCtrl: React.FC<P> = ({s = 16, c = 'currentColor', w = 1.8}) => (
	<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" style={{display: 'block'}}>
		<path d="M5 13l7-7 7 7" />
	</svg>
);
export const GOpt: React.FC<P> = ({s = 16, c = 'currentColor', w = 1.6}) => (
	<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" style={{display: 'block'}}>
		<path d="M3 6h5l8 12h5M14 6h7" />
	</svg>
);

export const AppleLogo: React.FC<{s?: number; c?: string}> = ({s = 16, c = '#fff'}) => (
	<svg width={s} height={s} viewBox="0 0 170 170" style={{display: 'block'}}>
		<path
			fill={c}
			d="M150.4 130.3c-2.4 5.5-5.2 10.6-8.4 15.3-4.4 6.3-8 10.6-10.8 13-4.3 4-8.9 6-13.9 6.1-3.6 0-7.9-1-12.9-3.1-5-2.1-9.6-3.1-13.8-3.1-4.4 0-9.1 1-14.1 3.1-5 2.1-9.1 3.2-12.2 3.3-4.8.2-9.5-1.9-14.2-6.3-3-2.6-6.8-7.1-11.3-13.5-4.8-6.8-8.8-14.7-11.9-23.7-3.3-9.7-5-19.1-5-28.2 0-10.4 2.3-19.4 6.8-26.9 3.5-6.1 8.3-10.9 14.2-14.4 5.9-3.5 12.3-5.3 19.2-5.4 3.8 0 8.7 1.2 14.9 3.5 6.1 2.3 10.1 3.5 11.8 3.5 1.3 0 5.7-1.4 13.2-4.1 7.1-2.5 13-3.6 18-3.2 13.3 1.1 23.3 6.3 30 15.9-11.9 7.2-17.8 17.3-17.7 30.3.1 10.1 3.8 18.5 10.9 25.2 3.2 3.1 6.9 5.4 10.9 7.1-.9 2.5-1.8 4.9-2.8 7.2zM119.1 7.2c0 7.9-2.9 15.3-8.7 22.2-7 8.1-15.4 12.8-24.6 12.1-.1-1-.2-2-.2-3.1 0-7.6 3.3-15.8 9.2-22.4 2.9-3.4 6.6-6.2 11.1-8.4 4.5-2.2 8.7-3.4 12.7-3.6.1 1.1.2 2.1.2 3.2z"
		/>
	</svg>
);
