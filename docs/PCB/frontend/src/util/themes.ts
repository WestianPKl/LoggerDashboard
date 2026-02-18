import { createTheme } from '@mui/material'

export const theme = createTheme({
	palette: {
		mode: 'light',
		primary: {
			main: '#5066c3',
			light: '#becff8',
			dark: '#1240c8',
			contrastText: '#fff',
		},
		secondary: {
			main: '#64748b',
			light: '#94a3b8',
			dark: '#475569',
			contrastText: '#fff',
		},
		background: { default: '#f8fafc', paper: '#ffffff' },
		text: {
			primary: '#1e293b',
			secondary: '#64748b',
			disabled: '#94a3b8',
		},
		divider: '#e2e8f0',
		error: {
			main: '#ef4444',
			light: '#fca5a5',
			dark: '#dc2626',
			contrastText: '#fff',
		},
		warning: {
			main: '#f59e0b',
			light: '#fcd34d',
			dark: '#d97706',
			contrastText: '#fff',
		},
		info: {
			main: '#3b82f6',
			light: '#93c5fd',
			dark: '#2563eb',
			contrastText: '#fff',
		},
		success: {
			main: '#22c55e',
			light: '#86efac',
			dark: '#16a34a',
			contrastText: '#fff',
		},
	},
	typography: {
		fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
		h3: { fontWeight: 700, letterSpacing: '-0.02em' },
		h4: { fontWeight: 700, letterSpacing: '-0.01em' },
		h5: { fontWeight: 600 },
		h6: { fontWeight: 600 },
		subtitle1: { fontWeight: 500, color: '#64748b' },
	},
	shape: { borderRadius: 12 },
	components: {
		MuiAppBar: {
			styleOverrides: {
				root: {
					boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
				},
			},
		},
		MuiButton: {
			styleOverrides: {
				root: {
					textTransform: 'none',
					fontWeight: 600,
					borderRadius: 8,
				},
			},
			defaultProps: {
				disableElevation: true,
			},
		},
		MuiCard: {
			styleOverrides: {
				root: {
					borderRadius: 12,
					boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.06)',
				},
			},
		},
		MuiTab: {
			styleOverrides: {
				root: {
					textTransform: 'none',
					fontWeight: 600,
					minHeight: 48,
				},
			},
		},
		MuiDialog: {
			styleOverrides: {
				paper: {
					borderRadius: 16,
				},
			},
		},
		MuiChip: {
			styleOverrides: {
				root: {
					fontWeight: 600,
				},
			},
		},
	},
})
