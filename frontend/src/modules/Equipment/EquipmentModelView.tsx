import { Suspense, lazy } from 'react'
const EquipmentModelTable = lazy(() => import('./components/EquipmentModelTable'))
import { Container, useMediaQuery, useTheme } from '@mui/material'
import type { EquipmentModelClass } from './scripts/EquipmentModelClass'
import { equipmentApi } from '../../store/api/equipmentApi'
import { showAlert } from '../../store/application-store'
import LoadingCircle from '../../components/UI/LoadingCircle'
import { store } from '../../store/store'
import { redirect, useLoaderData, Await, data } from 'react-router'

export default function EquipmentModelView() {
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

export async function loader() {
	const token = localStorage.getItem('token')
	if (!token) {
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
