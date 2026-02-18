import { useState, useMemo, useEffect, useCallback } from 'react'
import {
	Box,
	Typography,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	DialogContentText,
	useMediaQuery,
	useTheme,
	IconButton,
	Chip,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import {
	DataGrid,
	type GridColDef,
	type GridFilterModel,
	type GridRowSelectionModel,
	type GridSortModel,
} from '@mui/x-data-grid'
import type { IAddProductionOrderData, IProductionOrderTableProps } from '../scripts/Production'
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing'
import AddProductionOrderDialog from './AddProductionOrderDialog'
import { showAlert } from '../../../store/application-store'
import { useAppDispatch } from '../../../store/hooks'
import type { ProductionOrdersClass } from '../scripts/ProductionOrders'
import {
	useAddProductionOrderMutation,
	useUpdateProductionOrderMutation,
	useDeleteProductionOrderMutation,
} from '../../../store/api/productionApi'
import { useRevalidator, useNavigate } from 'react-router'
import formatLocalDateTime from '../../../components/scripts/ComponentsInterface'

export default function ProductionOrderTable({ productionOrders, initSort, initFilter }: IProductionOrderTableProps) {
	const dispatch = useAppDispatch()
	const revalidator = useRevalidator()
	const navigate = useNavigate()
	const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>({
		type: 'include',
		ids: new Set(),
	})

	const [sortModel, setSortModel] = useState<GridSortModel>(initSort)
	const [filterModel, setFilterModel] = useState<GridFilterModel>(initFilter)

	const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false)
	const [openAddDialog, setOpenAddDialog] = useState<boolean>(false)
	const [openEditDialog, setOpenEditDialog] = useState<boolean>(false)

	const [addProductionOrder] = useAddProductionOrderMutation()
	const [updateProductionOrder] = useUpdateProductionOrderMutation()
	const [deleteProductionOrder] = useDeleteProductionOrderMutation()

	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	const productionOrderMap = useMemo(() => {
		const map = new Map()
		productionOrders.forEach(item => {
			if (item.id) map.set(item.id, item)
		})
		return map
	}, [productionOrders])

	const selectedItems = useMemo(() => {
		const selectedIds = [...rowSelectionModel.ids]
		return selectedIds.map(id => productionOrderMap.get(Number(id))).filter(Boolean) as ProductionOrdersClass[]
	}, [rowSelectionModel, productionOrderMap])

	useEffect(() => {
		localStorage.setItem('productionOrderTableSortModel', JSON.stringify(sortModel))
	}, [sortModel])

	useEffect(() => {
		localStorage.setItem('productionOrderTableFilterModel', JSON.stringify(filterModel))
	}, [filterModel])

	const clearObject = useCallback((): void => {
		setRowSelectionModel({
			type: 'include',
			ids: new Set(),
		})
	}, [])

	const addItemHandler = useCallback(
		async (item: IAddProductionOrderData | IAddProductionOrderData[], preventDialogClose?: boolean): Promise<void> => {
			try {
				if (!preventDialogClose) {
					setOpenAddDialog(false)
				}
				if (!Array.isArray(item)) {
					await addProductionOrder(item).unwrap()
				}
				dispatch(showAlert({ message: 'New production order added', severity: 'success' }))
				revalidator.revalidate()
			} catch (err: any) {
				const message = err?.data?.message || err?.message || 'Something went wrong'
				dispatch(showAlert({ message, severity: 'error' }))
			}
		},
		[addProductionOrder, dispatch, revalidator],
	)

	const editItemHandler = useCallback(
		async (items: IAddProductionOrderData | IAddProductionOrderData[]): Promise<void> => {
			try {
				setOpenEditDialog(false)
				if (Array.isArray(items) && items.length >= 1) {
					await Promise.all(
						items.map(async item => {
							await updateProductionOrder(item).unwrap()
						}),
					)
					dispatch(showAlert({ message: 'Production order edited', severity: 'success' }))
					clearObject()
					revalidator.revalidate()
				}
			} catch (err: any) {
				const message = err?.data?.message || err?.message || 'Something went wrong'
				dispatch(showAlert({ message, severity: 'error' }))
			}
		},
		[updateProductionOrder, dispatch, clearObject, revalidator],
	)

	const deleteItemHandler = useCallback(async (): Promise<void> => {
		try {
			setOpenDeleteDialog(false)
			if (selectedItems.length >= 1) {
				await Promise.all(
					selectedItems.map(async item => {
						await deleteProductionOrder({ id: item.id }).unwrap()
					}),
				)
				dispatch(showAlert({ message: 'Production order deleted', severity: 'success' }))
				revalidator.revalidate()
			}
		} catch (err: any) {
			const message = err?.data?.message || err?.message || 'Something went wrong'
			dispatch(showAlert({ message, severity: 'error' }))
		}
	}, [selectedItems, deleteProductionOrder, dispatch, revalidator])

	const handleClickAddOpen = useCallback((): void => {
		setOpenAddDialog(true)
	}, [])

	const handleClickEditOpen = useCallback((): void => {
		setOpenEditDialog(true)
	}, [])

	const handleClickDeleteOpen = useCallback((): void => {
		setOpenDeleteDialog(true)
	}, [])

	const handleCloseDelete = useCallback((): void => {
		setOpenDeleteDialog(false)
	}, [])

	const handleCloseAdd = useCallback((): void => {
		setOpenAddDialog(false)
	}, [])

	const handleCloseEdit = useCallback((): void => {
		setOpenEditDialog(false)
	}, [])

	const handleSortModelChange = useCallback((newSortModel: GridSortModel) => {
		setSortModel(newSortModel)
	}, [])

	const handleRowSelectionModelChange = useCallback((newRowSelectionModel: GridRowSelectionModel) => {
		setRowSelectionModel(newRowSelectionModel)
	}, [])

	const columns = useMemo<GridColDef[]>(
		() => [
			{ field: 'id', headerName: 'ID', width: 100 },
			{ field: 'pcb', headerName: 'PCB', width: 200, valueGetter: (_, row) => row.pcb.name ?? '-' },
			{
				field: 'quantity',
				headerName: 'Ilość',
				width: 200,
				valueGetter: (_, row) => row.quantity ?? '-',
			},
			{
				field: 'status',
				headerName: 'Status',
				width: 200,
				renderCell: params => {
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
					const s = statusMap[params.value] || { label: params.value ?? '-', color: 'default' }
					return <Chip label={s.label} color={s.color} size='small' variant='outlined' />
				},
			},
			{
				field: 'createdAt',
				headerName: 'Data utworzenia',
				width: 160,
				valueGetter: (_, row) => formatLocalDateTime(row.createdAt, false),
			},
			{
				field: 'updatedAt',
				headerName: 'Data aktualizacji',
				width: 160,
				valueGetter: (_, row) => `${formatLocalDateTime(row.updatedAt, false)}`,
			},
		],
		[],
	)

	return (
		<Box>
			<Box sx={{ mb: 3 }}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
					<Box
						sx={{
							width: 40,
							height: 40,
							borderRadius: 2,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							backgroundColor: '#fef3c7',
							color: '#d97706',
						}}>
						<PrecisionManufacturingIcon fontSize='small' />
					</Box>
					<Box>
						<Typography variant='h6' sx={{ fontWeight: 600, lineHeight: 1.2 }}>
							Zlecenia produkcyjne
						</Typography>
						<Typography variant='body2' color='text.secondary'>
							Lista wszystkich zleceń produkcyjnych
						</Typography>
					</Box>
				</Box>
			</Box>
			<Box sx={{ mt: '2rem' }}>
				<Box sx={{ mb: '1rem', textAlign: 'right' }}>
					<>
						{!isMobile ? (
							<Button variant='contained' type='button' size='medium' onClick={handleClickAddOpen}>
								Dodaj zlecenie
							</Button>
						) : (
							<IconButton type='button' size='small' color='primary' onClick={handleClickAddOpen}>
								<AddIcon />
							</IconButton>
						)}
						{openAddDialog && (
							<AddProductionOrderDialog
								edit={false}
								handleCloseAdd={handleCloseAdd}
								openAddDialog={openAddDialog}
								addItemHandler={addItemHandler}
							/>
						)}
					</>

					{selectedItems.length > 0 && (
						<>
							<>
								{!isMobile ? (
									<Button
										sx={{ ml: '0.3rem' }}
										variant='contained'
										color='info'
										type='button'
										size={isMobile ? 'small' : 'medium'}
										onClick={handleClickEditOpen}>
										Edytuj
									</Button>
								) : (
									<IconButton
										sx={{ ml: '0.3rem' }}
										color='info'
										type='button'
										size={isMobile ? 'small' : 'medium'}
										onClick={handleClickEditOpen}>
										<EditIcon />
									</IconButton>
								)}
								{openEditDialog && (
									<AddProductionOrderDialog
										edit={true}
										handleCloseAdd={handleCloseEdit}
										openAddDialog={openEditDialog}
										selectedItems={selectedItems}
										addItemHandler={editItemHandler}
									/>
								)}
							</>

							<>
								{!isMobile ? (
									<Button
										sx={{ ml: '0.3rem' }}
										variant='contained'
										color='error'
										type='button'
										size={isMobile ? 'small' : 'medium'}
										onClick={handleClickDeleteOpen}>
										Usuń
									</Button>
								) : (
									<IconButton
										sx={{ ml: '0.3rem' }}
										color='error'
										type='button'
										size={isMobile ? 'small' : 'medium'}
										onClick={handleClickDeleteOpen}>
										<DeleteIcon />
									</IconButton>
								)}
							</>

							<Dialog
								open={openDeleteDialog}
								onClose={handleCloseDelete}
								closeAfterTransition={false}
								maxWidth='xs'
								fullWidth>
								<DialogTitle sx={{ fontWeight: 600 }}>Usunąć zaznaczone elementy?</DialogTitle>
								<DialogContent>
									<DialogContentText>Zaznaczono {selectedItems.length} element(ów) do usunięcia.</DialogContentText>
								</DialogContent>
								<DialogActions sx={{ px: 3, pb: 2 }}>
									<Button size='small' onClick={handleCloseDelete}>
										Anuluj
									</Button>
									<Button variant='contained' size='small' onClick={deleteItemHandler} autoFocus color='error'>
										Usuń
									</Button>
								</DialogActions>
							</Dialog>
						</>
					)}
				</Box>
				<DataGrid
					rows={productionOrders}
					columns={columns}
					initialState={{
						pagination: { paginationModel: { page: 0, pageSize: 15 } },
						filter: {
							filterModel: {
								items: [],
								quickFilterValues: [],
							},
						},
					}}
					pageSizeOptions={[15, 30, 45]}
					checkboxSelection={true}
					disableRowSelectionOnClick={true}
					sx={{
						border: '1px solid',
						borderColor: 'divider',
						borderRadius: 2,
						width: '100%',
						'& .MuiDataGrid-columnHeaders': {
							backgroundColor: '#f8fafc',
						},
						'& .MuiDataGrid-row:hover': {
							backgroundColor: '#f1f5f9',
						},
					}}
					density='comfortable'
					disableColumnResize={true}
					disableColumnSelector={true}
					disableMultipleRowSelection={true}
					onRowSelectionModelChange={handleRowSelectionModelChange}
					showToolbar
					rowSelectionModel={rowSelectionModel}
					sortModel={sortModel}
					onSortModelChange={handleSortModelChange}
					filterModel={filterModel}
					onFilterModelChange={newFilterModel => setFilterModel(newFilterModel)}
					onRowClick={params => navigate(`/production/${params.id}`)}
				/>
			</Box>
		</Box>
	)
}
