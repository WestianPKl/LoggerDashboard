import { lazy, Suspense } from 'react'
import { Await, redirect, useLoaderData, data } from 'react-router'
const UserRolesTable = lazy(() => import('./components/UserRolesTable'))
import { Container, useMediaQuery, useTheme } from '@mui/material'
import LoadingCircle from '../../components/UI/LoadingCircle'
import { store } from '../../store/store'
import { adminApi } from '../../store/api/adminApi'
import { showAlert } from '../../store/application-store'
import type { AdminRoleUserClass } from '../Admin/scripts/AdminRoleUserClass'
import type { UserClass } from './scripts/UserClass'

/**
 * Displays a view for managing user roles.
 *
 * This component loads user role data asynchronously using React Router's `useLoaderData` and `Await`.
 * It renders a responsive container with a table of user roles, adapting its layout for mobile devices.
 * While the roles data is loading, a loading indicator (`LoadingCircle`) is shown.
 *
 * @returns {JSX.Element} The rendered user roles view.
 */
export default function UserRolesView() {
	const { roles } = useLoaderData() as { roles: Promise<AdminRoleUserClass[]> }

	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	return (
		<Suspense fallback={<LoadingCircle />}>
			<Await resolve={roles}>
				{rolesData => (
					<Container maxWidth={isMobile ? 'sm' : 'xl'}>
						<UserRolesTable rolesData={rolesData} />
					</Container>
				)}
			</Await>
		</Suspense>
	)
}
/**
 * Loader function for fetching admin role users for the current user.
 *
 * - Checks if a user is present in the Redux store.
 * - If not, dispatches an error alert and redirects to the login page.
 * - If a user exists, attempts to fetch the user's admin roles via an API call.
 * - On success, returns an object containing the roles.
 * - On failure, dispatches an error alert and throws the error.
 *
 * @returns {Promise<Response | { roles: AdminRoleUserClass[] }>}
 *   A promise that resolves to either a redirect response or an object containing the user's admin roles.
 * @throws Will throw an error if the API call fails or if data is not found.
 */
export async function loader(): Promise<Response | { roles: AdminRoleUserClass[] }> {
	const user = store.getState().account.user as UserClass
	if (!user) {
		store.dispatch(showAlert({ message: 'Unknown user - token not found', severity: 'error' }))
		return redirect('/login')
	}
	try {
		const promise = await store.dispatch(adminApi.endpoints.getAdminRoleUsers.initiate({ userId: user.id })).unwrap()
		if (!promise) {
			throw data('Data not Found', { status: 404 })
		}
		return { roles: promise }
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
