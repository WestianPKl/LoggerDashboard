import { useState } from 'react'
import { Button, Box, TextField, useMediaQuery, useTheme } from '@mui/material'
import type { IPasswordResetFormProps } from '../scripts/UserInterface'

/**
 * Represents the possible validation errors for the user password reset form.
 *
 * @property password - An optional error message related to the password field.
 * @property confirmPassword - An optional error message related to the confirm password field.
 */
type FormErrors = {
	password?: string
	confirmPassword?: string
}

/**
 * Renders a password reset form with fields for entering and confirming a new password.
 *
 * @component
 * @param {IPasswordResetFormProps} props - The props for the component.
 * @param {(password: string, confirmPassword: string) => void} props.getPasswordReset -
 *   Callback function to handle password reset logic, called with the new password and confirmation.
 *
 * @returns {JSX.Element} The rendered password reset form.
 *
 * @remarks
 * - Uses Material-UI components for styling and layout.
 * - Performs basic validation to ensure both fields are filled.
 * - Displays validation errors inline.
 * - Responsive to mobile screen sizes.
 */
export default function UserPasswordResetForm({ getPasswordReset }: IPasswordResetFormProps) {
	const [password, setPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [errors, setErrors] = useState<FormErrors>({})

	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	/**
	 * Validates the password and confirm password fields.
	 *
	 * Checks if both the `password` and `confirmPassword` fields are provided.
	 * Returns an object containing error messages for any missing fields.
	 *
	 * @returns {FormErrors} An object with error messages for missing fields.
	 */
	function validate(): FormErrors {
		const newErrors: FormErrors = {}
		if (!password) newErrors.password = 'Password is required'
		if (!confirmPassword) newErrors.confirmPassword = 'Please confirm password'
		return newErrors
	}

	/**
	 * Handles the form submission event for the password reset form.
	 *
	 * Prevents the default form submission behavior, validates the form fields,
	 * sets any validation errors, and if there are no errors, triggers the password reset process.
	 *
	 * @param e - The form submission event.
	 */
	function onSubmitHandler(e: React.FormEvent): void {
		e.preventDefault()
		const validationErrors = validate()
		setErrors(validationErrors)
		if (Object.keys(validationErrors).length === 0) {
			getPasswordReset(password, confirmPassword)
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
					<Button variant='outlined' size={isMobile ? 'small' : 'medium'} type='submit'>
						Reset
					</Button>
				</Box>
			</Box>
		</Box>
	)
}
