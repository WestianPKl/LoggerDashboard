import { lazy, Suspense } from 'react'
import LoadingCircle from '../../components/UI/LoadingCircle'
import { redirect, useNavigate } from 'react-router'
import { Typography, Box } from '@mui/material'
const RegisterForm = lazy(() => import('./components/UserRegisterForm'))
import type { IRegisterData } from './scripts/UserInterface'
import type { IErrorData } from '../Application/scripts/AppInterface'
import { useAppDispatch } from '../../store/hooks'
import { showAlert } from '../../store/application-store'
import { useRegisterMutation } from '../../store/api/userApi'

export default function RegisterPageView() {
	const dispatch = useAppDispatch()
	const navigate = useNavigate()
	const [register] = useRegisterMutation()

	async function createNewAccount(registerData: IRegisterData): Promise<void> {
		try {
			await register(registerData).unwrap()
			dispatch(showAlert({ message: 'Account created successfully', severity: 'success' }))
			navigate('/login')
		} catch (err: any) {
			let errorArray: string[] = []
			const errorData = err?.data?.data
			if (Array.isArray(errorData) && errorData.length > 0) {
				errorArray = errorData.map((e: IErrorData) => e.msg)
			} else if (err?.data?.message) {
				errorArray = [err.data.message]
			} else if (err?.error) {
				errorArray = [err.error]
			} else {
				errorArray = ['Registration failed. Please try again.']
			}
			dispatch(showAlert({ message: errorArray, severity: 'error' }))
		}
	}

	return (
		<Box sx={{ mt: 2, textAlign: 'center' }}>
			<Typography variant='h6' component='div' sx={{ flexGrow: 1, m: 1 }}>
				Register
			</Typography>
			<Suspense fallback={<LoadingCircle />}>
				<RegisterForm createNewAccount={createNewAccount} />
			</Suspense>
		</Box>
	)
}

export function loader(): Response | undefined {
	if (localStorage.getItem('token')) {
		return redirect('/')
	}
}
