import { Suspense, lazy } from 'react'
const EquipmentTable = lazy(() => import('../Equipment/components/EquipmentTable'))
import type { EquipmentClass } from '../Equipment/scripts/EquipmentClass'
import { Container, useMediaQuery, useTheme } from '@mui/material'
import { equipmentApi } from '../../store/api/equipmentApi'
import { showAlert } from '../../store/application-store'
import LoadingCircle from '../../components/UI/LoadingCircle'
import { store } from '../../store/store'
import { Await, useLoaderData, data } from 'react-router'

/**
 * AdminEquipmentView is a React component that displays a table of equipment data for administrators.
 *
 * It uses React Router's `useLoaderData` to retrieve a promise of equipment data, which is then resolved
 * asynchronously using React's `Suspense` and `Await` components. The resolved equipment data is passed
 * to the `EquipmentTable` component with the `adminPanel` flag set to `true`.
 *
 * The component also adapts its layout responsively using Material-UI's `useTheme` and `useMediaQuery`
 * hooks, rendering the container at different maximum widths depending on the screen size.
 *
 * @returns {JSX.Element} The rendered admin equipment view component.
 */
export default function AdminEquipmentView() {
	const { equipments } = useLoaderData() as { equipments: Promise<EquipmentClass[]> }

	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	return (
		<Container maxWidth={isMobile ? 'sm' : 'xl'}>
			<Suspense fallback={<LoadingCircle />}>
				<Await resolve={equipments}>
					{equipmentData => <EquipmentTable equipment={equipmentData} adminPanel={true} />}
				</Await>
			</Suspense>
		</Container>
	)
}

/**
 * Asynchronously loads the list of equipment for the admin view.
 *
 * Dispatches an API call to fetch equipment data using the Redux store.
 * If the data is not found, throws a 404 error.
 * On error, dispatches an alert with the error message and rethrows the error.
 *
 * @returns {Promise<{ equipments: EquipmentClass[] }>} A promise that resolves to an object containing the list of equipment.
 * @throws Will throw an error if the API call fails or if no data is found.
 */
export async function loader(): Promise<{ equipments: EquipmentClass[] }> {
	try {
		const promise = await store.dispatch(equipmentApi.endpoints.getEquipmentsAdmin.initiate({})).unwrap()
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
