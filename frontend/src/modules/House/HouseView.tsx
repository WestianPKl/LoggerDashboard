import { lazy, Suspense } from 'react'
const HouseTable = lazy(() => import('./components/HouseTable'))
import { Container, useMediaQuery, useTheme } from '@mui/material'
import type { HouseClass } from './scripts/HouseClass'
import { houseApi } from '../../store/api/houseApi'
import { showAlert } from '../../store/application-store'
import LoadingCircle from '../../components/UI/LoadingCircle'
import { store } from '../../store/store'
import { data, useLoaderData, Await } from 'react-router'

export default function HouseView() {
	const { houses } = useLoaderData() as { houses: HouseClass[] }

	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	return (
		<Container maxWidth={isMobile ? 'xs' : 'xl'}>
			<Suspense fallback={<LoadingCircle />}>
				<Await resolve={houses}>{housesData => <HouseTable houses={housesData} />}</Await>
			</Suspense>
		</Container>
	)
}

export async function loader(): Promise<{ houses: HouseClass[] }> {
	try {
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
			}),
		)
		throw err
	}
}
