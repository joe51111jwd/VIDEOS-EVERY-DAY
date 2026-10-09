import React from 'react';
import {Img, staticFile} from 'remotion';
import {C, SANS} from '../lib/tokens';
import {Shell, Traffic, WinBox} from '../mac/Window';
import {IChat, IChevD, ICompose, IHash, IInbox, IMic, IPeople, IPhoneDown, IScreen, ISearch, ISend, IStar, ITrash, IVideo} from '../mac/icons';

export const P = (id: string) => staticFile('img/p-' + id + '.jpg');
export const PEOPLE = {
	maya: '1438761681033-6461ffad8d80',
	sofia: '1494790108377-be9c29b29330',
	dan: '1500648767791-00dcc994a43e',
	leo: '1506794778202-cad84cf45f1d',
	marco: '1507003211169-0a1dd7228f2d',
	jen: '1517841905240-472988babdf9',
	ana: '1534528741775-53994a69daeb',
	theo: '1539571696357-5a69c17a67c6',
	elle: '1544005313-94ddf0286df2',
	kate: '1580489944761-15a19d654956',
};
type Who = keyof typeof PEOPLE;

export const Avatar: React.FC<{who: Who; s?: number; r?: number}> = ({who, s = 32, r = 8}) => (
	<Img src={P(PEOPLE[who])} style={{width: s, height: s, borderRadius: r, objectFit: 'cover', flexShrink: 0}} />
);

