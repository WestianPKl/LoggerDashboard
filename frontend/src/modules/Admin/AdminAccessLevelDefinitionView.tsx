import { lazy, Suspense } from 'react'
const AdminAccessLevelDefinitionTable = lazy(() => import('./components/AdminAccessLevelDefinitionTable'))
import type { AccessLevelDefinitionClass } from './scripts/AccessLevelDefinitionClass'
import { Container, useMediaQuery, useTheme } from '@mui/material'
import { adminApi } from '../../store/api/adminApi'
import { showAlert } from '../../store/application-store'
import LoadingCircle from '../../components/UI/LoadingCircle'
import { store } from '../../store/store'
import { data, useLoaderData, Await } from 'react-router'

/**
 * Renders the admin view for displaying access level definitions.
 *
 * This component fetches access level data using `useLoaderData`, determines the current screen size,
 * and displays the `AdminAccessLevelDefinitionTable` within a responsive container.
 * While the access levels are loading, a loading spinner (`LoadingCircle`) is shown.
 *
 * @returns {JSX.Element} The rendered admin access level definition view.
 */
export default function AdminAccessLevelDefinitionView() {
	const { accessLevels } = useLoaderData() as { accessLevels: AccessLevelDefinitionClass[] }

	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	return (
		<Container maxWidth={isMobile ? 'sm' : 'xl'}>
			<Suspense fallback={<LoadingCircle />}>
				<Await resolve={accessLevels}>
					{accessLevelsData => <AdminAccessLevelDefinitionTable accessLevels={accessLevelsData} />}
				</Await>
			</Suspense>
		</Container>
	)
}

/**
 * Asynchronously loads access level definitions from the API and returns them.
 *
 * Dispatches an API call to fetch access level definitions and unwraps the result.
 * If no data is found, throws a 404 error. In case of any error, dispatches an alert
 * with the error message and rethrows the error.
 *
 * @returns {Promise<{ accessLevels: AccessLevelDefinitionClass[] }>}
 *   A promise that resolves to an object containing an array of access level definitions.
 * @throws Will throw an error if the data is not found or if the API call fails.
 */
export async function loader(): Promise<{ accessLevels: AccessLevelDefinitionClass[] }> {
	try {
		const promise = await store.dispatch(adminApi.endpoints.getAccessLevelDefinitions.initiate({})).unwrap()
		if (!promise) {
			throw data('Data not Found', { status: 404 })
		}
		return { accessLevels: promise }
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
