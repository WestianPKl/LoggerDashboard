import { createTheme } from '@mui/material'

export const theme = createTheme({
	palette: {
		mode: 'light',
		primary: {
			main: '#65b4b4',
			light: 'rgb(131, 195, 195)',
			dark: 'rgb(70, 125, 125)',
			contrastText: 'rgba(0, 0, 0, 0.78)',
		},
		secondary: {
			main: '#747475',
			light: 'rgb(187, 187, 187)',
			dark: 'rgb(81, 81, 81)',
			contrastText: '#fff',
		},
		background: { default: '#fff', paper: '#fff' },
		text: {
			primary: '#333',
			secondary: 'rgba(38, 38, 38, 0.7)',
			disabled: 'rgba(39, 39, 39, 0.34)',
		},
		divider: '#333',
		error: {
			main: '#f44336',
			light: '#e57373',
			dark: '#d32f2f',
			contrastText: '#fff',
		},
		warning: {
			main: '#ffa726',
			light: '#ffb74d',
			dark: '#f57c00',
			contrastText: 'rgba(0, 0, 0, 0.87)',
		},
		info: {
			main: '#29b6f6',
			light: '#4fc3f7',
			dark: '#0288d1',
			contrastText: 'rgba(0, 0, 0, 0.87)',
		},
		success: {
			main: '#66bb6a',
			light: '#81c784',
			dark: '#388e3c',
			contrastText: 'rgba(0, 0, 0, 0.87)',
		},
	},
})
