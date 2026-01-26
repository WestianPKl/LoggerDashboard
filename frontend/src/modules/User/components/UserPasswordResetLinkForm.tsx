import { useState } from 'react'
import { Button, Box, TextField, useMediaQuery, useTheme } from '@mui/material'
import type { IPasswordResetLinkFormProps } from '../scripts/UserInterface'

type FormErrors = {
	email?: string
}

export default function UserPasswordResetLinkForm({ getPasswordResetLink }: IPasswordResetLinkFormProps) {
	const [email, setEmail] = useState('')
	const [errors, setErrors] = useState<FormErrors>({})

	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	function validate(): FormErrors {
		const newErrors: FormErrors = {}
		if (!email) newErrors.email = 'Email is required'
		else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) newErrors.email = 'Invalid email'
		return newErrors
	}

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
