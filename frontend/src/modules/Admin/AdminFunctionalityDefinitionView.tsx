import { lazy, Suspense } from 'react'
const AdminFunctionalityDefinitionTable = lazy(() => import('./components/AdminFunctionalityDefinitionTable'))
import type { FunctionalityDefinitionClass } from './scripts/FunctionalityDefinitionClass'
import { Container, useMediaQuery, useTheme } from '@mui/material'
import { adminApi } from '../../store/api/adminApi'
import { showAlert } from '../../store/application-store'
import LoadingCircle from '../../components/UI/LoadingCircle'
import { store } from '../../store/store'
import { data, useLoaderData, Await } from 'react-router'

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

export async function loader() {
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
