import { lazy, Suspense } from 'react'
const AdminAdmRoleTable = lazy(() => import('./components/AdminAdmRoleTable'))
import type { AdminRoleClass } from './scripts/AdminRoleClass'
import { Container, useMediaQuery, useTheme } from '@mui/material'
import { adminApi } from '../../store/api/adminApi'
import { showAlert } from '../../store/application-store'
import LoadingCircle from '../../components/UI/LoadingCircle'
import { store } from '../../store/store'
import { data, useLoaderData, Await } from 'react-router'

/**
 * Renders the admin permission roles view, displaying a table of admin roles.
 *
 * This component fetches the list of admin roles using `useLoaderData`, and displays them
 * in the `AdminAdmRoleTable` component. It adapts its layout based on the screen size,
 * using a smaller container on mobile devices. While the admin roles data is loading,
 * a loading spinner (`LoadingCircle`) is shown.
 *
 * @returns {JSX.Element} The rendered admin permission roles view.
 */
export default function AdminPermissionRolesView() {
	const { adminRoles } = useLoaderData() as { adminRoles: AdminRoleClass[] }

	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	return (
		<Container maxWidth={isMobile ? 'sm' : 'xl'}>
			<Suspense fallback={<LoadingCircle />}>
				<Await resolve={adminRoles}>{adminRolesData => <AdminAdmRoleTable admRoles={adminRolesData} />}</Await>
			</Suspense>
		</Container>
	)
}

/**
 * Asynchronously loads the list of admin roles from the API and returns them.
 *
 * Dispatches the `getAdminRoles` endpoint using Redux Toolkit Query, unwraps the result,
 * and returns the roles in an object. If no data is found, throws a 404 error.
 * In case of an error during the fetch, dispatches an alert with the error message
 * and rethrows the error.
 *
 * @returns {Promise<{ adminRoles: any }>} An object containing the fetched admin roles.
 * @throws Will throw an error if the data is not found or if the API call fails.
 */
export async function loader(): Promise<{ adminRoles: AdminRoleClass[] }> {
	try {
		if (!(await store.dispatch(adminApi.endpoints.getAdminRoles.initiate({})).unwrap())) {
			throw data('Data not Found', { status: 404 })
		}
		return { adminRoles: await store.dispatch(adminApi.endpoints.getAdminRoles.initiate({})).unwrap() }
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
