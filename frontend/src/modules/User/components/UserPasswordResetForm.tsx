import { useState } from 'react'
import { Button, Box, TextField, useMediaQuery, useTheme } from '@mui/material'
import type { IPasswordResetFormProps } from '../scripts/UserInterface'

type FormErrors = {
	password?: string
	confirmPassword?: string
}

export default function UserPasswordResetForm({ getPasswordReset }: IPasswordResetFormProps) {
	const [password, setPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [errors, setErrors] = useState<FormErrors>({})

	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	const validate = () => {
		const newErrors: FormErrors = {}
		if (!password) newErrors.password = 'Password is required'
		if (!confirmPassword) newErrors.confirmPassword = 'Please confirm password'
		return newErrors
	}

	const onSubmitHandler = (e: React.FormEvent) => {
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
