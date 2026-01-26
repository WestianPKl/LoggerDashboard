import { redirect, useNavigate } from 'react-router'
import { Typography, Box } from '@mui/material'
import UserPasswordResetLinkForm from './components/UserPasswordResetLinkForm'
import { showAlert } from '../../store/application-store'
import { useAppDispatch } from '../../store/hooks'
import { usePasswordResetTokenMutation } from '../../store/api/userApi'

export default function UserPasswordResetLinkView() {
	const dispatch = useAppDispatch()
	const navigate = useNavigate()
	const [getLink] = usePasswordResetTokenMutation()

	async function getPasswordResetLink(email: string | undefined): Promise<void> {
		try {
			const response = await getLink({ email: email }).unwrap()
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
			<UserPasswordResetLinkForm getPasswordResetLink={getPasswordResetLink} />
		</Box>
	)
}

export function loader(): Response | undefined {
	if (localStorage.getItem('token')) {
		return redirect('/')
	}
}
