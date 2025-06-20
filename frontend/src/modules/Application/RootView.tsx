import { useRef, useEffect } from 'react'
import { Outlet, redirect, useLoaderData, useSubmit } from 'react-router'
import AppBarView from './AppBarView'
import Wrapper from '../../components/UI/Wrapper'
import { Box } from '@mui/material'
import { useAppDispatch } from '../../store/hooks'
import { initStore, getAuthTokenDuration, getUserProfile, logoutAction } from '../../store/account-actions'
import { store } from '../../store/store'
import { fetchAccessLevels, fetchPermission } from '../../store/auth-actions'

export default function RootView() {
	const { userId, token, permissionToken } = useLoaderData()
	const submit = useSubmit()
	const dispatch = useAppDispatch()
	const logoffTimeout = useRef<number | null>(null)

	useEffect(() => {
		let mounted = true
		if (token && permissionToken) {
			const duration = dispatch(getAuthTokenDuration())
			if (userId && token && permissionToken && typeof duration === 'number' && duration > 0 && mounted) {
				logoffTimeout.current = setTimeout(() => {
					return submit(null, { action: '/login', method: 'POST' })
				}, duration)
			}
			return () => {
				mounted = false
				if (logoffTimeout.current) {
					clearTimeout(logoffTimeout.current)
				}
			}
		} else {
			return () => {
				mounted = false
				if (logoffTimeout.current) {
					clearTimeout(logoffTimeout.current)
				}
			}
		}
	}, [dispatch])
	return (
		<Box component={'section'}>
			<AppBarView />
			<Wrapper>
				<Outlet />
			</Wrapper>
		</Box>
	)
}

export async function loader() {
	const userId = store.dispatch(initStore())
	const token = localStorage.getItem('token')
	const permissionToken = localStorage.getItem('permissionToken')
	if (userId && token && permissionToken) {
		await Promise.all([
			store.dispatch(getUserProfile(userId)),
			store.dispatch(fetchPermission(userId)),
			store.dispatch(fetchAccessLevels()),
		])
	}
	return { userId, token, permissionToken }
}

export function action() {
	store.dispatch(logoutAction())
	return redirect('/login')
}
