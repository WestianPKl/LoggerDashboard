import { Suspense, lazy } from 'react'
const EquipmentModelTable = lazy(() => import('./components/EquipmentModelTable'))
import { Container, useMediaQuery, useTheme } from '@mui/material'
import type { EquipmentModelClass } from './scripts/EquipmentModelClass'
import { equipmentApi } from '../../store/api/equipmentApi'
import { showAlert } from '../../store/application-store'
import LoadingCircle from '../../components/UI/LoadingCircle'
import { store } from '../../store/store'
import { redirect, useLoaderData, Await, data } from 'react-router'

/**
 * EquipmentModelView is a React component that displays a table of equipment models.
 *
 * It retrieves the equipment models data using the `useLoaderData` hook, which is expected to return
 * a promise resolving to an array of `EquipmentModelClass` instances. The component uses Material-UI's
 * responsive utilities to adjust the container's maximum width based on the current screen size.
 *
 * The equipment models data is loaded asynchronously using React's `Suspense` and `Await` components,
 * displaying a loading indicator (`LoadingCircle`) while the data is being fetched. Once loaded, the
 * data is passed to the `EquipmentModelTable` component for rendering.
 *
 * @returns {JSX.Element} The rendered equipment model view.
 */
export default function EquipmaentModelView() {
	const { equipmentModels } = useLoaderData() as { equipmentModels: Promise<EquipmentModelClass[]> }
	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	return (
		<Container maxWidth={isMobile ? 'sm' : 'xl'}>
			<Suspense fallback={<LoadingCircle />}>
				<Await resolve={equipmentModels}>
					{equipmentModelsData => <EquipmentModelTable equipmentModel={equipmentModelsData} />}
				</Await>
			</Suspense>
		</Container>
	)
}

/**
 * Asynchronously loads equipment models for the Equipment Model View.
 *
 * - Checks for a valid authentication token in local storage.
 * - If no token is found, redirects the user to the login page.
 * - Dispatches an API call to fetch equipment models from the backend.
 * - If the data is not found, throws a 404 error.
 * - On success, returns an object containing the list of equipment models.
 * - On error, dispatches an alert with the error message and rethrows the error.
 *
 * @returns {Promise<Response | { equipmentModels: EquipmentModelClass[] }>}
 *   A promise that resolves to either a redirect response or an object containing the equipment models.
 */
export async function loader(): Promise<Response | { equipmentModels: EquipmentModelClass[] }> {
	if (!localStorage.getItem('token')) {
		return redirect('/login')
	}
	try {
		const promise = await store.dispatch(equipmentApi.endpoints.getEquipmentModels.initiate({})).unwrap()
		if (!promise) {
			throw data('Data not Found', { status: 404 })
		}
		return { equipmentModels: promise }
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
