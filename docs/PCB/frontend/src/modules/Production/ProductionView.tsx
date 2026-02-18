import { Suspense, lazy, useEffect, useState } from 'react'
const ProductionOrderTable = lazy(() => import('./components/ProductionOrderTable'))
import { Box, Container, Typography } from '@mui/material'
import { store } from '../../store/store'
import { showAlert } from '../../store/application-store'
import LoadingCircle from '../../components/UI/LoadingCircle'
import { Await, useLoaderData, data, useRevalidator } from 'react-router'
import type { GridSortModel } from '@mui/x-data-grid'
import type { GridFilterModel } from '@mui/x-data-grid'
import { productionApi } from '../../store/api/productionApi'
import { socket } from '../../socket/socket'
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturingOutlined'
import type { ProductionOrdersClass } from './scripts/ProductionOrders'

export default function ProductionView() {
	const { productionOrders } = useLoaderData() as {
		productionOrders: Promise<ProductionOrdersClass[]>
	}
	const [sortModel, setSortModel] = useState<GridSortModel>([])
	const [filterModel, setFilterModel] = useState<GridFilterModel>({
		items: [],
	})

	const revalidator = useRevalidator()

	useEffect(() => {
		function onAddPCBEvent(): void {
			revalidator.revalidate()
		}

		socket.on('productionOrder', onAddPCBEvent)
		return () => {
			socket.off('productionOrder', onAddPCBEvent)
		}
	}, [revalidator])

	useEffect(() => {
		const savedSortModel = localStorage.getItem('productionOrderTableSortModel')
		const savedFilterModel = localStorage.getItem('productionOrderTableFilterModel')

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
		<Box sx={{ px: { xs: 1, md: 3 } }}>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
				<Box
					sx={{
						width: 44,
						height: 44,
						borderRadius: 2,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						backgroundColor: '#fef3c7',
						color: '#d97706',
					}}>
					<PrecisionManufacturingIcon />
				</Box>
				<Box>
					<Typography variant='h5' sx={{ fontWeight: 700, lineHeight: 1.2 }}>
						Production
					</Typography>
					<Typography variant='body2' color='text.secondary'>
						Zarządzaj zleceniami produkcyjnymi
					</Typography>
				</Box>
			</Box>

			<Container maxWidth='xl' disableGutters>
				<Suspense fallback={<LoadingCircle />}>
					<Await resolve={productionOrders}>
						{productionOrdersData => (
							<ProductionOrderTable
								productionOrders={productionOrdersData}
								initSort={sortModel}
								initFilter={filterModel}
							/>
						)}
					</Await>
				</Suspense>
			</Container>
		</Box>
	)
}

export async function loader(): Promise<Response | { productionOrders: ProductionOrdersClass[] }> {
	try {
		const promise = await store.dispatch(productionApi.endpoints.getProductionOrders.initiate({})).unwrap()
		if (!promise) {
			throw data('Data not Found', { status: 404 })
		}
		return { productionOrders: promise }
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
