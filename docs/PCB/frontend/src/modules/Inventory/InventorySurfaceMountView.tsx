import { Suspense, lazy, useEffect, useState } from 'react'
const InventorySurfaceMountTable = lazy(() => import('./components/InventorySurfaceMountTable'))
import { InventorySurfaceMountClass } from './scripts/InventorySurfaceMount'
import { Container, useMediaQuery, useTheme } from '@mui/material'
import { inventoryApi } from '../../store/api/inventoryApi'
import { store } from '../../store/store'
import { showAlert } from '../../store/application-store'
import LoadingCircle from '../../components/UI/LoadingCircle'
import { Await, useLoaderData, data } from 'react-router'
import type { GridFilterModel, GridSortModel } from '@mui/x-data-grid'

export default function InventorySurfaceMountView() {
	const { inventorySurfaceMounts } = useLoaderData() as {
		inventorySurfaceMounts: Promise<InventorySurfaceMountClass[]>
	}
	const [sortModel, setSortModel] = useState<GridSortModel>([])
	const [filterModel, setFilterModel] = useState<GridFilterModel>({
		items: [],
	})

	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	useEffect(() => {
		const savedSortModel = localStorage.getItem('inventoryTableSurfaceMountSortModel')
		const savedFilterModel = localStorage.getItem('inventoryTableSurfaceMountFilterModel')

		if (savedFilterModel) {
			try {
				const parsedFilterModel = JSON.parse(savedFilterModel)
				if (parsedFilterModel && typeof parsedFilterModel === 'object' && Array.isArray(parsedFilterModel.items)) {
					setFilterModel(parsedFilterModel)
				}
			} catch (err) {
				// pass
			}
		}

		if (savedSortModel) {
			try {
				const parsedSortModel = JSON.parse(savedSortModel)
				if (Array.isArray(parsedSortModel)) {
					setSortModel(parsedSortModel)
				}
			} catch (err) {
				// pass
			}
		}
	}, [])

	return (
		<Container maxWidth={isMobile ? 'sm' : 'xl'}>
			<Suspense fallback={<LoadingCircle />}>
				<Await resolve={inventorySurfaceMounts}>
					{inventorySurfaceMountsData => (
						<InventorySurfaceMountTable
							inventorySurfaceMount={inventorySurfaceMountsData}
							initSort={sortModel}
							initFilter={filterModel}
						/>
					)}
				</Await>
			</Suspense>
		</Container>
	)
}

export async function loader(): Promise<Response | { inventorySurfaceMounts: InventorySurfaceMountClass[] }> {
	try {
		const promise = await store.dispatch(inventoryApi.endpoints.getInventorySurfaceMounts.initiate({})).unwrap()
		if (!promise) {
			throw data('Data not Found', { status: 404 })
		}
		return { inventorySurfaceMounts: promise }
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
