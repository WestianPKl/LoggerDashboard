import { lazy, Suspense } from 'react'
const AdminAdmRoleTable = lazy(() => import('./components/AdminAdmRoleTable'))
import type { AdminRoleClass } from './scripts/AdminRoleClass'
import { Container, useMediaQuery, useTheme } from '@mui/material'
import { adminApi } from '../../store/api/adminApi'
import { showAlert } from '../../store/application-store'
import LoadingCircle from '../../components/UI/LoadingCircle'
import { store } from '../../store/store'
import { data, useLoaderData, Await } from 'react-router'

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

export async function loader() {
	try {
		const promise = await store.dispatch(adminApi.endpoints.getAdminRoles.initiate({})).unwrap()
		if (!promise) {
			throw data('Data not Found', { status: 404 })
		}
		return { adminRoles: promise }
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
