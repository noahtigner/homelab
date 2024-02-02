import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type AxiosError } from 'axios';

import App from './App.tsx';
import './index.css';

declare module '@tanstack/react-query' {
	interface Register {
		defaultError: AxiosError;
	}
}

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<QueryClientProvider client={queryClient}>
			<App />
		</QueryClientProvider>
	</React.StrictMode>
);
