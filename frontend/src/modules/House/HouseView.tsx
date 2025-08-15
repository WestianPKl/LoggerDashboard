import { lazy, Suspense } from 'react'
const HouseTable = lazy(() => import('./components/HouseTable'))
import { Container, useMediaQuery, useTheme } from '@mui/material'
import type { HouseClass } from './scripts/HouseClass'
import { houseApi } from '../../store/api/houseApi'
import { showAlert } from '../../store/application-store'
import LoadingCircle from '../../components/UI/LoadingCircle'
import { store } from '../../store/store'
import { data, useLoaderData, Await } from 'react-router'

/**
 * Renders the main view for displaying a list of houses.
 *
 * This component fetches house data using `useLoaderData`, determines the current theme and device size,
 * and displays the `HouseTable` component with the loaded house data. While the data is loading,
 * a loading spinner (`LoadingCircle`) is shown. The container's maximum width adapts to mobile or desktop screens.
 *
 * @returns {JSX.Element} The rendered HouseView component.
 */
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

/**
 * Asynchronously loads a list of houses from the API and returns them.
 *
 * Dispatches the `getHouses` endpoint using Redux Toolkit's RTK Query, unwraps the result,
 * and returns the houses in an object. If no data is found, throws a 404 error.
 * In case of an error during the fetch, dispatches an alert with the error message and rethrows the error.
 *
 * @returns {Promise<{ houses: HouseClass[] }>} A promise that resolves to an object containing an array of `HouseClass` instances.
 * @throws Will throw an error if the data is not found or if the API call fails.
 */
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
			})
		)
		throw err
	}
}
