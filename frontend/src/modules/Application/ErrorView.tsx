import { useRouteError } from 'react-router'
import { Box } from '@mui/material'
import Wrapper from '../../components/UI/Wrapper'
import AppBarView from './AppBarView'

export default function ErrorView() {
	const error: any = useRouteError()

	let title = 'An error occurred!'
	let message = 'Something went wrong!'

	if (error.status === 500) {
		title = 'Internal Server Error'
		message = error.data.message
	}

	if (error.status === 404) {
		title = 'Not found!'
		message = 'Could not find resource or page.'
	}

	if (error.status === 401) {
		title = 'Unauthorized!'
		message = 'User unauthorized!'
	}

	if (error.status === 422) {
		title = 'Wrong input data'
		message = 'Wrong input data!'
	}

	return (
		<Box component={'section'}>
			<AppBarView />
			<Wrapper>
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'center',
						alignItems: 'center',
						textAlign: 'center',
					}}>
					<h1 style={{ fontSize: '4rem', margin: 0 }}>{title}</h1>
					<h2 style={{ margin: '1rem 0' }}>{message}</h2>
				</div>
			</Wrapper>
		</Box>
	)
}
