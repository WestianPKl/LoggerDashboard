import { redirect, useParams } from 'react-router'
import { useNavigate } from 'react-router'
import { Typography, Box } from '@mui/material'
import UserPasswordResetForm from './components/UserPasswordResetForm'
import { showAlert } from '../../store/application-store'
import { useAppDispatch } from '../../store/hooks'
import { usePasswordResetMutation } from '../../store/api/userApi'

/**
 * Renders the user password reset view.
 *
 * This component handles the password reset process by extracting the reset token from the URL parameters,
 * providing a form for the user to enter a new password, and dispatching the password reset request.
 * On success, it displays a success alert and navigates to the login page; on failure, it shows an error alert.
 *
 * @returns {JSX.Element} The rendered password reset view.
 */
export default function UserPasswordResetView() {
	const params = useParams()
	const token = params.token ? params.token : undefined
	const dispatch = useAppDispatch()
	const navigate = useNavigate()
	const [getReset] = usePasswordResetMutation()

	/**
	 * Attempts to reset the user's password using the provided password and confirmation.
	 *
	 * Sends a password reset request with the given password, confirmPassword, and token.
	 * On success, displays a success alert and navigates to the login page.
	 * On failure, displays an error alert with the appropriate message.
	 *
	 * @param password - The new password to set for the user.
	 * @param confirmPassword - The confirmation of the new password.
	 * @returns A Promise that resolves when the operation is complete.
	 */
	async function getPasswordReset(password: string | undefined, confirmPassword: string | undefined): Promise<void> {
		try {
			const response = await getReset({ password: password, confirmPassword: confirmPassword, token: token }).unwrap()
			if (response) {
				dispatch(showAlert({ message: 'Password reset mail sent', severity: 'success' }))
				navigate('/login')
			}
		} catch (err: any) {
			let message: string | string[] =
				err?.data?.message ||
				err?.message ||
				(err?.data && Array.isArray(err.data) && err.data.map((e: any) => e.msg).join(', ')) ||
				'Password reset failed'

			dispatch(showAlert({ message, severity: 'error' }))
		}
	}

	return (
		<Box sx={{ mt: 2, textAlign: 'center' }}>
			<Typography variant='h6' component='div' sx={{ flexGrow: 1, m: 1 }}>
				Password reset
			</Typography>
			<UserPasswordResetForm getPasswordReset={getPasswordReset} />
		</Box>
	)
}

/**
 * Loader function that checks for the presence of a 'token' in localStorage.
 * If a token exists, the user is redirected to the home page ('/').
 * Otherwise, the function returns undefined, allowing access to the current route.
 *
 * @returns {Response | undefined} A redirect response if the user is authenticated, otherwise undefined.
 */
export function loader(): Response | undefined {
	if (localStorage.getItem('token')) {
		return redirect('/')
	}
}
