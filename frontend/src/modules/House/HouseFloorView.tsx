import { lazy, Suspense } from 'react'
const HouseFloorTable = lazy(() => import('./components/HouseFloorTable'))
import { Container, useMediaQuery, useTheme } from '@mui/material'
import type { HouseFloorClass } from './scripts/HouseFloorClass'
import { houseApi } from '../../store/api/houseApi'
import { showAlert } from '../../store/application-store'
import LoadingCircle from '../../components/UI/LoadingCircle'
import { data, useLoaderData, Await } from 'react-router'
import { store } from '../../store/store'

export default function HouseFloorView() {
	const { houseFloors } = useLoaderData() as { houseFloors: HouseFloorClass[] }

	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	return (
		<Container maxWidth={isMobile ? 'sm' : 'xl'}>
			<Suspense fallback={<LoadingCircle />}>
				<Await resolve={houseFloors}>{houseFloorsData => <HouseFloorTable houseFloors={houseFloorsData} />}</Await>
			</Suspense>
		</Container>
	)
}

export async function loader() {
	try {
		const promise = await store.dispatch(houseApi.endpoints.getHouseFloors.initiate({})).unwrap()
		if (!promise) {
			throw data('Data not Found', { status: 404 })
		}
		return { houseFloors: promise }
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
