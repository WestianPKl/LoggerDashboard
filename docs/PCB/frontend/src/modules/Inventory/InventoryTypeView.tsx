import { Suspense, lazy, useEffect, useState } from 'react'
const InventoryTypeTable = lazy(() => import('./components/InventoryTypeTable'))
import { InventoryTypeClass } from './scripts/InventoryType'
import { Container, useMediaQuery, useTheme } from '@mui/material'
import { inventoryApi } from '../../store/api/inventoryApi'
import { store } from '../../store/store'
import { showAlert } from '../../store/application-store'
import LoadingCircle from '../../components/UI/LoadingCircle'
import { Await, useLoaderData, data } from 'react-router'
import type { GridFilterModel, GridSortModel } from '@mui/x-data-grid'

export default function InventoryTypeView() {
	const { inventoryTypes } = useLoaderData() as {
		inventoryTypes: Promise<InventoryTypeClass[]>
	}
	const [sortModel, setSortModel] = useState<GridSortModel>([])
	const [filterModel, setFilterModel] = useState<GridFilterModel>({
		items: [],
	})

	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	useEffect(() => {
		const savedSortModel = localStorage.getItem('inventoryTableTypeSortModel')
		const savedFilterModel = localStorage.getItem('inventoryTableTypeFilterModel')

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
				<Await resolve={inventoryTypes}>
					{inventoryTypesData => (
						<InventoryTypeTable inventoryType={inventoryTypesData} initSort={sortModel} initFilter={filterModel} />
					)}
				</Await>
			</Suspense>
		</Container>
	)
}

export async function loader(): Promise<Response | { inventoryTypes: InventoryTypeClass[] }> {
	try {
		const promise = await store.dispatch(inventoryApi.endpoints.getInventoryTypes.initiate({})).unwrap()
		if (!promise) {
			throw data('Data not Found', { status: 404 })
		}
		return { inventoryTypes: promise }
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
