import { Suspense, lazy } from 'react'
const EquipmentTypeTable = lazy(() => import('./components/EquipmentTypeTable'))
import type { EquipmentTypeClass } from './scripts/EquipmentTypeClass'
import { Container, useMediaQuery, useTheme } from '@mui/material'
import { equipmentApi } from '../../store/api/equipmentApi'
import { showAlert } from '../../store/application-store'
import LoadingCircle from '../../components/UI/LoadingCircle'
import { store } from '../../store/store'
import { redirect, Await, useLoaderData, data } from 'react-router'

export default function EquipmentTypeView() {
	const { equipmentTypes } = useLoaderData() as { equipmentTypes: Promise<EquipmentTypeClass[]> }

	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	return (
		<Container maxWidth={isMobile ? 'sm' : 'xl'}>
			<Suspense fallback={<LoadingCircle />}>
				<Await resolve={equipmentTypes}>
					{equipmentTypesData => <EquipmentTypeTable equipmentType={equipmentTypesData} />}
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
		const promise = await store.dispatch(equipmentApi.endpoints.getEquipmentTypes.initiate({})).unwrap()
		if (!promise) {
			throw data('Data not Found', { status: 404 })
		}
		return { equipmentTypes: promise }
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
