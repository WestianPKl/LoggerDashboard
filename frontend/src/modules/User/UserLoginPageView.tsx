import { redirect, useNavigate } from 'react-router'
import type { ILoginData } from './scripts/UserInterface'
import { Typography, Box } from '@mui/material'
import UserLoginForm from './components/UserLoginForm'
import { loginAction } from '../../store/account-actions'
import { showAlert } from '../../store/application-store'
import { useAppDispatch } from '../../store/hooks'
import { useLoginMutation } from '../../store/api/userApi'

export default function LoginPageView() {
	const dispatch = useAppDispatch()
	const navigate = useNavigate()
	const [login] = useLoginMutation()

	async function logIn(loginData: ILoginData) {
		try {
			const response = await login(loginData).unwrap()
			if (response && response.token && response.permissionToken) {
				localStorage.setItem('token', response.token)
				localStorage.setItem('permissionToken', response.permissionToken)
				dispatch(loginAction({ token: response.token, permissionToken: response.permissionToken }))
				dispatch(showAlert({ message: 'User logged in', severity: 'success' }))
				setTimeout(() => navigate('/'), 100)
			}
		} catch (err: any) {
			let message: string | string[] =
				err?.data?.message ||
				err?.message ||
				(err?.data && Array.isArray(err.data) && err.data.map((e: any) => e.msg).join(', ')) ||
				'Login failed'

			dispatch(showAlert({ message, severity: 'error' }))
		}
	}

	return (
		<Box sx={{ mt: 2, textAlign: 'center' }}>
			<Typography variant='h6' component='div' sx={{ flexGrow: 1, m: 1 }}>
				Login
			</Typography>
			<UserLoginForm logIn={logIn} />
		</Box>
	)
}

export function loader() {
	const token = localStorage.getItem('token')
	if (token) {
		return redirect('/')
	}
}
