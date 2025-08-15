import { lazy, Suspense } from 'react'
import LoadingCircle from '../../components/UI/LoadingCircle'
import { redirect, useNavigate } from 'react-router'
import { Typography, Box } from '@mui/material'
const RegisterForm = lazy(() => import('./components/UserRegisterForm'))
import type { IRegisterData } from './scripts/UserInterface'
import type { IErrorData } from '../Application/scripts/AppInterface'
import { useAppDispatch } from '../../store/hooks'
import { showAlert } from '../../store/application-store'
import { useRegisterMutation } from '../../store/api/userApi'

/**
 * Renders the user registration page view.
 *
 * This component displays a registration form and handles the creation of a new user account.
 * On successful registration, it shows a success alert and navigates to the login page.
 * On failure, it displays error messages based on the server response.
 *
 * @component
 * @returns {JSX.Element} The rendered registration page view.
 *
 * @example
 * ```tsx
 * <RegisterPageView />
 * ```
 */
export default function RegisterPageView() {
	const dispatch = useAppDispatch()
	const navigate = useNavigate()
	const [register] = useRegisterMutation()

	/**
	 * Attempts to create a new user account with the provided registration data.
	 *
	 * @param registerData - The registration data required to create a new account.
	 * @returns A promise that resolves when the account is created or rejects with an error.
	 *
	 * @remarks
	 * - On successful registration, shows a success alert and navigates to the login page.
	 * - On failure, extracts error messages from the response and displays them in an error alert.
	 */
	async function createNewAccount(registerData: IRegisterData): Promise<void> {
		try {
			await register(registerData).unwrap()
			dispatch(showAlert({ message: 'Account created successfully', severity: 'success' }))
			navigate('/login')
		} catch (err: any) {
			let errorArray: string[] = []
			const errorData = err?.data?.data
			if (Array.isArray(errorData) && errorData.length > 0) {
				errorArray = errorData.map((e: IErrorData) => e.msg)
			} else if (err?.data?.message) {
				errorArray = [err.data.message]
			} else if (err?.error) {
				errorArray = [err.error]
			} else {
				errorArray = ['Registration failed. Please try again.']
			}
			dispatch(showAlert({ message: errorArray, severity: 'error' }))
		}
	}

	return (
		<Box sx={{ mt: 2, textAlign: 'center' }}>
			<Typography variant='h6' component='div' sx={{ flexGrow: 1, m: 1 }}>
				Register
			</Typography>
			<Suspense fallback={<LoadingCircle />}>
				<RegisterForm createNewAccount={createNewAccount} />
			</Suspense>
		</Box>
	)
}

/**
 * Loader function for the User Register page.
 *
 * Checks if a user authentication token exists in localStorage.
 * If a token is found, redirects the user to the home page ('/').
 * Otherwise, allows the registration page to load.
 *
 * @returns A redirect Response to the home page if authenticated, otherwise undefined.
 */
export function loader(): Response | undefined {
	if (localStorage.getItem('token')) {
		return redirect('/')
	}
}
