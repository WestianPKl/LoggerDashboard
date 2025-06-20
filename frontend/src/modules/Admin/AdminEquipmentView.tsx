import { Suspense, lazy } from 'react'
const EquipmentTable = lazy(() => import('../Equipment/components/EquipmentTable'))
import type { EquipmentClass } from '../Equipment/scripts/EquipmentClass'
import { Container, useMediaQuery, useTheme } from '@mui/material'
import { equipmentApi } from '../../store/api/equipmentApi'
import { showAlert } from '../../store/application-store'
import LoadingCircle from '../../components/UI/LoadingCircle'
import { store } from '../../store/store'
import { Await, useLoaderData, data } from 'react-router'

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

export async function loader() {
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
