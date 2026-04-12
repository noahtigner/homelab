import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import axios, { type AxiosError } from 'axios';

import './index.css';
import Index from './pages/Index.tsx';

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
			<div className="mx-auto max-w-[1440px] px-3 py-3 sm:px-4 sm:py-4">
				<Index />
			</div>
		</QueryClientProvider>
	</React.StrictMode>
);
