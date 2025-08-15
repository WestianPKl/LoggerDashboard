import { Suspense, lazy } from 'react'
const EquipmentVendorTable = lazy(() => import('./components/EquipmentVendorTable'))
import { Container, useMediaQuery, useTheme } from '@mui/material'
import type { EquipmentVendorClass } from './scripts/EquipmentVendorClass'
import { equipmentApi } from '../../store/api/equipmentApi'
import { showAlert } from '../../store/application-store'
import LoadingCircle from '../../components/UI/LoadingCircle'
import { redirect, Await, useLoaderData, data } from 'react-router'
import { store } from '../../store/store'

/**
 * EquipmentVendorView is a React component that displays a table of equipment vendors.
 * It utilizes data loaded via `useLoaderData`, which is expected to provide an array of `EquipmentVendorClass` objects.
 * The component adapts its layout based on the current screen size, using Material-UI's theming and media query hooks.
 * Data loading is handled asynchronously with React's `Suspense` and `Await` components, showing a loading indicator while data is being fetched.
 *
 * @returns {JSX.Element} The rendered equipment vendor view.
 */
export default function EquipmentVendorView() {
	const { equipmentVendors } = useLoaderData() as { equipmentVendors: EquipmentVendorClass[] }

	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	return (
		<Container maxWidth={isMobile ? 'sm' : 'xl'}>
			<Suspense fallback={<LoadingCircle />}>
				<Await resolve={equipmentVendors}>
					{equipmentVendorsData => <EquipmentVendorTable equipmentVendor={equipmentVendorsData} />}
				</Await>
			</Suspense>
		</Container>
	)
}

/**
 * Asynchronously loads equipment vendor data for the EquipmentVendorView module.
 *
 * This loader function checks for a valid authentication token in localStorage.
 * If the token is missing, it redirects the user to the login page.
 * Otherwise, it dispatches an API call to fetch equipment vendors.
 * If the data is not found, it throws a 404 error.
 * On success, it returns an object containing the list of equipment vendors.
 * If an error occurs during the API call, it dispatches an alert with the error message and rethrows the error.
 *
 * @returns {Promise<Response | { equipmentVendors: EquipmentVendorClass[] }>}
 *   A promise that resolves to either a redirect response or an object with the equipment vendors.
 * @throws Will throw an error if the API call fails or if the data is not found.
 */
export async function loader(): Promise<Response | { equipmentVendors: EquipmentVendorClass[] }> {
	if (!localStorage.getItem('token')) {
		return redirect('/login')
	}
	try {
		const promise = await store.dispatch(equipmentApi.endpoints.getEquipmentVendors.initiate({})).unwrap()
		if (!promise) {
			throw data('Data not Found', { status: 404 })
		}
		return { equipmentVendors: promise }
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
