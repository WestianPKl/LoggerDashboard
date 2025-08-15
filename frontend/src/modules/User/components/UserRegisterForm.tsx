import { useState } from 'react'
import { Button, Box, TextField, useMediaQuery, useTheme } from '@mui/material'
import type { IRegisterFormProps } from '../scripts/UserInterface'

/**
 * Represents the possible validation errors for the user registration form fields.
 * Each property is optional and, if present, contains an error message related to the corresponding field.
 *
 * @property {string} [username] - Error message for the username field.
 * @property {string} [email] - Error message for the email field.
 * @property {string} [password] - Error message for the password field.
 * @property {string} [confirmPassword] - Error message for the confirm password field.
 */
type FormErrors = {
	username?: string
	email?: string
	password?: string
	confirmPassword?: string
}

/**
 * RegisterForm is a React functional component that renders a user registration form.
 * It manages form state for username, email, password, and password confirmation,
 * and performs client-side validation for required fields, email format, and password match.
 *
 * @param createNewAccount - A callback function invoked with the form data when the form is valid and submitted.
 *
 * @remarks
 * - Displays validation errors inline using Material-UI's TextField `error` and `helperText` props.
 * - Uses Material-UI's theming and responsive utilities to adjust button size for mobile devices.
 * - Prevents form submission if validation fails and highlights the relevant fields.
 *
 * @returns A Material-UI styled registration form component.
 */
export default function RegisterForm({ createNewAccount }: IRegisterFormProps) {
	const [username, setUsername] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [errors, setErrors] = useState<FormErrors>({})

	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	/**
	 * Validates the user registration form fields and returns an object containing any validation errors.
	 *
	 * @returns {FormErrors} An object mapping field names to error messages for any invalid or missing fields.
	 *
	 * The following validations are performed:
	 * - Checks if the username is provided.
	 * - Checks if the email is provided and matches a valid email format.
	 * - Checks if the password is provided.
	 * - Checks if the confirm password field is provided.
	 * - Ensures that the password and confirm password fields match.
	 */
	function validate(): FormErrors {
		const newErrors: FormErrors = {}
		if (!username) newErrors.username = 'Username is required'
		if (!email) newErrors.email = 'Email is required'
		else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) newErrors.email = 'Invalid email'
		if (!password) newErrors.password = 'Password is required'
		if (!confirmPassword) newErrors.confirmPassword = 'Please confirm password'
		if (password && confirmPassword && password !== confirmPassword) {
			newErrors.confirmPassword = 'Passwords do not match'
		}
		return newErrors
	}

	/**
	 * Handles the form submission event for the user registration form.
	 *
	 * Prevents the default form submission behavior, validates the form fields,
	 * sets any validation errors, and if there are no errors, triggers the account creation process.
	 *
	 * @param e - The form submission event.
	 */
	function onSubmitHandler(e: React.FormEvent): void {
		e.preventDefault()
		const validationErrors = validate()
		setErrors(validationErrors)
		if (Object.keys(validationErrors).length === 0) {
			createNewAccount({ username, email, password, confirmPassword })
		}
	}

	return (
		<Box
			onSubmit={onSubmitHandler}
			component='form'
			sx={{ '& .MuiTextField-root': { m: 1, width: '25ch' } }}
			noValidate
			autoComplete='off'>
			<Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
				<TextField
					error={Boolean(errors.username)}
					id='username'
					label='Username'
					autoComplete='username'
					helperText={errors.username || ''}
					value={username}
					onChange={e => {
						setUsername(e.target.value)
						if (errors.username) setErrors({ ...errors, username: undefined })
					}}
				/>
				<TextField
					error={Boolean(errors.email)}
					id='email'
					label='Email'
					type='email'
					autoComplete='email'
					helperText={errors.email || ''}
					value={email}
					onChange={e => {
						setEmail(e.target.value)
						if (errors.email) setErrors({ ...errors, email: undefined })
					}}
				/>
				<TextField
					error={Boolean(errors.password)}
					id='password'
					label='Password'
					type='password'
					autoComplete='password'
					helperText={errors.password || ''}
					value={password}
					onChange={e => {
						setPassword(e.target.value)
						if (errors.password) setErrors({ ...errors, password: undefined })
					}}
				/>
				<TextField
					error={Boolean(errors.confirmPassword)}
					id='confirm-password'
					label='Confirm password'
					type='password'
					autoComplete='confirm-password'
					helperText={errors.confirmPassword || ''}
					value={confirmPassword}
					onChange={e => {
						setConfirmPassword(e.target.value)
						if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined })
					}}
				/>
				<Box>
					<Button sx={{ mr: '10px' }} variant='outlined' size={isMobile ? 'small' : 'medium'} type='submit'>
						Register
					</Button>
				</Box>
			</Box>
		</Box>
	)
}
