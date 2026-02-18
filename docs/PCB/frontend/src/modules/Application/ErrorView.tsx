import { useRouteError, useNavigate } from 'react-router'
import { Box, Button, Typography } from '@mui/material'
import Wrapper from '../../components/UI/Wrapper'
import AppBarView from './AppBarView'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'

export default function ErrorView() {
	const error: any = useRouteError()
	const navigate = useNavigate()

	let title = 'Wystąpił błąd'
	let message = 'Coś poszło nie tak!'

	if (error.status === 500) {
		title = 'Błąd serwera (500)'
		message = error.data?.message || 'Wewnętrzny błąd serwera.'
	}

	if (error.status === 404) {
		title = 'Nie znaleziono (404)'
		message = 'Nie znaleziono zasobu lub strony.'
	}

	if (error.status === 401) {
		title = 'Brak autoryzacji (401)'
		message = 'Nie masz uprawnień do tego zasobu.'
	}

	if (error.status === 422) {
		title = 'Nieprawidłowe dane (422)'
		message = 'Przesłane dane są nieprawidłowe.'
	}

	return (
		<Box component={'section'}>
			<AppBarView />
			<Wrapper>
				<Box
					sx={{
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'center',
						alignItems: 'center',
						textAlign: 'center',
						minHeight: '50vh',
						gap: 2,
					}}>
					<ErrorOutlineIcon sx={{ fontSize: 72, color: 'error.main' }} />
					<Typography variant='h4' sx={{ fontWeight: 700, color: 'text.primary' }}>
						{title}
					</Typography>
					<Typography variant='body1' color='text.secondary' sx={{ maxWidth: 480 }}>
						{message}
					</Typography>
					<Button variant='contained' size='large' onClick={() => navigate('/')} sx={{ mt: 2 }}>
						Wróć na stronę główną
					</Button>
				</Box>
			</Wrapper>
		</Box>
	)
}
