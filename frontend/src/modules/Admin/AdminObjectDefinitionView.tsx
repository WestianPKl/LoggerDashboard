import { lazy, Suspense } from 'react'
const AdminObjectDefinitionTable = lazy(() => import('./components/AdminObjectDefinitionTable'))
import type { ObjectDefinitionClass } from './scripts/ObjectDefinitionClass'
import { Container, useMediaQuery, useTheme } from '@mui/material'
import { adminApi } from '../../store/api/adminApi'
import { showAlert } from '../../store/application-store'
import LoadingCircle from '../../components/UI/LoadingCircle'
import { store } from '../../store/store'
import { data, useLoaderData, Await } from 'react-router'

/**
 * Renders the admin view for object definitions.
 *
 * This component loads and displays a table of object definitions, adapting its layout for mobile and desktop screens.
 * It uses React Suspense and Await to handle asynchronous data loading, showing a loading indicator while data is being fetched.
 *
 * @returns {JSX.Element} The rendered admin object definition view.
 */
export default function AdminObjectDefinitionView() {
	const { objectDefinitions } = useLoaderData() as { objectDefinitions: ObjectDefinitionClass[] }

	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	return (
		<Container maxWidth={isMobile ? 'sm' : 'xl'}>
			<Suspense fallback={<LoadingCircle />}>
				<Await resolve={objectDefinitions}>
					{objectDefinitionsData => <AdminObjectDefinitionTable objectDefinitions={objectDefinitionsData} />}
				</Await>
			</Suspense>
		</Container>
	)
}

/**
 * Asynchronously loads object definitions from the admin API.
 *
 * Dispatches a request to fetch object definitions and returns them in a structured format.
 * If the data is not found, throws a 404 error. In case of any other errors, displays an alert
 * with the error message and rethrows the error.
 *
 * @returns {Promise<{ objectDefinitions: ObjectDefinitionClass[] }>}
 *   A promise that resolves to an object containing an array of object definitions.
 * @throws {Error}
 *   Throws an error if the data is not found or if the API call fails.
 */
export async function loader(): Promise<{ objectDefinitions: ObjectDefinitionClass[] }> {
	try {
		if (!(await store.dispatch(adminApi.endpoints.getObjectDefinitions.initiate({})).unwrap())) {
			throw data('Data not Found', { status: 404 })
		}
		return { objectDefinitions: await store.dispatch(adminApi.endpoints.getObjectDefinitions.initiate({})).unwrap() }
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
