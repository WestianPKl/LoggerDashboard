import { lazy, Suspense } from 'react'
const HouseLoggerTable = lazy(() => import('./components/HouseLoggerTable'))
import { Container, useMediaQuery, useTheme } from '@mui/material'
import type { HouseLoggerClass } from './scripts/HouseLoggerClass'
import { houseApi } from '../../store/api/houseApi'
import { showAlert } from '../../store/application-store'
import LoadingCircle from '../../components/UI/LoadingCircle'
import { data, useLoaderData, Await } from 'react-router'
import { store } from '../../store/store'

export default function HouseLoggerView() {
	const { houseLoggers } = useLoaderData() as { houseLoggers: HouseLoggerClass[] }

	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	return (
		<Container maxWidth={isMobile ? 'sm' : 'xl'}>
			<Suspense fallback={<LoadingCircle />}>
				<Await resolve={houseLoggers}>{houseLoggersData => <HouseLoggerTable houseLoggers={houseLoggersData} />}</Await>
			</Suspense>
		</Container>
	)
}

export async function loader() {
	try {
		const promise = await store.dispatch(houseApi.endpoints.getHouseLoggers.initiate({})).unwrap()
		if (!promise) {
			throw data('Data not Found', { status: 404 })
		}
		return { houseLoggers: promise }
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
