import { lazy, Suspense } from 'react'
const UserPermissionTable = lazy(() => import('../User/components/UserPermissionTable'))
import { Container, useMediaQuery, useTheme } from '@mui/material'
import { adminApi } from '../../store/api/adminApi'
import type { PermissionClass } from '../Admin/scripts/PermissionClass'
import { showAlert } from '../../store/application-store'
import LoadingCircle from '../../components/UI/LoadingCircle'
import { Await, useLoaderData, data, type LoaderFunctionArgs } from 'react-router'
import { store } from '../../store/store'

/**
 * Renders the admin view for managing user permissions.
 *
 * This component loads permission data asynchronously and displays it in a table,
 * allowing administrators to view and manage permissions for a specific user and role.
 * It adapts its layout based on the screen size for mobile responsiveness.
 *
 * @returns {JSX.Element} The rendered admin user permission view component.
 *
 * @remarks
 * - Uses React Suspense and Await for data fetching.
 * - Expects `permissionData`, `roleId`, and `userId` from the loader data.
 * - Displays a loading indicator while permissions are being fetched.
 */
export default function AdminUserPermissionView() {
	const { permissionData, roleId, userId } = useLoaderData() as {
		permissionData: Promise<PermissionClass[]>
		roleId: number | undefined
		userId: number | undefined
	}
	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	return (
		<Suspense fallback={<LoadingCircle />}>
			<Await resolve={permissionData}>
				{permissions => (
					<Container maxWidth={isMobile ? 'sm' : 'xl'}>
						<UserPermissionTable permissionData={permissions} userId={userId} roleId={roleId} isAdmin={true} />
					</Container>
				)}
			</Await>
		</Suspense>
	)
}

/**
 * Loader function for fetching permission data based on either a role ID or a user ID from route parameters.
 *
 * @param {LoaderFunctionArgs} args - The arguments object containing route parameters.
 * @returns {Promise<{ permissionData: PermissionClass[]; roleId: number | undefined; userId: number | undefined }>}
 * An object containing the fetched permission data and the corresponding roleId or userId.
 *
 * @throws Will throw an error if neither roleId nor userId is provided in the parameters.
 * @throws Will throw an error if the data is not found or if an error occurs during the fetch operation.
 */
export async function loader({ params }: LoaderFunctionArgs): Promise<{
	permissionData: PermissionClass[]
	roleId: number | undefined
	userId: number | undefined
}> {
	let roleId = undefined
	let userId = undefined
	if (params.roleId) {
		roleId = params.roleId
	} else if (params.userId) {
		userId = params.userId
	}
	if (!roleId && !userId) {
		throw data('No role Id or user Id', { status: 400 })
	}
	try {
		let promise
		if (roleId) {
			promise = await store.dispatch(adminApi.endpoints.getPermissions.initiate({ roleId: roleId })).unwrap()
		} else if (userId) {
			promise = await store.dispatch(adminApi.endpoints.getPermissions.initiate({ userId: userId })).unwrap()
		}
		if (!promise) {
			throw data('Data not Found', { status: 404 })
		}
		return {
			permissionData: promise,
			roleId: roleId ? parseInt(roleId) : undefined,
			userId: userId ? parseInt(userId) : undefined,
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
