import { redirect, useNavigate } from 'react-router'
import type { ILoginData } from './scripts/UserInterface'
import { Typography, Box } from '@mui/material'
import UserLoginForm from './components/UserLoginForm'
import { loginAction } from '../../store/account-actions'
import { showAlert } from '../../store/application-store'
import { useAppDispatch } from '../../store/hooks'
import { useLoginMutation } from '../../store/api/userApi'

/**
 * Renders the user login page view.
 *
 * This component displays a login form and handles the login process.
 * On successful login, it stores authentication tokens in local storage,
 * updates the application state, shows a success alert, and navigates to the home page.
 * On failure, it displays an error alert with the appropriate message.
 *
 * @component
 * @returns {JSX.Element} The rendered login page view.
 */
export default function LoginPageView() {
	const dispatch = useAppDispatch()
	const navigate = useNavigate()
	const [login] = useLoginMutation()

	/**
	 * Attempts to log in a user with the provided login data.
	 *
	 * Sends the login data to the authentication API, handles the response,
	 * stores authentication tokens in local storage, updates the application state,
	 * and displays success or error alerts accordingly.
	 *
	 * @param loginData - The user's login credentials.
	 * @returns A Promise that resolves when the login process is complete.
	 * @throws Dispatches an error alert if the login fails.
	 */
	async function logIn(loginData: ILoginData): Promise<void> {
		try {
			const response = await login(loginData).unwrap()
			if (response && response.token && response.permissionToken) {
				localStorage.setItem('token', response.token)
				localStorage.setItem('permissionToken', response.permissionToken)
				dispatch(loginAction({ token: response.token, permissionToken: response.permissionToken }))
				dispatch(showAlert({ message: 'User logged in', severity: 'success' }))
				setTimeout(() => navigate('/'), 100)
			}
		} catch (err: any) {
			let message: string | string[] =
				err?.data?.message ||
				err?.message ||
				(err?.data && Array.isArray(err.data) && err.data.map((e: any) => e.msg).join(', ')) ||
				'Login failed'

			dispatch(showAlert({ message, severity: 'error' }))
		}
	}

	return (
		<Box sx={{ mt: 2, textAlign: 'center' }}>
			<Typography variant='h6' component='div' sx={{ flexGrow: 1, m: 1 }}>
				Login
			</Typography>
			<UserLoginForm logIn={logIn} />
		</Box>
	)
}

/**
 * Loader function for the user login page.
 *
 * Checks if a 'token' exists in localStorage. If present, redirects the user to the home page.
 * Returns a redirect response if the user is already authenticated, otherwise returns undefined.
 *
 * @returns {Response | undefined} A redirect response if authenticated, otherwise undefined.
 */
export function loader(): Response | undefined {
	if (localStorage.getItem('token')) {
		return redirect('/')
	}
}
