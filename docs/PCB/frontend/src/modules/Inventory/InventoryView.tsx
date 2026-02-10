import { Suspense, lazy, useEffect, useState } from 'react'
const InventoryTable = lazy(() => import('./components/InventoryTable'))
import { InventoryClass } from './scripts/Inventory'
import { Container, useMediaQuery, useTheme } from '@mui/material'
import { inventoryApi } from '../../store/api/inventoryApi'
import { store } from '../../store/store'
import { showAlert } from '../../store/application-store'
import LoadingCircle from '../../components/UI/LoadingCircle'
import { Await, useLoaderData, data } from 'react-router'
import type { GridSortModel } from '@mui/x-data-grid'
import type { GridFilterModel } from '@mui/x-data-grid'

export default function InventoryView() {
	const { inventories } = useLoaderData() as {
		inventories: Promise<InventoryClass[]>
	}
	const [sortModel, setSortModel] = useState<GridSortModel>([])
	const [filterModel, setFilterModel] = useState<GridFilterModel>({
		items: [],
	})

	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	useEffect(() => {
		const savedSortModel = localStorage.getItem('inventoryTableSortModel')
		const savedFilterModel = localStorage.getItem('inventoryTableFilterModel')

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
				<Await resolve={inventories}>
					{inventoriesData => (
						<InventoryTable inventory={inventoriesData} initSort={sortModel} initFilter={filterModel} />
					)}
				</Await>
			</Suspense>
		</Container>
	)
}

export async function loader(): Promise<Response | { inventories: InventoryClass[] }> {
	try {
		const promise = await store.dispatch(inventoryApi.endpoints.getInventories.initiate({})).unwrap()
		if (!promise) {
			throw data('Data not Found', { status: 404 })
		}
		return { inventories: promise }
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
