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
import { DataGrid, type GridColDef, type GridRowSelectionModel, type GridSortModel } from '@mui/x-data-grid'
import type { IAddInventoryAdditionalData, IInventoryPackageTableProps } from '../scripts/inventories'
import ExpandIcon from '@mui/icons-material/Expand'
import AddInventoryPackageDialog from './AddInventoryPackageDialog'
import { showAlert } from '../../../store/application-store'
import { useAppDispatch } from '../../../store/hooks'
import type { InventoryPackageClass } from '../scripts/InventoryPackage'
import {
	useAddInventoryPackageMutation,
	useUpdateInventoryPackageMutation,
	useDeleteInventoryPackageMutation,
} from '../../../store/api/inventoryApi'
import { useRevalidator } from 'react-router'
import type { GridFilterModel } from '@mui/x-data-grid'

export default function InventoryPackageTable({ inventoryPackage, initSort, initFilter }: IInventoryPackageTableProps) {
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

	const [addInventoryPackage] = useAddInventoryPackageMutation()
	const [updateInventoryPackage] = useUpdateInventoryPackageMutation()
	const [deleteInventoryPackage] = useDeleteInventoryPackageMutation()

	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	const inventoryPackageMap = useMemo(() => {
		const map = new Map()
		inventoryPackage.forEach(item => {
			if (item.id) map.set(item.id, item)
		})
		return map
	}, [inventoryPackage])

	const selectedItems = useMemo(() => {
		const selectedIds = [...rowSelectionModel.ids]
		return selectedIds.map(id => inventoryPackageMap.get(Number(id))).filter(Boolean) as InventoryPackageClass[]
	}, [rowSelectionModel, inventoryPackageMap])

	useEffect(() => {
		localStorage.setItem('inventoryTablePackageSortModel', JSON.stringify(sortModel))
	}, [sortModel])

	useEffect(() => {
		localStorage.setItem('inventoryTablePackageFilterModel', JSON.stringify(filterModel))
	}, [filterModel])

	function clearObject(): void {
		setRowSelectionModel({
			type: 'include',
			ids: new Set(),
		})
	}

	async function addItemHandler(item: IAddInventoryAdditionalData | IAddInventoryAdditionalData[]): Promise<void> {
		try {
			setOpenAddDialog(false)
			if (!Array.isArray(item)) {
				await addInventoryPackage(item).unwrap()
			}
			dispatch(showAlert({ message: 'New inventory package added', severity: 'success' }))
			revalidator.revalidate()
		} catch (err: any) {
			const message = err?.data?.message || err?.message || 'Something went wrong'
			dispatch(showAlert({ message, severity: 'error' }))
		}
	}

	async function editItemHandler(items: IAddInventoryAdditionalData | IAddInventoryAdditionalData[]): Promise<void> {
		try {
			setOpenEditDialog(false)
			if (Array.isArray(items) && items.length >= 1) {
				await Promise.all(
					items.map(async item => {
						await updateInventoryPackage(item).unwrap()
					}),
				)
				dispatch(showAlert({ message: 'Inventory package edited', severity: 'success' }))
				clearObject()
				revalidator.revalidate()
			}
		} catch (err: any) {
			const message = err?.data?.message || err?.message || 'Something went wrong'
			dispatch(showAlert({ message, severity: 'error' }))
		}
	}

	async function deleteItemHandler(): Promise<void> {
		try {
			setOpenDeleteDialog(false)
			if (selectedItems.length >= 1) {
				await Promise.all(
					selectedItems.map(async item => {
						await deleteInventoryPackage({ id: item.id }).unwrap()
					}),
				)
				dispatch(showAlert({ message: 'Inventory package deleted', severity: 'success' }))
				revalidator.revalidate()
			}
		} catch (err: any) {
			const message = err?.data?.message || err?.message || 'Something went wrong'
			dispatch(showAlert({ message, severity: 'error' }))
		}
	}

	function handleClickAddOpen(): void {
		setOpenAddDialog(true)
	}

	function handleClickEditOpen(): void {
		setOpenEditDialog(true)
	}

	function handleClickDeleteOpen(): void {
		setOpenDeleteDialog(true)
	}

	function handleCloseDelete(): void {
		setOpenDeleteDialog(false)
	}

	function handleCloseAdd(): void {
		setOpenAddDialog(false)
	}

	function handleCloseEdit(): void {
		setOpenEditDialog(false)
	}

	const handleSortModelChange = useCallback((newSortModel: GridSortModel) => {
		setSortModel(newSortModel)
	}, [])

	const handleRowSelectionModelChange = useCallback((newRowSelectionModel: GridRowSelectionModel) => {
		setRowSelectionModel(newRowSelectionModel)
	}, [])

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
							backgroundColor: '#dcfce7',
							color: '#16a34a',
						}}>
						<ExpandIcon fontSize='small' />
					</Box>
					<Box>
						<Typography variant='h6' sx={{ fontWeight: 600, lineHeight: 1.2 }}>
							Obudowy komponentów
						</Typography>
						<Typography variant='body2' color='text.secondary'>
							Wszystkie zarejestrowane obudowy
						</Typography>
					</Box>
				</Box>
			</Box>
			<Box sx={{ mt: '2rem' }}>
				<Box sx={{ mb: '1rem', textAlign: 'right' }}>
					<>
						{!isMobile ? (
							<Button variant='contained' type='button' size='medium' onClick={handleClickAddOpen}>
								Dodaj obudowę
							</Button>
						) : (
							<IconButton type='button' size='small' color='primary' onClick={handleClickAddOpen}>
								<AddIcon />
							</IconButton>
						)}
						<AddInventoryPackageDialog
							edit={false}
							handleCloseAdd={handleCloseAdd}
							openAddDialog={openAddDialog}
							addItemHandler={addItemHandler}
						/>
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
								<AddInventoryPackageDialog
									edit={true}
									handleCloseAdd={handleCloseEdit}
									openAddDialog={openEditDialog}
									selectedItems={selectedItems}
									addItemHandler={editItemHandler}
								/>
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
					rows={inventoryPackage}
					columns={useMemo<GridColDef[]>(
						() => [
							{ field: 'id', headerName: 'ID', width: 100 },
							{ field: 'name', headerName: 'Nazwa', width: 360 },
						],
						[],
					)}
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
