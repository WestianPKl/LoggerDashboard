import { Suspense, lazy, useEffect, useState } from 'react'
const InventoryShopTable = lazy(() => import('./components/InventoryShopTable'))
import { InventoryShopClass } from './scripts/InventoryShop'
import { Container, useMediaQuery, useTheme } from '@mui/material'
import { inventoryApi } from '../../store/api/inventoryApi'
import { store } from '../../store/store'
import { showAlert } from '../../store/application-store'
import LoadingCircle from '../../components/UI/LoadingCircle'
import { Await, useLoaderData, data } from 'react-router'
import type { GridFilterModel, GridSortModel } from '@mui/x-data-grid'

export default function InventoryShopView() {
	const { inventoryShops } = useLoaderData() as { inventoryShops: Promise<InventoryShopClass[]> }
	const [sortModel, setSortModel] = useState<GridSortModel>([])
	const [filterModel, setFilterModel] = useState<GridFilterModel>({
		items: [],
	})

	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	useEffect(() => {
		const savedSortModel = localStorage.getItem('inventoryTableShopSortModel')
		const savedFilterModel = localStorage.getItem('inventoryTableShopFilterModel')

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
				<Await resolve={inventoryShops}>
					{inventoryShopsData => (
						<InventoryShopTable inventoryShop={inventoryShopsData} initSort={sortModel} initFilter={filterModel} />
					)}
				</Await>
			</Suspense>
		</Container>
	)
}

export async function loader(): Promise<Response | { inventoryShops: InventoryShopClass[] }> {
	try {
		const promise = await store.dispatch(inventoryApi.endpoints.getInventoryShops.initiate({})).unwrap()
		if (!promise) {
			throw data('Data not Found', { status: 404 })
		}
		return { inventoryShops: promise }
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
