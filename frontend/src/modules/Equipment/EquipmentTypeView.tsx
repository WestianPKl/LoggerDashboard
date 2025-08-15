import { Suspense, lazy } from 'react'
const EquipmentTypeTable = lazy(() => import('./components/EquipmentTypeTable'))
import type { EquipmentTypeClass } from './scripts/EquipmentTypeClass'
import { Container, useMediaQuery, useTheme } from '@mui/material'
import { equipmentApi } from '../../store/api/equipmentApi'
import { showAlert } from '../../store/application-store'
import LoadingCircle from '../../components/UI/LoadingCircle'
import { store } from '../../store/store'
import { redirect, Await, useLoaderData, data } from 'react-router'

/**
 * Displays a view for equipment types, fetching data asynchronously and rendering it in a table.
 *
 * This component uses React Suspense and Await to handle the asynchronous loading of equipment types,
 * displaying a loading indicator while data is being fetched. It adapts its container size based on
 * the current screen size (mobile or desktop).
 *
 * @returns {JSX.Element} The rendered equipment type view component.
 */
export default function EquipmentTypeView() {
	const { equipmentTypes } = useLoaderData() as { equipmentTypes: Promise<EquipmentTypeClass[]> }

	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	return (
		<Container maxWidth={isMobile ? 'sm' : 'xl'}>
			<Suspense fallback={<LoadingCircle />}>
				<Await resolve={equipmentTypes}>
					{equipmentTypesData => <EquipmentTypeTable equipmentType={equipmentTypesData} />}
				</Await>
			</Suspense>
		</Container>
	)
}

/**
 * Asynchronously loads equipment types data for the EquipmentTypeView module.
 *
 * - Checks for a valid authentication token in localStorage.
 * - Redirects to the login page if the token is missing.
 * - Fetches equipment types from the API using Redux store dispatch.
 * - Returns an object containing the equipment types if successful.
 * - If no data is found, throws a 404 error.
 * - On error, dispatches an alert with the error message and rethrows the error.
 *
 * @returns {Promise<Response | { equipmentTypes: EquipmentTypeClass[] }>}
 *   A promise that resolves to either a redirect response or an object containing the equipment types.
 */
export async function loader(): Promise<Response | { equipmentTypes: EquipmentTypeClass[] }> {
	if (!localStorage.getItem('token')) {
		return redirect('/login')
	}
	try {
		const promise = await store.dispatch(equipmentApi.endpoints.getEquipmentTypes.initiate({})).unwrap()
		if (!promise) {
			throw data('Data not Found', { status: 404 })
		}
		return { equipmentTypes: promise }
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
