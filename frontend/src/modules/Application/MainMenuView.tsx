import { Box, Container, useMediaQuery, useTheme } from '@mui/material'
import { redirect, useLoaderData, Await, data } from 'react-router'
import DashboardView from '../Dashboard/DashboardView'
import type { HouseClass } from '../House/scripts/HouseClass'
import { store } from '../../store/store'
import { houseApi } from '../../store/api/houseApi'
import { showAlert } from '../../store/application-store'
import { Suspense } from 'react'
import LoadingCircle from '../../components/UI/LoadingCircle'
import { getUserProfile } from '../../store/account-actions'
import { fetchAccessLevels, fetchPermission } from '../../store/auth-actions'
import type { UserClass } from '../User/scripts/UserClass'

export default function MainMenuView() {
	const { houses } = useLoaderData() as { houses: Promise<HouseClass[]> }
	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	return (
		<Container
			maxWidth={isMobile ? 'sm' : 'xl'}
			sx={{ display: 'flex', justifyContent: 'center', alignContent: 'center' }}>
			<Suspense fallback={<LoadingCircle />}>
				<Await resolve={houses}>
					{houseData => (
						<Box sx={{ textAlign: 'center' }}>
							<DashboardView houses={houseData} />
						</Box>
					)}
				</Await>
			</Suspense>
		</Container>
	)
}

export async function loader() {
	const token = localStorage.getItem('token')

	if (!token) {
		return redirect('/login')
	}
	try {
		const user = store.getState().account.user as UserClass
		const userId = user.id
		const permissionToken = localStorage.getItem('permissionToken')
		if (userId && token && permissionToken) {
			await Promise.all([
				store.dispatch(getUserProfile(userId)),
				store.dispatch(fetchPermission(userId)),
				store.dispatch(fetchAccessLevels()),
			])
		}
		const promise = await store.dispatch(houseApi.endpoints.getHouses.initiate({})).unwrap()
		if (!promise) {
			throw data('Data not Found', { status: 404 })
		}
		return { houses: promise }
	} catch (err: any) {
		store.dispatch(
			showAlert({
				message: err?.data?.message || err?.message || 'Something went wrong!',
				severity: 'error',
			})
		)
		throw err
	}
}
