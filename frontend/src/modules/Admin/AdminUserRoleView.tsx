import { lazy, Suspense } from 'react'
const AdminRoleUserTable = lazy(() => import('./components/AdminRoleUserTable'))
import { Container, useMediaQuery, useTheme } from '@mui/material'
import { adminApi } from '../../store/api/adminApi'
import { AdminRoleClass } from '../Admin/scripts/AdminRoleClass'
import { showAlert } from '../../store/application-store'
import LoadingCircle from '../../components/UI/LoadingCircle'
import { store } from '../../store/store'
import { data, useLoaderData, Await, type LoaderFunctionArgs } from 'react-router'

/**
 * Renders the admin user role view, displaying a table of users associated with a specific admin role.
 *
 * This component fetches the admin roles and the selected role ID using `useLoaderData`, and adapts its layout
 * responsively based on the screen size. It uses React's `Suspense` and `Await` to handle asynchronous data loading,
 * showing a loading indicator while the user data is being fetched. Once loaded, it renders the `AdminRoleUserTable`
 * with the relevant user data and role information.
 *
 * @returns {JSX.Element} The rendered admin user role view component.
 */
export default function AdminUserRoleView() {
	const { adminRoles, roleId } = useLoaderData() as { adminRoles: AdminRoleClass; roleId: number }

	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	return (
		<Container maxWidth={isMobile ? 'sm' : 'xl'}>
			<Suspense fallback={<LoadingCircle />}>
				<Await resolve={adminRoles}>
					{adminRolesData => <AdminRoleUserTable usersData={adminRolesData.users} roleId={roleId} isAdmin={true} />}
				</Await>
			</Suspense>
		</Container>
	)
}

/**
 * Loader function to fetch admin role data based on the provided role ID from route parameters.
 *
 * @param {LoaderFunctionArgs} args - The arguments object containing route parameters.
 * @returns {Promise<{ adminRoles: AdminRoleClass; roleId: number }>}
 *   A promise that resolves to an object containing the admin role data and the parsed role ID.
 * @throws Will throw an error if the role ID is missing, if the data is not found, or if an error occurs during fetching.
 */
export async function loader({ params }: LoaderFunctionArgs): Promise<{ adminRoles: AdminRoleClass; roleId: number }> {
	const roleId = params.roleId
	if (!roleId) {
		throw data('No role Id', { status: 400 })
	}
	try {
		if (!(await store.dispatch(adminApi.endpoints.getAdminRoles.initiate({ roleId })).unwrap())) {
			throw data('Data not Found', { status: 404 })
		}
		return {
			adminRoles: (await store.dispatch(adminApi.endpoints.getAdminRoles.initiate({ roleId })).unwrap())[0],
			roleId: parseInt(roleId),
		}
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
