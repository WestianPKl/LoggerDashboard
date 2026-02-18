import { Box, Button, Typography } from '@mui/material'
import { useNavigate } from 'react-router'
import SearchOffIcon from '@mui/icons-material/SearchOff'

export default function NotFoundView() {
	const navigate = useNavigate()

	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
				alignItems: 'center',
				textAlign: 'center',
				minHeight: '60vh',
				gap: 2,
			}}>
			<SearchOffIcon sx={{ fontSize: 80, color: 'text.disabled' }} />
			<Typography variant='h2' sx={{ fontWeight: 800, color: 'text.primary' }}>
				404
			</Typography>
			<Typography variant='h6' color='text.secondary'>
				Nie znaleziono strony
			</Typography>
			<Typography variant='body2' color='text.secondary' sx={{ maxWidth: 400 }}>
				Strona, której szukasz, nie istnieje lub została przeniesiona.
			</Typography>
			<Button variant='contained' size='large' onClick={() => navigate('/')} sx={{ mt: 2 }}>
				Wróć na stronę główną
			</Button>
		</Box>
	)
}
