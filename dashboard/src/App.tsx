import { Container, ThemeProvider, createTheme } from '@mui/material';
import Index from './pages/Index';

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
	// spacing: 4,
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

function App() {
	return (
		<ThemeProvider theme={theme}>
			<Container maxWidth="xl">
				<Index />
			</Container>
		</ThemeProvider>
	);
}

export default App;
