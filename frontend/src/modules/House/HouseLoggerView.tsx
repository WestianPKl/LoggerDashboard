import { lazy, Suspense } from 'react'
const HouseLoggerTable = lazy(() => import('./components/HouseLoggerTable'))
import { Container, useMediaQuery, useTheme } from '@mui/material'
import type { HouseLoggerClass } from './scripts/HouseLoggerClass'
import { houseApi } from '../../store/api/houseApi'
import { showAlert } from '../../store/application-store'
import LoadingCircle from '../../components/UI/LoadingCircle'
import { data, useLoaderData, Await } from 'react-router'
import { store } from '../../store/store'

/**
 * Renders the main view for displaying house loggers.
 *
 * This component retrieves the list of house loggers using `useLoaderData`, determines the current screen size
 * to adjust the container's maximum width, and displays a table of house loggers. Data loading is handled
 * asynchronously with React's `Suspense` and `Await` components, showing a loading indicator while data is being fetched.
 *
 * @returns {JSX.Element} The rendered HouseLoggerView component.
 */
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

/**
 * Asynchronously loads the list of house loggers from the API.
 *
 * Dispatches a request to fetch house loggers using the Redux store and handles errors by showing an alert.
 * If no data is returned, throws a 404 error.
 *
 * @returns {Promise<{ houseLoggers: HouseLoggerClass[] }>} A promise that resolves to an object containing an array of house loggers.
 * @throws Will throw an error if the data is not found or if the API request fails.
 */
export async function loader(): Promise<{ houseLoggers: HouseLoggerClass[] }> {
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
