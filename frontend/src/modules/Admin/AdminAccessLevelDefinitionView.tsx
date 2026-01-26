import { lazy, Suspense } from 'react'
const AdminAccessLevelDefinitionTable = lazy(() => import('./components/AdminAccessLevelDefinitionTable'))
import type { AccessLevelDefinitionClass } from './scripts/AccessLevelDefinitionClass'
import { Container, useMediaQuery, useTheme } from '@mui/material'
import { adminApi } from '../../store/api/adminApi'
import { showAlert } from '../../store/application-store'
import LoadingCircle from '../../components/UI/LoadingCircle'
import { store } from '../../store/store'
import { data, useLoaderData, Await } from 'react-router'

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
			}),
		)
		throw err
	}
}
