import { useRef, useEffect } from 'react'
import { Outlet, redirect, useLoaderData, useSubmit } from 'react-router'
import AppBarView from './AppBarView'
import Wrapper from '../../components/UI/Wrapper'
import { Box } from '@mui/material'
import { useAppDispatch } from '../../store/hooks'
import { initStore, getAuthTokenDuration, getUserProfile, logoutAction } from '../../store/account-actions'
import { store } from '../../store/store'
import { fetchAccessLevels, fetchPermission } from '../../store/auth-actions'

/**
 * RootView is the main layout component for the application.
 *
 * It manages user authentication session timeout by scheduling an automatic logoff
 * based on the authentication token duration. When the token expires, it submits a POST
 * request to the '/login' route to log the user off.
 *
 * The component uses Redux for dispatching actions, React Router's data loading and submission
 * hooks for authentication and navigation, and Material UI for layout.
 *
 * @returns {JSX.Element} The root section of the application, including the app bar and nested routes.
 */
export default function RootView() {
	const { userId, token, permissionToken } = useLoaderData()
	const submit = useSubmit()
	const dispatch = useAppDispatch()
	const logoffTimeout = useRef<number | null>(null)

	useEffect(() => {
		let mounted = true
		if (token && permissionToken) {
			const duration = dispatch(getAuthTokenDuration())
			if (userId && token && permissionToken && typeof duration === 'number' && duration > 0 && mounted) {
				logoffTimeout.current = setTimeout(() => {
					return submit(null, { action: '/login', method: 'POST' })
				}, duration)
			}
			return () => {
				mounted = false
				if (logoffTimeout.current) {
					clearTimeout(logoffTimeout.current)
				}
			}
		} else {
			return () => {
				mounted = false
				if (logoffTimeout.current) {
					clearTimeout(logoffTimeout.current)
				}
			}
		}
	}, [dispatch])
	return (
		<Box component={'section'}>
			<AppBarView />
			<Wrapper>
				<Outlet />
			</Wrapper>
		</Box>
	)
}

/**
 * Loads initial application data including user ID, authentication token, and permission token.
 * If all required values are present, it dispatches actions to fetch the user profile,
 * permissions, and access levels in parallel.
 *
 * @returns A promise that resolves to an object containing:
 *   - `userId`: The user's ID (number or undefined).
 *   - `token`: The authentication token (string or null).
 *   - `permissionToken`: The permission token (string or null).
 */
export async function loader(): Promise<{
	userId: number | undefined
	token: string | null
	permissionToken: string | null
}> {
	const userId = store.dispatch(initStore())
	if (typeof userId === 'number' && localStorage.getItem('token') && localStorage.getItem('permissionToken')) {
		await Promise.all([
			store.dispatch(getUserProfile(userId)),
			store.dispatch(fetchPermission(userId)),
			store.dispatch(fetchAccessLevels()),
		])
	}
	return {
		userId,
		token: localStorage.getItem('token'),
		permissionToken: localStorage.getItem('permissionToken'),
	}
}

/**
 * Handles the logout action by dispatching the `logoutAction` to the store
 * and then redirects the user to the login page.
 *
 * @returns A redirect response to the '/login' route.
 */
export function action(): Response {
	store.dispatch(logoutAction())
	return redirect('/login')
}
