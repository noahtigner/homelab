import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import axios, { type AxiosError } from 'axios';

import './index.css';
import { createAppRouter } from './router';

declare module '@tanstack/react-query' {
	interface Register {
		defaultError: AxiosError;
	}
}

axios.defaults.baseURL = import.meta.env.VITE_API_BASE;

const queryClient = new QueryClient();
const router = createAppRouter();

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<QueryClientProvider client={queryClient}>
			<div className="mx-auto max-w-[1440px] px-3 py-3 sm:px-4 sm:py-4">
				<RouterProvider router={router} />
			</div>
		</QueryClientProvider>
	</React.StrictMode>
);
