import { lazy, Suspense } from 'react'
import { Await, redirect, useLoaderData, data } from 'react-router'
import { Container, useMediaQuery, useTheme } from '@mui/material'
const UserProfile = lazy(() => import('./components/UserProfile'))
import { userApi } from '../../store/api/userApi'
import LoadingCircle from '../../components/UI/LoadingCircle'
import { store } from '../../store/store'
import { showAlert } from '../../store/application-store'
import type { UserClass } from './scripts/UserClass'

/**
 * Renders the user profile view, fetching user data asynchronously and displaying it within a responsive container.
 *
 * This component uses React Suspense and Await to handle the asynchronous loading of user data,
 * showing a loading indicator while the data is being fetched. The layout adapts to mobile and desktop
 * breakpoints using Material-UI's theming and media query hooks.
 *
 * @returns {JSX.Element} The rendered user profile view.
 */
export default function UserProfileView() {
	const { userData } = useLoaderData() as { userData: Promise<UserClass> }
	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	return (
		<Suspense fallback={<LoadingCircle />}>
			<Await resolve={userData}>
				{user => (
					<Container maxWidth={isMobile ? 'sm' : 'xl'} sx={{ textAlign: 'center' }}>
						<UserProfile user={user} />
					</Container>
				)}
			</Await>
		</Suspense>
	)
}

/**
 * Loads the current user's profile data.
 *
 * This loader function retrieves the authenticated user's information from the Redux store.
 * If the user is not found, it dispatches an alert and redirects to the login page.
 * Otherwise, it fetches the user's data from the API using the user's ID.
 * If the data is not found, it throws a 404 error.
 * On success, it returns an object containing the user data.
 * If an error occurs during the fetch, it dispatches an alert with the error message and rethrows the error.
 *
 * @returns {Promise<Response | { userData: UserClass }>} A promise that resolves to either a redirect response or an object containing the user data.
 */
export async function loader(): Promise<Response | { userData: UserClass }> {
	if (!(store.getState().account.user as UserClass)) {
		store.dispatch(showAlert({ message: 'Unknown user - token not found', severity: 'error' }))
		return redirect('/login')
	}
	try {
		const userId = (store.getState().account.user as UserClass).id!
		const promise = await store.dispatch(userApi.endpoints.getUser.initiate(userId)).unwrap()
		if (!promise) {
			throw data('Data not Found', { status: 404 })
		}
		return { userData: promise }
	} catch (err: any) {
		store.dispatch(
			showAlert({
				message: err?.data?.message || err?.message || 'Something went wrong!',
				severity: 'error',
			})
		)
		throw err
	}
}
