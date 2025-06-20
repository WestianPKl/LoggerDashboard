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
export async function loader() {
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
