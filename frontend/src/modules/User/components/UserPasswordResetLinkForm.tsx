import { useState } from 'react'
import { Button, Box, TextField, useMediaQuery, useTheme } from '@mui/material'
import type { IPasswordResetLinkFormProps } from '../scripts/UserInterface'

/**
 * Represents the possible validation errors for the user password reset form.
 *
 * @property email - An optional error message related to the email field.
 */
type FormErrors = {
	email?: string
}

/**
 * Renders a form for requesting a password reset link by entering an email address.
 *
 * @component
 * @param {IPasswordResetLinkFormProps} props - The props for the component.
 * @param {(email: string) => void} props.getPasswordResetLink - Callback function to request a password reset link for the provided email.
 *
 * @returns {JSX.Element} The rendered password reset link form component.
 *
 * @example
 * <UserPasswordResetLinkForm getPasswordResetLink={handlePasswordReset} />
 *
 * @remarks
 * - Validates the email field for required input and proper email format.
 * - Displays validation errors inline.
 * - Adapts button size for mobile devices using Material-UI's theme breakpoints.
 */
export default function UserPasswordResetLinkForm({ getPasswordResetLink }: IPasswordResetLinkFormProps) {
	const [email, setEmail] = useState('')
	const [errors, setErrors] = useState<FormErrors>({})

	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	/**
	 * Validates the email input field and returns an object containing any validation errors.
	 *
	 * @returns {FormErrors} An object with error messages for invalid or missing email input.
	 * - If the email is missing, sets `email` to 'Email is required'.
	 * - If the email format is invalid, sets `email` to 'Invalid email'.
	 */
	function validate(): FormErrors {
		const newErrors: FormErrors = {}
		if (!email) newErrors.email = 'Email is required'
		else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) newErrors.email = 'Invalid email'
		return newErrors
	}

	/**
	 * Handles the form submission event for requesting a password reset link.
	 *
	 * Prevents the default form submission behavior, validates the form input,
	 * sets any validation errors, and if there are no errors, triggers the
	 * password reset link request using the provided email.
	 *
	 * @param e - The form submission event.
	 */
	function onSubmitHandler(e: React.FormEvent): void {
		e.preventDefault()
		const validationErrors = validate()
		setErrors(validationErrors)
		if (Object.keys(validationErrors).length === 0) {
			getPasswordResetLink(email)
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
				<Box>
					<Button variant='outlined' size={isMobile ? 'small' : 'medium'} type='submit'>
						Reset
					</Button>
				</Box>
			</Box>
		</Box>
	)
}
