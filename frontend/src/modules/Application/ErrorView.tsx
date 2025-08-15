import { useRouteError } from 'react-router'
import { Box } from '@mui/material'
import Wrapper from '../../components/UI/Wrapper'
import AppBarView from './AppBarView'

/**
 * ErrorView is a React component that displays a user-friendly error message
 * based on the status code of the error obtained from the route context.
 *
 * It handles the following HTTP status codes:
 * - 500: Internal Server Error, displays a specific message from the error data.
 * - 404: Not Found, indicates that the requested resource or page could not be found.
 * - 401: Unauthorized, informs the user they are not authorized.
 * - 422: Unprocessable Entity, indicates wrong input data.
 * - Any other error: Displays a generic error message.
 *
 * The component uses Material UI's Box for layout and includes an AppBarView and Wrapper
 * to structure the error display.
 *
 * @returns {JSX.Element} A section displaying the error title and message.
 */
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
