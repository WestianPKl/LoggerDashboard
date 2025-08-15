import { useState, useEffect } from 'react'
import { Button, Box, TextField, useMediaQuery, useTheme } from '@mui/material'
import type { IUserFormProps } from '../scripts/IUser'

/**
 * UserForm component for creating or editing a user.
 *
 * Renders a form with fields for username, email, and password, including validation and error handling.
 * On submit, validates the input and calls the `onSave` callback with the form data if valid.
 *
 * @param user - The user object containing initial values for the form fields.
 * @param onSave - Callback function invoked with the form data ({ username, email, password }) when the form is submitted and valid.
 *
 * @remarks
 * - The password field can be left blank to keep the current password.
 * - Displays validation errors for each field.
 * - Responsive design: adjusts button size for mobile screens.
 */
export default function UserForm({ user, onSave }: IUserFormProps) {
	const [username, setUsername] = useState(user.username ?? '')
	const [email, setEmail] = useState(user.email ?? '')
	const [password, setPassword] = useState('')
	const [errors, setErrors] = useState<{ username?: string; email?: string; password?: string }>({})

	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	useEffect(() => {
		setUsername(user.username ?? '')
		setEmail(user.email ?? '')
	}, [user.username, user.email])

	/**
	 * Validates the user form fields for username, email, and password.
	 *
	 * @returns An object containing validation error messages for each field, if any.
	 * - `username`: Error message if the username is missing.
	 * - `email`: Error message if the email is missing or invalid.
	 * - `password`: Error message if the password is present but too short (less than 3 characters).
	 */
	function validate(): { username?: string; email?: string; password?: string } {
		const newErrors: typeof errors = {}
		if (!username) newErrors.username = 'Username is required'
		if (!email) newErrors.email = 'Email is required'
		else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) newErrors.email = 'Invalid email'
		if (password && password.length < 3) newErrors.password = 'Password too short'
		return newErrors
	}

	/**
	 * Handles the form submission event.
	 *
	 * Prevents the default form submission behavior, validates the form fields,
	 * sets any validation errors, and if there are no errors, calls the `onSave`
	 * callback with the user's input data. Resets the password field after a successful save.
	 *
	 * @param e - The form submission event.
	 */
	function onSubmitHandler(e: React.FormEvent): void {
		e.preventDefault()
		const validation = validate()
		setErrors(validation)
		if (Object.keys(validation).length === 0) {
			onSave({ username, email, password })
			setPassword('')
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
				<Box>
					<TextField
						error={!!errors.username}
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
						error={!!errors.email}
						id='email'
						label='Email'
						type='email'
						autoComplete='email'
						value={email}
						helperText={errors.email || ''}
						onChange={e => {
							setEmail(e.target.value)
							if (errors.email) setErrors({ ...errors, email: undefined })
						}}
					/>
				</Box>
				<TextField
					error={!!errors.password}
					id='password'
					label='Password'
					type='password'
					autoComplete='new-password'
					helperText={errors.password || 'Leave blank to keep current password'}
					value={password}
					onChange={e => {
						setPassword(e.target.value)
						if (errors.password) setErrors({ ...errors, password: undefined })
					}}
				/>

				<Box>
					<Button sx={{ m: 2 }} variant='contained' color='primary' size={isMobile ? 'small' : 'medium'} type='submit'>
						Save Changes
					</Button>
				</Box>
			</Box>
		</Box>
	)
}
