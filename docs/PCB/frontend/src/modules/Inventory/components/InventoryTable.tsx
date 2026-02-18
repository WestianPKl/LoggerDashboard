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
import type { IAddInventoryAdditionalData, IInventoryTableProps } from '../scripts/inventories'
import InventoryIcon from '@mui/icons-material/Inventory'
import AddInventoryDialog from './AddInventoryDialog'
import { showAlert } from '../../../store/application-store'
import { useAppDispatch } from '../../../store/hooks'
import type { InventoryClass } from '../scripts/Inventory'
import {
	useAddInventoryMutation,
	useUpdateInventoryMutation,
	useDeleteInventoryMutation,
} from '../../../store/api/inventoryApi'
import { useRevalidator } from 'react-router'
import formatLocalDateTime from '../../../components/scripts/ComponentsInterface'

export default function InventoryTable({ inventory, initSort, initFilter }: IInventoryTableProps) {
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

	const [addInventory] = useAddInventoryMutation()
	const [updateInventory] = useUpdateInventoryMutation()
	const [deleteInventory] = useDeleteInventoryMutation()

	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	const inventoryMap = useMemo(() => {
		const map = new Map()
		inventory.forEach(item => {
			if (item.id) map.set(item.id, item)
		})
		return map
	}, [inventory])

	const selectedItems = useMemo(() => {
		const selectedIds = [...rowSelectionModel.ids]
		return selectedIds.map(id => inventoryMap.get(Number(id))).filter(Boolean) as InventoryClass[]
	}, [rowSelectionModel, inventoryMap])

	useEffect(() => {
		localStorage.setItem('inventoryTableSortModel', JSON.stringify(sortModel))
	}, [sortModel])

	useEffect(() => {
		localStorage.setItem('inventoryTableFilterModel', JSON.stringify(filterModel))
	}, [filterModel])

	const clearObject = useCallback((): void => {
		setRowSelectionModel({
			type: 'include',
			ids: new Set(),
		})
	}, [])

	const addItemHandler = useCallback(
		async (
			item: IAddInventoryAdditionalData | IAddInventoryAdditionalData[],
			preventDialogClose?: boolean,
		): Promise<void> => {
			try {
				if (!preventDialogClose) {
					setOpenAddDialog(false)
				}
				if (!Array.isArray(item)) {
					await addInventory(item).unwrap()
				}
				dispatch(showAlert({ message: 'New inventory  added', severity: 'success' }))
				revalidator.revalidate()
			} catch (err: any) {
				const message = err?.data?.message || err?.message || 'Something went wrong'
				dispatch(showAlert({ message, severity: 'error' }))
			}
		},
		[addInventory, dispatch, revalidator],
	)

	const editItemHandler = useCallback(
		async (items: IAddInventoryAdditionalData | IAddInventoryAdditionalData[]): Promise<void> => {
			try {
				setOpenEditDialog(false)
				if (Array.isArray(items) && items.length >= 1) {
					await Promise.all(
						items.map(async item => {
							await updateInventory(item).unwrap()
						}),
					)
					dispatch(showAlert({ message: 'Inventory  edited', severity: 'success' }))
					clearObject()
					revalidator.revalidate()
				}
			} catch (err: any) {
				const message = err?.data?.message || err?.message || 'Something went wrong'
				dispatch(showAlert({ message, severity: 'error' }))
			}
		},
		[updateInventory, dispatch, clearObject, revalidator],
	)

	const deleteItemHandler = useCallback(async (): Promise<void> => {
		try {
			setOpenDeleteDialog(false)
			if (selectedItems.length >= 1) {
				await Promise.all(
					selectedItems.map(async item => {
						await deleteInventory({ id: item.id }).unwrap()
					}),
				)
				dispatch(showAlert({ message: 'Inventory  deleted', severity: 'success' }))
				revalidator.revalidate()
			}
		} catch (err: any) {
			const message = err?.data?.message || err?.message || 'Something went wrong'
			dispatch(showAlert({ message, severity: 'error' }))
		}
	}, [selectedItems, deleteInventory, dispatch, revalidator])

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
			{ field: 'name', headerName: 'Nazwa', width: 200, valueGetter: (_, row) => row.name ?? '-' },
			{
				field: 'manufacturerNumber',
				headerName: 'Nr producenta',
				width: 200,
				valueGetter: (_, row) => row.manufacturerNumber ?? '-',
			},
			{
				field: 'parameters',
				headerName: 'Parametry',
				width: 200,
				valueGetter: (_, row) => row.parameters ?? '-',
			},
			{
				field: 'stock.quantity',
				headerName: 'Stan',
				width: 200,
				valueGetter: (_, row) => row.stock?.quantity ?? '-',
			},
			{ field: 'comment', headerName: 'Komentarz', width: 200, valueGetter: (_, row) => row.comment ?? '-' },
			{
				field: 'type.name',
				headerName: 'Typ',
				width: 200,
				valueGetter: (_, row) => row.type?.name ?? '',
			},
			{
				field: 'package.name',
				headerName: 'Obudowa',
				width: 200,
				valueGetter: (_, row) => row.package?.name ?? '-',
			},
			{
				field: 'surfaceMount.name',
				headerName: 'Montaż',
				width: 200,
				valueGetter: (_, row) => row.surfaceMount?.name ?? '-',
			},
			{
				field: 'shop.name',
				headerName: 'Sklep',
				width: 200,
				valueGetter: (_, row) => row.shop?.name ?? '-',
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
							backgroundColor: 'primary.light',
							color: 'primary.dark',
						}}>
						<InventoryIcon fontSize='small' />
					</Box>
					<Box>
						<Typography variant='h6' sx={{ fontWeight: 600, lineHeight: 1.2 }}>
							Baza komponentów
						</Typography>
						<Typography variant='body2' color='text.secondary'>
							Wszystkie zarejestrowane komponenty elektroniczne
						</Typography>
					</Box>
				</Box>
			</Box>
			<Box sx={{ mt: '2rem' }}>
				<Box sx={{ mb: '1rem', textAlign: 'right' }}>
					<>
						{!isMobile ? (
							<Button variant='contained' type='button' size='medium' onClick={handleClickAddOpen}>
							Dodaj komponent
							</Button>
						) : (
							<IconButton type='button' size='small' color='primary' onClick={handleClickAddOpen}>
								<AddIcon />
							</IconButton>
						)}
						{openAddDialog && (
							<AddInventoryDialog
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
									<AddInventoryDialog
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

							<Dialog open={openDeleteDialog} onClose={handleCloseDelete} closeAfterTransition={false} maxWidth='xs' fullWidth>
								<DialogTitle sx={{ fontWeight: 600 }}>Usunąć zaznaczone elementy?</DialogTitle>
								<DialogContent>
									<DialogContentText>Zaznaczono {selectedItems.length} element(ów) do usunięcia.</DialogContentText>
								</DialogContent>
								<DialogActions sx={{ px: 3, pb: 2 }}>
									<Button size='small' onClick={handleCloseDelete}>
										Anuluj
									</Button>
									<Button
										variant='contained'
										size='small'
										onClick={deleteItemHandler}
										autoFocus
										color='error'>
										Usuń
									</Button>
								</DialogActions>
							</Dialog>
						</>
					)}
				</Box>
				<DataGrid
					rows={inventory}
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
