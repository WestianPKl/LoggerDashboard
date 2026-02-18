import { Suspense, lazy, useEffect, useState } from 'react'
const ProductionOrderItemsTable = lazy(() => import('./components/ProductionOrderItemsTable'))
import { Box, Chip, Divider, Paper, Typography } from '@mui/material'
import { store } from '../../store/store'
import { showAlert } from '../../store/application-store'
import LoadingCircle from '../../components/UI/LoadingCircle'
import { Await, useLoaderData, data, useRevalidator, type LoaderFunctionArgs, useParams } from 'react-router'
import { productionApi } from '../../store/api/productionApi'
import { socket } from '../../socket/socket'
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturingOutlined'
import type { ProductionOrdersClass } from './scripts/ProductionOrders'
import type { ProductionOrderItemsClass } from './scripts/ProductionOrderItems'
import type { GridSortModel, GridFilterModel } from '@mui/x-data-grid'

export default function ProductionDetailsView() {
	const { productionOrder, productionOrderItems } = useLoaderData() as {
		productionOrder: Promise<ProductionOrdersClass>
		productionOrderItems: Promise<ProductionOrderItemsClass[]>
	}
	const { productionOrderId } = useParams<{ productionOrderId: string }>()

	const [sortModel, setSortModel] = useState<GridSortModel>([])
	const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] })

	const revalidator = useRevalidator()

	useEffect(() => {
		function onEvent(): void {
			revalidator.revalidate()
		}

		socket.on(`productionOrder-${productionOrderId}`, onEvent)
		socket.on('productionOrderItem', onEvent)
		return () => {
			socket.off(`productionOrder-${productionOrderId}`, onEvent)
			socket.off('productionOrderItem', onEvent)
		}
	}, [revalidator, productionOrderId])

	useEffect(() => {
		const savedSortModel = localStorage.getItem('productionOrderItemsTableSortModel')
		const savedFilterModel = localStorage.getItem('productionOrderItemsTableFilterModel')

		if (savedFilterModel) {
			try {
				const parsed = JSON.parse(savedFilterModel)
				if (parsed && typeof parsed === 'object' && Array.isArray(parsed.items)) {
					setFilterModel(parsed)
				}
			} catch {
				// pass
			}
		}

		if (savedSortModel) {
			try {
				const parsed = JSON.parse(savedSortModel)
				if (Array.isArray(parsed)) {
					setSortModel(parsed)
				}
			} catch {
				// pass
			}
		}
	}, [])

	const statusMap: Record<
		string,
		{ label: string; color: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' }
	> = {
		planned: { label: 'Zaplanowane', color: 'info' },
		ready: { label: 'Gotowe', color: 'primary' },
		reserved: { label: 'Zarezerwowane', color: 'secondary' },
		in_assembly: { label: 'W montażu', color: 'warning' },
		produced: { label: 'Wyprodukowane', color: 'success' },
		cancelled: { label: 'Anulowane', color: 'error' },
	}

	return (
		<Box sx={{ px: { xs: 1, md: 3 } }}>
			<Suspense fallback={<LoadingCircle />}>
				<Await resolve={productionOrder}>
					{(order: ProductionOrdersClass) => {
						const s = statusMap[order.status ?? ''] || { label: order.status ?? '-', color: 'default' }
						return (
							<>
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
									<Box sx={{ flex: 1 }}>
										<Typography variant='h5' sx={{ fontWeight: 700, lineHeight: 1.2 }}>
											Zlecenie #{order.id}
										</Typography>
										<Typography variant='body2' color='text.secondary'>
											Szczegóły zlecenia produkcyjnego
										</Typography>
									</Box>
									<Chip label={s.label} color={s.color} size='medium' variant='outlined' />
								</Box>

								<Paper
									variant='outlined'
									sx={{ p: 3, mb: 4, borderRadius: 3, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
									<Box>
										<Typography variant='caption' color='text.secondary'>
											PCB
										</Typography>
										<Typography variant='body1' sx={{ fontWeight: 600 }}>
											{order.pcb?.name ?? '-'}
										</Typography>
									</Box>
									<Box>
										<Typography variant='caption' color='text.secondary'>
											Ilość
										</Typography>
										<Typography variant='body1' sx={{ fontWeight: 600 }}>
											{order.quantity ?? '-'}
										</Typography>
									</Box>
									<Box>
										<Typography variant='caption' color='text.secondary'>
											Data utworzenia
										</Typography>
										<Typography variant='body1' sx={{ fontWeight: 600 }}>
											{order.createdAt
												? new Date(order.createdAt).toLocaleDateString('pl-PL', {
														day: '2-digit',
														month: '2-digit',
														year: 'numeric',
													})
												: '-'}
										</Typography>
									</Box>
									<Box>
										<Typography variant='caption' color='text.secondary'>
											Ostatnia aktualizacja
										</Typography>
										<Typography variant='body1' sx={{ fontWeight: 600 }}>
											{order.updatedAt
												? new Date(order.updatedAt).toLocaleDateString('pl-PL', {
														day: '2-digit',
														month: '2-digit',
														year: 'numeric',
													})
												: '-'}
										</Typography>
									</Box>
								</Paper>
							</>
						)
					}}
				</Await>

				<Divider sx={{ mb: 3 }} />

				<Await resolve={productionOrderItems}>
					{(itemsData: ProductionOrderItemsClass[]) => (
						<ProductionOrderItemsTable
							productionOrderId={parseInt(productionOrderId || '0')}
							productionOrderItems={itemsData}
							initSort={sortModel}
							initFilter={filterModel}
						/>
					)}
				</Await>
			</Suspense>
		</Box>
	)
}

export async function loader({
	params,
}: LoaderFunctionArgs): Promise<
	Response | { productionOrder: ProductionOrdersClass; productionOrderItems: ProductionOrderItemsClass[] }
> {
	if (!params.productionOrderId) throw data('No Production Order Id', { status: 400 })

	try {
		const productionOrder = await store
			.dispatch(
				productionApi.endpoints.getProductionOrder.initiate(parseInt(params.productionOrderId), {
					forceRefetch: true,
				}),
			)
			.unwrap()

		const productionOrderItems = await store
			.dispatch(
				productionApi.endpoints.getProductionOrderItems.initiate(
					{ productionOrderId: parseInt(params.productionOrderId) },
					{ forceRefetch: true },
				),
			)
			.unwrap()

		if (!productionOrder || !productionOrderItems) throw data('Data not Found', { status: 404 })

		return { productionOrder, productionOrderItems }
	} catch (err: any) {
		store.dispatch(
			showAlert({
				message: err?.data?.message || err?.message || 'Coś poszło nie tak!',
				severity: 'error',
			}),
		)
		throw err
	}
}
