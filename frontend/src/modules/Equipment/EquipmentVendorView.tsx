import { Suspense, lazy } from 'react'
const EquipmentVendorTable = lazy(() => import('./components/EquipmentVendorTable'))
import { Container, useMediaQuery, useTheme } from '@mui/material'
import type { EquipmentVendorClass } from './scripts/EquipmentVendorClass'
import { equipmentApi } from '../../store/api/equipmentApi'
import { showAlert } from '../../store/application-store'
import LoadingCircle from '../../components/UI/LoadingCircle'
import { redirect, Await, useLoaderData, data } from 'react-router'
import { store } from '../../store/store'

export default function EquipmentVendorView() {
	const { equipmentVendors } = useLoaderData() as { equipmentVendors: EquipmentVendorClass[] }

	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	return (
		<Container maxWidth={isMobile ? 'sm' : 'xl'}>
			<Suspense fallback={<LoadingCircle />}>
				<Await resolve={equipmentVendors}>
					{equipmentVendorsData => <EquipmentVendorTable equipmentVendor={equipmentVendorsData} />}
				</Await>
			</Suspense>
		</Container>
	)
}

export async function loader(): Promise<Response | { equipmentVendors: EquipmentVendorClass[] }> {
	if (!localStorage.getItem('token')) {
		return redirect('/login')
	}
	try {
		const promise = await store.dispatch(equipmentApi.endpoints.getEquipmentVendors.initiate({})).unwrap()
		if (!promise) {
			throw data('Data not Found', { status: 404 })
		}
		return { equipmentVendors: promise }
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
