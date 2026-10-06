import React from 'react';
import {AbsoluteFill} from 'remotion';
import {INVOICES} from './data';
import {InvoicePage} from './Invoice';

export const InvoiceTest: React.FC = () => (
	<AbsoluteFill style={{background: '#D9D9DE', flexDirection: 'row', flexWrap: 'wrap', gap: 24, padding: 24}}>
		{[0, 1, 2, 3].map((i) => (
			<div key={i} style={{transform: 'scale(0.75)', transformOrigin: '0 0', width: 450, height: 582, boxShadow: '0 10px 30px rgba(0,0,0,0.2)'}}>
				<InvoicePage inv={INVOICES[i]} sel={{vendor: 1, no: 1, date: i % 2 ? 1 : 0.5, amount: 1}} />
			</div>
		))}
	</AbsoluteFill>
);
