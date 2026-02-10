import { useState, useMemo, useEffect, useCallback } from 'react'
import {
	Box,
	Typography,
	Icon,
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
import type { IAddInventoryAdditionalData, IInventoryTypeTableProps } from '../scripts/inventories'
import MergeTypeIcon from '@mui/icons-material/MergeType'
import AddInventoryTypeDialog from './AddInventoryTypeDialog'
import { showAlert } from '../../../store/application-store'
import { useAppDispatch } from '../../../store/hooks'
import type { InventoryTypeClass } from '../scripts/InventoryType'
import {
	useAddInventoryTypeMutation,
	useUpdateInventoryTypeMutation,
	useDeleteInventoryTypeMutation,
} from '../../../store/api/inventoryApi'
import { useRevalidator } from 'react-router'
import type { GridFilterModel } from '@mui/x-data-grid'

export default function InventoryTypeTable({ inventoryType, initSort, initFilter }: IInventoryTypeTableProps) {
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

	const [addInventoryType] = useAddInventoryTypeMutation()
	const [updateInventoryType] = useUpdateInventoryTypeMutation()
	const [deleteInventoryType] = useDeleteInventoryTypeMutation()

	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	const inventoryTypeMap = useMemo(() => {
		const map = new Map()
		inventoryType.forEach(item => {
			if (item.id) map.set(item.id, item)
		})
		return map
	}, [inventoryType])

	const selectedItems = useMemo(() => {
		const selectedIds = [...rowSelectionModel.ids]
		return selectedIds.map(id => inventoryTypeMap.get(Number(id))).filter(Boolean) as InventoryTypeClass[]
	}, [rowSelectionModel, inventoryTypeMap])

	useEffect(() => {
		localStorage.setItem('inventoryTableTypeSortModel', JSON.stringify(sortModel))
	}, [sortModel])

	useEffect(() => {
		localStorage.setItem('inventoryTableTypeFilterModel', JSON.stringify(filterModel))
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
				await addInventoryType(item).unwrap()
			}
			dispatch(showAlert({ message: 'New inventory Type added', severity: 'success' }))
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
						await updateInventoryType(item).unwrap()
					}),
				)
				dispatch(showAlert({ message: 'Inventory Type edited', severity: 'success' }))
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
						await deleteInventoryType({ id: item.id }).unwrap()
					}),
				)
				dispatch(showAlert({ message: 'Inventory Type deleted', severity: 'success' }))
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
		<Box sx={{ textAlign: 'center' }}>
			<Box sx={{ textAlign: 'left' }}>
				<Box sx={{ display: 'flex' }}>
					<Icon sx={{ mr: '0.5rem' }}>
						<MergeTypeIcon />
					</Icon>
					<Typography variant='h6' component='p'>
						Inventory Types database
					</Typography>
				</Box>
				<Typography component='span'>Your database containing all the inventory Types you have registered.</Typography>
			</Box>
			<Box sx={{ mt: '2rem' }}>
				<Box sx={{ mb: '1rem', textAlign: 'right' }}>
					<>
						{!isMobile ? (
							<Button variant='contained' type='button' size='medium' onClick={handleClickAddOpen}>
								Add new inventory Type
							</Button>
						) : (
							<IconButton type='button' size='small' color='primary' onClick={handleClickAddOpen}>
								<AddIcon />
							</IconButton>
						)}
						<AddInventoryTypeDialog
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
										Edit
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
								<AddInventoryTypeDialog
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
										Delete
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

							<Dialog open={openDeleteDialog} onClose={handleCloseDelete} closeAfterTransition={false}>
								<DialogTitle>Do you want to delete selected item(s)?</DialogTitle>
								<DialogContent>
									<DialogContentText>You have selected {selectedItems.length} item(s) to delete.</DialogContentText>
								</DialogContent>
								<DialogActions>
									<Button variant='outlined' size={isMobile ? 'small' : 'medium'} onClick={handleCloseDelete}>
										Cancel
									</Button>
									<Button
										variant='outlined'
										size={isMobile ? 'small' : 'medium'}
										onClick={deleteItemHandler}
										autoFocus
										color='error'>
										Delete
									</Button>
								</DialogActions>
							</Dialog>
						</>
					)}
				</Box>
				<DataGrid
					rows={inventoryType}
					columns={useMemo<GridColDef[]>(
						() => [
							{ field: 'id', headerName: 'ID', width: 100 },
							{ field: 'name', headerName: 'Name', width: 360 },
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
					sx={{ border: 0, width: '100%' }}
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
