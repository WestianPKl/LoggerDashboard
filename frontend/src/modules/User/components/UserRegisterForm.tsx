import { useState } from 'react'
import { Button, Box, TextField, useMediaQuery, useTheme } from '@mui/material'
import type { IRegisterFormProps } from '../scripts/UserInterface'

type FormErrors = {
	username?: string
	email?: string
	password?: string
	confirmPassword?: string
}

export default function RegisterForm({ createNewAccount }: IRegisterFormProps) {
	const [username, setUsername] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [errors, setErrors] = useState<FormErrors>({})

	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

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
