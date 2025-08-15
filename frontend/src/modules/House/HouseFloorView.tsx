import { lazy, Suspense } from 'react'
const HouseFloorTable = lazy(() => import('./components/HouseFloorTable'))
import { Container, useMediaQuery, useTheme } from '@mui/material'
import type { HouseFloorClass } from './scripts/HouseFloorClass'
import { houseApi } from '../../store/api/houseApi'
import { showAlert } from '../../store/application-store'
import LoadingCircle from '../../components/UI/LoadingCircle'
import { data, useLoaderData, Await } from 'react-router'
import { store } from '../../store/store'

/**
 * Renders the house floor view, displaying a table of house floors.
 *
 * This component loads the list of house floors using `useLoaderData`, and displays them
 * in a responsive container. It uses Material-UI's `useTheme` and `useMediaQuery` to adjust
 * the container size based on the screen size (mobile or desktop).
 *
 * The house floors data is loaded asynchronously and rendered inside a `Suspense` boundary,
 * showing a loading indicator (`LoadingCircle`) while the data is being fetched.
 *
 * @returns {JSX.Element} The rendered house floor view component.
 */
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

/**
 * Asynchronously loads the list of house floors from the API.
 *
 * Dispatches the `getHouseFloors` endpoint using Redux Toolkit's RTK Query,
 * and returns the result as an object containing an array of `HouseFloorClass` instances.
 * If no data is found, throws a 404 error.
 * In case of an error, dispatches an alert with the error message and rethrows the error.
 *
 * @returns {Promise<{ houseFloors: HouseFloorClass[] }>} An object containing the loaded house floors.
 * @throws Will throw an error if the data is not found or if the API call fails.
 */
export async function loader(): Promise<{ houseFloors: HouseFloorClass[] }> {
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