/** a video call window (Zoom-like) */
export const Call: React.FC<{box: WinBox; title: string; people: {who: Who; name: string; talking?: boolean}[]; focused?: boolean; timer?: string}> = ({box, title, people, focused, timer = '24:13'}) => {
	const cols = people.length > 2 ? 2 : people.length;
	const rows = Math.ceil(people.length / cols);
	const top = 40;
	const bot = 64;
	const gw = (box.w - 16 - (cols - 1) * 8) / cols;
	const gh = (box.h - top - bot - 8 - (rows - 1) * 8) / rows;
	return (
		<Shell box={box} bg="#111113">
			<div style={{position: 'absolute', left: 0, right: 0, top: 0, height: top, fontFamily: SANS}}>
				<div style={{position: 'absolute', left: 14, top: 14}}>
					<Traffic active={focused} size={12} />
				</div>
				<div style={{textAlign: 'center', lineHeight: top + 'px', fontSize: 13, fontWeight: 600, color: '#D6D6DA'}}>
					{title} <span style={{color: '#7E7E85', fontWeight: 500}}>· {timer}</span>
				</div>
				<div style={{position: 'absolute', right: 14, top: 12, width: 8, height: 8, borderRadius: 8, background: '#FF453A'}} />
			</div>
			{people.map((p, i) => (
				<div key={i} style={{position: 'absolute', left: 8 + (i % cols) * (gw + 8), top: top + (Math.floor(i / cols)) * (gh + 8), width: gw, height: gh, borderRadius: 10, overflow: 'hidden', boxShadow: p.talking ? 'inset 0 0 0 3px #30D158' : 'none'}}>
					<Img src={P(PEOPLE[p.who])} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
					{p.talking ? <div style={{position: 'absolute', inset: 0, borderRadius: 10, boxShadow: 'inset 0 0 0 3px #30D158'}} /> : null}
					<div style={{position: 'absolute', left: 8, bottom: 8, padding: '3px 8px', borderRadius: 6, background: 'rgba(0,0,0,0.55)', color: '#fff', fontFamily: SANS, fontSize: 12, fontWeight: 600}}>{p.name}</div>
				</div>
			))}
			<div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: bot, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, color: '#E8E8EC'}}>
				{[IMic, IVideo, IScreen, IPeople, IChat].map((I, i) => (
					<div key={i} style={{width: 42, height: 42, borderRadius: 42, background: '#2C2C30', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
						<I s={19} />
					</div>
				))}
				<div style={{width: 64, height: 42, borderRadius: 42, background: '#FF3B30', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'}}>
					<IPhoneDown s={22} c="#fff" />
				</div>
			</div>
		</Shell>
	);
};

/** team chat (Slack-like, dark) */
export const Chat: React.FC<{box: WinBox; channel: string; channels: string[]; msgs: {who: Who; name: string; time: string; text: string}[]; focused?: boolean}> = ({box, channel, channels, msgs, focused}) => (
	<Shell box={box} bg="#1A1D21">
		<div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 210, background: '#19171D', borderRight: '1px solid #2A2A30', fontFamily: SANS}}>
			<div style={{position: 'absolute', left: 14, top: 14}}>
				<Traffic active={focused} size={12} />
			</div>
			<div style={{position: 'absolute', left: 16, top: 42, fontSize: 16, fontWeight: 800, color: '#F2F2F4', display: 'flex', alignItems: 'center', gap: 4}}>
				Northstar <IChevD s={14} />
			</div>
			<div style={{position: 'absolute', left: 8, right: 8, top: 80, fontSize: 14, color: '#B9B9BF'}}>
				{channels.map((c, i) => (
					<div key={i} style={{display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px', borderRadius: 6, background: c === channel ? '#1164A3' : 'transparent', color: c === channel ? '#fff' : i % 3 === 1 ? '#fff' : '#B9B9BF', fontWeight: i % 3 === 1 && c !== channel ? 700 : 500}}>
						<IHash s={14} />
						{c}
					</div>
				))}
			</div>
		</div>
		<div style={{position: 'absolute', left: 210, right: 0, top: 0, height: 50, borderBottom: '1px solid #2A2A30', display: 'flex', alignItems: 'center', paddingLeft: 18, gap: 6, fontFamily: SANS, fontWeight: 800, fontSize: 16, color: '#F2F2F4'}}>
			<IHash s={16} /> {channel}
		</div>
		<div style={{position: 'absolute', left: 226, right: 16, top: 62, fontFamily: SANS}}>
			{msgs.map((m, i) => (
				<div key={i} style={{display: 'flex', gap: 10, marginBottom: 14}}>
					<Avatar who={m.who} s={36} r={8} />
					<div>
						<div style={{fontSize: 14.5, fontWeight: 800, color: '#F2F2F4'}}>
							{m.name} <span style={{fontSize: 12, fontWeight: 500, color: '#8E8E94', marginLeft: 4}}>{m.time}</span>
						</div>
						<div style={{fontSize: 14.5, color: '#D1D1D6', lineHeight: 1.4, marginTop: 2}}>{m.text}</div>
					</div>
				</div>
			))}
		</div>
		<div style={{position: 'absolute', left: 226, right: 16, bottom: 14, height: 44, borderRadius: 8, border: '1px solid #3A3A40', fontFamily: SANS, fontSize: 14, color: '#7D7D84', display: 'flex', alignItems: 'center', paddingLeft: 12}}>
			Message #{channel}
			<div style={{marginLeft: 'auto', marginRight: 12, color: '#7D7D84'}}>
				<ISend s={16} />
			</div>
		</div>
	</Shell>
);

/** Mail (dark): mailbox list + message list */
export const Mail: React.FC<{box: WinBox; mails: {from: string; subj: string; prev: string; time: string; unread?: boolean}[]; focused?: boolean; count?: number}> = ({box, mails, focused, count = 214}) => (
	<Shell box={box} bg="#1E1E20">
		<div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 190, background: '#28282B', borderRight: '1px solid rgba(0,0,0,0.5)', fontFamily: SANS, color: '#D6D6DA', fontSize: 13.5}}>
			<div style={{position: 'absolute', left: 16, top: 18}}>
				<Traffic active={focused} />
			</div>
			<div style={{position: 'absolute', left: 14, top: 56, fontSize: 11.5, fontWeight: 650, color: '#8E8E94'}}>Favorites</div>
			{[
				[IInbox, 'Inbox', String(count)],
				[IStar, 'VIPs', ''],
				[ISend, 'Sent', ''],
				[ITrash, 'Trash', ''],
			].map(([I, n, c], i) => {
				const Ico = I as React.FC<{s?: number; c?: string}>;
				return (
					<div key={i} style={{position: 'absolute', left: 8, right: 8, top: 76 + i * 30, height: 28, borderRadius: 6, background: i === 0 ? 'rgba(255,255,255,0.1)' : 'transparent', display: 'flex', alignItems: 'center', gap: 8, padding: '0 8px'}}>
						<Ico s={16} c={C.blue} />
						<span style={{fontWeight: 500}}>{n as string}</span>
						<span style={{marginLeft: 'auto', color: '#8E8E94', fontSize: 12.5}}>{c as string}</span>
					</div>
				);
			})}
		</div>
		<div style={{position: 'absolute', left: 190, right: 0, top: 0, height: 54, borderBottom: '1px solid rgba(255,255,255,0.06)', fontFamily: SANS}}>
			<div style={{position: 'absolute', left: 18, top: 9, fontSize: 15, fontWeight: 750, color: '#F2F2F4'}}>Inbox</div>
			<div style={{position: 'absolute', left: 18, top: 29, fontSize: 11.5, color: '#8E8E94'}}>{count} messages, 37 unread</div>
			<div style={{position: 'absolute', right: 16, top: 18, display: 'flex', gap: 16, color: '#9C9CA3'}}>
				<ICompose s={17} />
				<ISearch s={17} />
			</div>
		</div>
		<div style={{position: 'absolute', left: 190, right: 0, top: 54, fontFamily: SANS}}>
			{mails.map((m, i) => (
				<div key={i} style={{position: 'relative', padding: '9px 18px 9px 30px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: i === 0 ? '#0A5CC2' : 'transparent'}}>
					{m.unread && i ? <div style={{position: 'absolute', left: 12, top: 15, width: 9, height: 9, borderRadius: 9, background: C.blue}} /> : null}
					<div style={{display: 'flex', fontSize: 13.5, fontWeight: 700, color: '#F2F2F4'}}>
						{m.from}
						<span style={{marginLeft: 'auto', fontSize: 12, fontWeight: 500, color: i === 0 ? '#D8E6FF' : '#8E8E94'}}>{m.time}</span>
					</div>
					<div style={{fontSize: 13, color: '#E6E6EA', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{m.subj}</div>
					<div style={{fontSize: 12.5, color: i === 0 ? '#C9DBFF' : '#8E8E94', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{m.prev}</div>
				</div>
			))}
		</div>
	</Shell>
);

/** a macOS notification banner (top right) */
export const Banner: React.FC<{x: number; y: number; app: string; icon: React.ReactNode; title: string; body: string; when?: string; w?: number}> = ({x, y, app, icon, title, body, when = 'now', w = 380}) => (
	<div style={{position: 'absolute', left: x, top: y, width: w, borderRadius: 22, background: 'rgba(48,48,52,0.94)', boxShadow: '0 0 0 0.5px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.1), 0 14px 40px rgba(0,0,0,0.45)', padding: '12px 14px', display: 'flex', gap: 12, fontFamily: SANS, boxSizing: 'border-box'}}>
		<div style={{width: 38, height: 38, borderRadius: 10, overflow: 'hidden', flexShrink: 0}}>{icon}</div>
		<div style={{flex: 1, minWidth: 0}}>
			<div style={{display: 'flex', fontSize: 13.5, fontWeight: 700, color: '#F2F2F4'}}>
				{title}
				<span style={{marginLeft: 'auto', fontSize: 12, fontWeight: 500, color: '#9C9CA3'}}>{when}</span>
			</div>
			<div style={{fontSize: 13, color: '#D6D6DA', marginTop: 2, lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{body}</div>
		</div>
		<span style={{display: 'none'}}>{app}</span>
	</div>
);
