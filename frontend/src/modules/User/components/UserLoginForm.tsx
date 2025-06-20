import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Button, Box, TextField, useMediaQuery, useTheme } from '@mui/material'
import type { ILoginFormProps } from '../scripts/UserInterface'

export default function UserLoginForm({ logIn }: ILoginFormProps) {
	const [username, setUsername] = useState('')
	const [password, setPassword] = useState('')
	const [errors, setErrors] = useState<{ username?: string; password?: string }>({})
	const navigate = useNavigate()

	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	const onSubmitHandler = (e: React.FormEvent) => {
		e.preventDefault()
		const newErrors: { username?: string; password?: string } = {}
		if (!username) newErrors.username = 'Username is required'
		if (!password) newErrors.password = 'Password is required'
		setErrors(newErrors)
		if (Object.keys(newErrors).length === 0) {
			logIn({ username, password })
		}
	}

	const passwordReset = () => {
		navigate('/password-reset')
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
					error={!!errors.username}
					id='login-username'
					label='Username'
					value={username}
					autoComplete='username'
					helperText={errors.username || ''}
					onChange={e => {
						setUsername(e.target.value)
						if (errors.username) setErrors({ ...errors, username: undefined })
					}}
				/>
				<TextField
					error={!!errors.password}
					id='login-password'
					label='Password'
					type='password'
					autoComplete='password'
					value={password}
					helperText={errors.password || ''}
					onChange={e => {
						setPassword(e.target.value)
						if (errors.password) setErrors({ ...errors, password: undefined })
					}}
				/>
				<Box>
					<Button variant='outlined' size={isMobile ? 'small' : 'medium'} type='submit'>
						Login
					</Button>
					<Button
						sx={{ marginLeft: 2 }}
						variant='outlined'
						size={isMobile ? 'small' : 'medium'}
						type='button'
						onClick={passwordReset}>
						Reset password
					</Button>
				</Box>
			</Box>
		</Box>
	)
}
