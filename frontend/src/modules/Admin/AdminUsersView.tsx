import { lazy, Suspense } from 'react'
const AdminUserTable = lazy(() => import('./components/AdminUserTable'))
import type { UserClass } from '../User/scripts/UserClass'
import { Container, useMediaQuery, useTheme } from '@mui/material'
import { userApi } from '../../store/api/userApi'
import { showAlert } from '../../store/application-store'
import LoadingCircle from '../../components/UI/LoadingCircle'
import { store } from '../../store/store'
import { data, useLoaderData, Await } from 'react-router'

/**
 * Renders the admin users view, displaying a table of users.
 *
 * This component loads user data asynchronously using `useLoaderData` and displays it
 * within an `AdminUserTable` component. It adapts its container width based on the current
 * screen size using Material-UI's theme and media query hooks. While user data is loading,
 * a loading spinner (`LoadingCircle`) is shown.
 *
 * @returns {JSX.Element} The rendered admin users view.
 */
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

/**
 * Asynchronously loads the list of users from the API and returns them.
 *
 * Dispatches the `getUsers` endpoint from the `userApi` to fetch users.
 * If no users are found, throws a 404 error.
 * On error, dispatches an alert with the error message and rethrows the error.
 *
 * @returns {Promise<{ users: UserClass[] }>} A promise that resolves to an object containing the array of users.
 * @throws Will throw an error if the users cannot be fetched or if the response is empty.
 */
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
			})
		)
		throw err
	}
}
