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
import type { IAddProductionOrderItemsData, IProductionOrderItemsTableProps } from '../scripts/Production'
import ListAltIcon from '@mui/icons-material/ListAlt'
import AddProductionOrderItemDialog from './AddProductionOrderItemDialog'
import { showAlert } from '../../../store/application-store'
import { useAppDispatch } from '../../../store/hooks'
import type { ProductionOrderItemsClass } from '../scripts/ProductionOrderItems'
import {
	useAddProductionOrderItemMutation,
	useUpdateProductionOrderItemMutation,
	useDeleteProductionOrderItemMutation,
} from '../../../store/api/productionApi'
import { useRevalidator } from 'react-router'

export default function ProductionOrderItemsTable({
	productionOrderId,
	productionOrderItems,
	initSort,
	initFilter,
}: IProductionOrderItemsTableProps & { productionOrderId: number }) {
	const dispatch = useAppDispatch()
	const revalidator = useRevalidator()
	const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>({
		type: 'include',
		ids: new Set(),
	})

	const [sortModel, setSortModel] = useState<GridSortModel>(initSort)
	const [filterModel, setFilterModel] = useState<GridFilterModel>(initFilter)

	const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false)
	const [openAddDialog, setOpenAddDialog] = useState<boolean>(false)
	const [openEditDialog, setOpenEditDialog] = useState<boolean>(false)

	const [addProductionOrderItem] = useAddProductionOrderItemMutation()
	const [updateProductionOrderItem] = useUpdateProductionOrderItemMutation()
	const [deleteProductionOrderItem] = useDeleteProductionOrderItemMutation()

	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	const itemsMap = useMemo(() => {
		const map = new Map()
		productionOrderItems.forEach(item => {
			if (item.id) map.set(item.id, item)
		})
		return map
	}, [productionOrderItems])

	const selectedItems = useMemo(() => {
		const selectedIds = [...rowSelectionModel.ids]
		return selectedIds.map(id => itemsMap.get(Number(id))).filter(Boolean) as ProductionOrderItemsClass[]
	}, [rowSelectionModel, itemsMap])

	useEffect(() => {
		localStorage.setItem('productionOrderItemsTableSortModel', JSON.stringify(sortModel))
	}, [sortModel])

	useEffect(() => {
		localStorage.setItem('productionOrderItemsTableFilterModel', JSON.stringify(filterModel))
	}, [filterModel])

	const clearObject = useCallback((): void => {
		setRowSelectionModel({
			type: 'include',
			ids: new Set(),
		})
	}, [])

	async function addItemHandler(item: IAddProductionOrderItemsData | IAddProductionOrderItemsData[]): Promise<void> {
		try {
			setOpenAddDialog(false)
			if (!Array.isArray(item)) {
				await addProductionOrderItem(item).unwrap()
			}
			dispatch(showAlert({ message: 'Pozycja zlecenia dodana', severity: 'success' }))
			revalidator.revalidate()
		} catch (err: any) {
			const message = err?.data?.message || err?.message || 'Coś poszło nie tak'
			dispatch(showAlert({ message, severity: 'error' }))
		}
	}

	async function editItemHandler(items: IAddProductionOrderItemsData | IAddProductionOrderItemsData[]): Promise<void> {
		try {
			setOpenEditDialog(false)
			if (Array.isArray(items) && items.length >= 1) {
				await Promise.all(
					items.map(async item => {
						await updateProductionOrderItem(item).unwrap()
					}),
				)
				dispatch(showAlert({ message: 'Pozycja zlecenia zaktualizowana', severity: 'success' }))
				clearObject()
				revalidator.revalidate()
			}
		} catch (err: any) {
			const message = err?.data?.message || err?.message || 'Coś poszło nie tak'
			dispatch(showAlert({ message, severity: 'error' }))
		}
	}

	const deleteItemHandler = useCallback(async (): Promise<void> => {
		try {
			setOpenDeleteDialog(false)
			if (selectedItems.length >= 1) {
				await Promise.all(
					selectedItems.map(async item => {
						await deleteProductionOrderItem({ id: item.id }).unwrap()
					}),
				)
				dispatch(showAlert({ message: 'Pozycja zlecenia usunięta', severity: 'success' }))
				revalidator.revalidate()
			}
		} catch (err: any) {
			const message = err?.data?.message || err?.message || 'Coś poszło nie tak'
			dispatch(showAlert({ message, severity: 'error' }))
		}
	}, [selectedItems, deleteProductionOrderItem, dispatch, revalidator])

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

	const statusChip = (value: string | undefined) => {
		const map: Record<string, { label: string; color: 'success' | 'warning' | 'error' }> = {
			ok: { label: 'OK', color: 'success' },
			low: { label: 'Niski stan', color: 'warning' },
			missing: { label: 'Brak', color: 'error' },
		}
		const s = map[value ?? ''] || { label: value ?? '-', color: 'default' as any }
		return <Chip label={s.label} color={s.color} size='small' variant='outlined' />
	}

	const columns = useMemo<GridColDef[]>(
		() => [
			{ field: 'id', headerName: 'ID', width: 80 },
			{
				field: 'inventory',
				headerName: 'Komponent',
				width: 200,
				valueGetter: (_, row) => row.inventory?.name ?? '-',
			},
			{
				field: 'inventoryManufacturer',
				headerName: 'Nr producenta',
				width: 180,
				valueGetter: (_, row) => row.inventory?.manufacturerNumber ?? '-',
			},
			{
				field: 'qtyPerBoard',
				headerName: 'Ilość/płytkę',
				width: 120,
				valueGetter: (_, row) => row.qtyPerBoard ?? '-',
			},
			{
				field: 'requiredQtyTotal',
				headerName: 'Wymagana łącznie',
				width: 150,
				valueGetter: (_, row) => row.requiredQtyTotal ?? '-',
			},
			{
				field: 'consumedQty',
				headerName: 'Zużyto',
				width: 100,
				valueGetter: (_, row) => row.consumedQty ?? '-',
			},
			{
				field: 'designators',
				headerName: 'Oznaczenia',
				width: 180,
				valueGetter: (_, row) => row.designators ?? '-',
			},
			{
				field: 'allowSubstitutes',
				headerName: 'Zamienniki',
				width: 120,
				valueGetter: (_, row) => (row.allowSubstitutes ? 'Tak' : 'Nie'),
			},
			{
				field: 'status',
				headerName: 'Status',
				width: 130,
				renderCell: params => statusChip(params.value),
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
							backgroundColor: '#e0e7ff',
							color: '#4338ca',
						}}>
						<ListAltIcon fontSize='small' />
					</Box>
					<Box>
						<Typography variant='h6' sx={{ fontWeight: 600, lineHeight: 1.2 }}>
							Pozycje zlecenia
						</Typography>
						<Typography variant='body2' color='text.secondary'>
							Komponenty wymagane do realizacji zlecenia
						</Typography>
					</Box>
				</Box>
			</Box>
			<Box sx={{ mt: '2rem' }}>
				<Box sx={{ mb: '1rem', textAlign: 'right' }}>
					<>
						{!isMobile ? (
							<Button variant='contained' type='button' size='medium' onClick={handleClickAddOpen}>
								Dodaj pozycję
							</Button>
						) : (
							<IconButton type='button' size='small' color='primary' onClick={handleClickAddOpen}>
								<AddIcon />
							</IconButton>
						)}
						{openAddDialog && (
							<AddProductionOrderItemDialog
								edit={false}
								productionOrderId={productionOrderId}
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
									<AddProductionOrderItemDialog
										edit={true}
										productionOrderId={productionOrderId}
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
					rows={productionOrderItems}
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
				/>
			</Box>
		</Box>
	)
}
