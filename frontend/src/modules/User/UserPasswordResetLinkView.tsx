import { redirect, useNavigate } from 'react-router'
import { Typography, Box } from '@mui/material'
import UserPasswordResetLinkForm from './components/UserPasswordResetLinkForm'
import { showAlert } from '../../store/application-store'
import { useAppDispatch } from '../../store/hooks'
import { usePasswordResetTokenMutation } from '../../store/api/userApi'

/**
 * Renders the password reset link view, allowing users to request a password reset email.
 *
 * This component displays a form for users to enter their email address and request a password reset link.
 * On successful request, a success alert is shown and the user is redirected to the login page.
 * On failure, an error alert is displayed with the relevant message.
 *
 * @component
 * @returns {JSX.Element} The rendered password reset link view.
 */
export default function UserPasswordResetLinkView() {
	const dispatch = useAppDispatch()
	const navigate = useNavigate()
	const [getLink] = usePasswordResetTokenMutation()

	/**
	 * Sends a password reset link to the specified email address.
	 *
	 * This asynchronous function attempts to generate and send a password reset link
	 * by calling the `getLink` API with the provided email. On success, it dispatches
	 * a success alert and navigates the user to the login page. On failure, it dispatches
	 * an error alert with an appropriate message.
	 *
	 * @param email - The email address to which the password reset link should be sent.
	 *                Can be a string or undefined.
	 * @returns A Promise that resolves when the operation is complete.
	 */
	async function getPasswordResetLink(email: string | undefined): Promise<void> {
		try {
			const response = await getLink({ email: email }).unwrap()
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
			<UserPasswordResetLinkForm getPasswordResetLink={getPasswordResetLink} />
		</Box>
	)
}

/**
 * Loader function that checks for the presence of a 'token' in localStorage.
 * If a token exists, the user is redirected to the home page ('/').
 * Otherwise, the function returns undefined, allowing the current route to proceed.
 *
 * @returns {Response | undefined} A redirect response if the user is authenticated, otherwise undefined.
 */
export function loader(): Response | undefined {
	if (localStorage.getItem('token')) {
		return redirect('/')
	}
}
