import { lazy, Suspense } from 'react'
const AdminObjectDefinitionTable = lazy(() => import('./components/AdminObjectDefinitionTable'))
import type { ObjectDefinitionClass } from './scripts/ObjectDefinitionClass'
import { Container, useMediaQuery, useTheme } from '@mui/material'
import { adminApi } from '../../store/api/adminApi'
import { showAlert } from '../../store/application-store'
import LoadingCircle from '../../components/UI/LoadingCircle'
import { store } from '../../store/store'
import { data, useLoaderData, Await } from 'react-router'

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

export async function loader() {
	try {
		const promise = await store.dispatch(adminApi.endpoints.getObjectDefinitions.initiate({})).unwrap()
		if (!promise) {
			throw data('Data not Found', { status: 404 })
		}
		return { objectDefinitions: promise }
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
