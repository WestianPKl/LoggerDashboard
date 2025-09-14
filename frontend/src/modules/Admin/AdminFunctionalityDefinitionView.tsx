import { lazy, Suspense } from 'react'
const AdminFunctionalityDefinitionTable = lazy(() => import('./components/AdminFunctionalityDefinitionTable'))
import type { FunctionalityDefinitionClass } from './scripts/FunctionalityDefinitionClass'
import { Container, useMediaQuery, useTheme } from '@mui/material'
import { adminApi } from '../../store/api/adminApi'
import { showAlert } from '../../store/application-store'
import LoadingCircle from '../../components/UI/LoadingCircle'
import { store } from '../../store/store'
import { data, useLoaderData, Await } from 'react-router'

/**
 * Renders the admin view for displaying a list of functionality definitions.
 *
 * This component fetches functionality definitions using `useLoaderData`, determines the current theme and screen size,
 * and displays the `AdminFunctionalityDefinitionTable` inside a responsive container. While the data is loading,
 * a loading spinner (`LoadingCircle`) is shown.
 *
 * @returns {JSX.Element} The rendered admin functionality definition view.
 */
export default function AdminFunctionalityDefinitionView() {
	const { functionalityDefinitions } = useLoaderData() as { functionalityDefinitions: FunctionalityDefinitionClass[] }

	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	return (
		<Container maxWidth={isMobile ? 'sm' : 'xl'}>
			<Suspense fallback={<LoadingCircle />}>
				<Await resolve={functionalityDefinitions}>
					{functionalityDefinitionsData => (
						<AdminFunctionalityDefinitionTable functionalityDefinitions={functionalityDefinitionsData} />
					)}
				</Await>
			</Suspense>
		</Container>
	)
}

/**
 * Asynchronously loads functionality definitions from the backend API.
 *
 * Dispatches a request to fetch functionality definitions using the admin API.
 * If the request is successful, returns an object containing the array of functionality definitions.
 * If no data is found, throws a 404 error.
 * In case of an error, dispatches an alert with the error message and rethrows the error.
 *
 * @returns {Promise<{ functionalityDefinitions: FunctionalityDefinitionClass[] }>}
 *   A promise that resolves to an object containing the functionality definitions.
 * @throws Will throw an error if the data is not found or if the API request fails.
 */
export async function loader(): Promise<{ functionalityDefinitions: FunctionalityDefinitionClass[] }> {
	try {
		const promise = await store.dispatch(adminApi.endpoints.getFunctionalityDefinitions.initiate({})).unwrap()
		if (!promise) {
			throw data('Data not Found', { status: 404 })
		}
		return { functionalityDefinitions: promise }
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
