import { Suspense, lazy } from 'react'
const EquipmentTable = lazy(() => import('./components/EquipmentTable'))
import type { EquipmentClass } from './scripts/EquipmentClass'
import { Container, useMediaQuery, useTheme } from '@mui/material'
import { equipmentApi } from '../../store/api/equipmentApi'
import { showAlert } from '../../store/application-store'
import LoadingCircle from '../../components/UI/LoadingCircle'
import { store } from '../../store/store'
import { Await, useLoaderData, data } from 'react-router'

/**
 * EquipmentMainView is the main component for displaying equipment data.
 * It loads equipment asynchronously using React Router's `useLoaderData` and `Await` components,
 * and renders the data in an `EquipmentTable` once loaded.
 * The layout adapts responsively based on the current theme's breakpoint, using Material-UI's `useMediaQuery`.
 *
 * @returns {JSX.Element} The rendered equipment main view, including a loading indicator while data is being fetched.
 */
export default function EquipmentMainView() {
	const { equipments } = useLoaderData() as { equipments: Promise<EquipmentClass[]> }

	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	return (
		<Container maxWidth={isMobile ? 'sm' : 'xl'}>
			<Suspense fallback={<LoadingCircle />}>
				<Await resolve={equipments}>{equipmentData => <EquipmentTable equipment={equipmentData} />}</Await>
			</Suspense>
		</Container>
	)
}

/**
 * Asynchronously loads the list of equipment from the API and returns it.
 *
 * Dispatches a Redux action to fetch equipment data using the `equipmentApi` endpoint.
 * If the data is not found, throws a 404 error.
 * In case of an error during the fetch, dispatches an alert with the error message and rethrows the error.
 *
 * @returns {Promise<{ equipments: EquipmentClass[] }>} A promise that resolves to an object containing the list of equipment.
 * @throws Will throw an error if the equipment data cannot be fetched or is not found.
 */
export async function loader(): Promise<{ equipments: EquipmentClass[] }> {
	try {
		const promise = await store.dispatch(equipmentApi.endpoints.getEquipments.initiate({})).unwrap()
		if (!promise) {
			throw data('Data not Found', { status: 404 })
		}
		return { equipments: promise }
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
