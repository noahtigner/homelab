import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import axios, { type AxiosError } from 'axios';
import { Container, ThemeProvider, createTheme } from '@mui/material';

import './index.css';
import Index from './pages/Index.tsx';

declare module '@tanstack/react-query' {
	interface Register {
		defaultError: AxiosError;
	}
}

const theme = createTheme({
	palette: {
		mode: 'dark',
		background: {
			default: '#202020',
			paper: '#282828',
		},
		text: {
			primary: '#E6F0E6',
			secondary: '#969696',
		},
		primary: {
			main: '#6EDFCA',
			// main: 'rgb(255, 105, 45)',
		},
		success: {
			main: '#20503E',
			contrastText: '#A0F5D1',
		},
		error: {
			main: '#8C1D18',
			contrastText: '#F9DEDC',
		},
		warning: {
			main: '#534612',
			contrastText: '#FAE190',
		},
	},
	spacing: 4,
	shape: {
		borderRadius: 8,
	},
	typography: {
		fontFamily: 'Poppins, sans-serif',
	},
	components: {
		MuiDivider: {
			styleOverrides: {
				root: {
					'::before': {
						borderColor: '#969696',
					},
					'::after': {
						borderColor: '#969696',
					},
					textAlign: 'center',
					fontSize: '16px',
				},
			},
		},
		MuiButton: {
			styleOverrides: {
				root: {
					textTransform: 'none',
					borderRadius: '4px',
				},
			},
		},
		MuiChip: {
			styleOverrides: {
				root: {
					borderRadius: '8px',
				},
			},
		},
		MuiTableContainer: {
			styleOverrides: {
				root: {
					backgroundColor: '#282828',
				},
			},
		},
		MuiTable: {
			styleOverrides: {
				root: {
					backgroundColor: '#282828',
				},
			},
		},
	},
});

axios.defaults.baseURL = import.meta.env.VITE_API_BASE;

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<QueryClientProvider client={queryClient}>
			<ThemeProvider theme={theme}>
				<Container maxWidth="xl" sx={{ paddingY: 2 }}>
					<Index />
				</Container>
			</ThemeProvider>
		</QueryClientProvider>
	</React.StrictMode>
);
