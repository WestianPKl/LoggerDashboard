import { lazy, Suspense } from 'react'
const UserPermissionTable = lazy(() => import('../User/components/UserPermissionTable'))
import { Container, useMediaQuery, useTheme } from '@mui/material'
import { adminApi } from '../../store/api/adminApi'
import type { PermissionClass } from '../Admin/scripts/PermissionClass'
import { showAlert } from '../../store/application-store'
import LoadingCircle from '../../components/UI/LoadingCircle'
import { Await, useLoaderData, data, type LoaderFunctionArgs } from 'react-router'
import { store } from '../../store/store'

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

export async function loader({ params }: LoaderFunctionArgs) {
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
