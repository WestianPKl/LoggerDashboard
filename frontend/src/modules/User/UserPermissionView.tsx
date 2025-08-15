import { lazy, Suspense } from 'react'
const UserPermissionTable = lazy(() => import('./components/UserPermissionTable'))
import { Container, useMediaQuery, useTheme } from '@mui/material'
import { adminApi } from '../../store/api/adminApi'
import type { PermissionClass } from '../Admin/scripts/PermissionClass'
import { showAlert } from '../../store/application-store'
import LoadingCircle from '../../components/UI/LoadingCircle'
import { Await, redirect, useLoaderData, data } from 'react-router'
import { store } from '../../store/store'
import type { UserClass } from './scripts/UserClass'

/**
 * Displays the permission view for a specific user.
 *
 * This component fetches and displays a list of permissions associated with a user,
 * rendering them inside a responsive container. It uses React Suspense and Await to
 * handle asynchronous loading of permission data, showing a loading indicator while
 * data is being fetched. The layout adapts to mobile and desktop screen sizes.
 *
 * @returns {JSX.Element} The rendered user permission view component.
 */
export default function UserPermissionView() {
	const { permissionData, userId } = useLoaderData() as { permissionData: Promise<PermissionClass[]>; userId: number }
	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	return (
		<Suspense fallback={<LoadingCircle />}>
			<Await resolve={permissionData}>
				{permissions => (
					<Container maxWidth={isMobile ? 'sm' : 'xl'}>
						<UserPermissionTable permissionData={permissions} userId={userId} />
					</Container>
				)}
			</Await>
		</Suspense>
	)
}

/**
 * Loads the permissions data for the currently authenticated user.
 *
 * This function retrieves the current user from the Redux store. If the user is not found,
 * it dispatches an error alert and redirects to the login page. Otherwise, it fetches the user's
 * permissions using the `adminApi` endpoint. If the permissions data is not found, it throws a 404 error.
 * Any other errors encountered during the process are caught, an error alert is dispatched, and the error is re-thrown.
 *
 * @returns {Promise<Response | { permissionData: PermissionClass[]; userId: number }>}
 * Returns either a redirect `Response` to the login page or an object containing the user's permissions and user ID.
 *
 * @throws Will throw an error if the permissions data cannot be retrieved or if another error occurs during the process.
 */
export async function loader(): Promise<Response | { permissionData: PermissionClass[]; userId: number }> {
	if (!(store.getState().account.user as UserClass)) {
		store.dispatch(showAlert({ message: 'Unknown user - token not found', severity: 'error' }))
		return redirect('/login')
	}
	try {
		const userId = (store.getState().account.user as UserClass).id!
		const promise = await store.dispatch(adminApi.endpoints.getPermissions.initiate({ userId })).unwrap()
		if (!promise) {
			throw data('Data not Found', { status: 404 })
		}
		return { permissionData: promise, userId: userId }
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
