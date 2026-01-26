import { redirect, useParams } from 'react-router'
import { useNavigate } from 'react-router'
import { Typography, Box } from '@mui/material'
import UserPasswordResetForm from './components/UserPasswordResetForm'
import { showAlert } from '../../store/application-store'
import { useAppDispatch } from '../../store/hooks'
import { usePasswordResetMutation } from '../../store/api/userApi'

export default function UserPasswordResetView() {
	const params = useParams()
	const token = params.token ? params.token : undefined
	const dispatch = useAppDispatch()
	const navigate = useNavigate()
	const [getReset] = usePasswordResetMutation()

	async function getPasswordReset(password: string | undefined, confirmPassword: string | undefined): Promise<void> {
		try {
			const response = await getReset({ password: password, confirmPassword: confirmPassword, token: token }).unwrap()
			if (response) {
				dispatch(showAlert({ message: 'Password reset mail sent', severity: 'success' }))
				navigate('/login')
			}
		} catch (err: any) {
			let message: string | string[] =
				err?.data?.message ||
				err?.message ||
				(err?.data && Array.isArray(err.data) && err.data.map((e: any) => e.msg).join(', ')) ||
				'Password reset failed'

			dispatch(showAlert({ message, severity: 'error' }))
		}
	}

	return (
		<Box sx={{ mt: 2, textAlign: 'center' }}>
			<Typography variant='h6' component='div' sx={{ flexGrow: 1, m: 1 }}>
				Password reset
			</Typography>
			<UserPasswordResetForm getPasswordReset={getPasswordReset} />
		</Box>
	)
}

export function loader(): Response | undefined {
	if (localStorage.getItem('token')) {
		return redirect('/')
	}
}
