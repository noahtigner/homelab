import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import axios, { type AxiosError } from 'axios';

import './index.css';
import Index from './pages/Index.tsx';
import { Container } from './components/ui';

declare module '@tanstack/react-query' {
	interface Register {
		defaultError: AxiosError;
	}
}

axios.defaults.baseURL = import.meta.env.VITE_API_BASE;

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<QueryClientProvider client={queryClient}>
			<Container
				maxWidth="xl"
				style={{
					paddingTop: 'calc(var(--spacing-unit) * 2)',
					paddingBottom: 'calc(var(--spacing-unit) * 2)',
				}}
			>
				<Index />
			</Container>
		</QueryClientProvider>
	</React.StrictMode>
);
