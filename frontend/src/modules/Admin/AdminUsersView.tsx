import { lazy, Suspense } from 'react'
const AdminUserTable = lazy(() => import('./components/AdminUserTable'))
import type { UserClass } from '../User/scripts/UserClass'
import { Container, useMediaQuery, useTheme } from '@mui/material'
import { userApi } from '../../store/api/userApi'
import { showAlert } from '../../store/application-store'
import LoadingCircle from '../../components/UI/LoadingCircle'
import { store } from '../../store/store'
import { data, useLoaderData, Await } from 'react-router'

export default function AdminUsersView() {
	const { users } = useLoaderData() as { users: UserClass[] }

	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	return (
		<Container maxWidth={isMobile ? 'sm' : 'xl'}>
			<Suspense fallback={<LoadingCircle />}>
				<Await resolve={users}>{usersData => <AdminUserTable users={usersData} />}</Await>
			</Suspense>
		</Container>
	)
}

export async function loader(): Promise<{ users: UserClass[] }> {
	try {
		if (!(await store.dispatch(userApi.endpoints.getUsers.initiate({})).unwrap())) {
			throw data('Data not Found', { status: 404 })
		}
		return { users: await store.dispatch(userApi.endpoints.getUsers.initiate({})).unwrap() }
	} catch (err: any) {
		store.dispatch(
			showAlert({
				message: err?.data?.message || err?.message || 'Something went wrong!',
				severity: 'error',
			}),
		)
		throw err
	}
}
