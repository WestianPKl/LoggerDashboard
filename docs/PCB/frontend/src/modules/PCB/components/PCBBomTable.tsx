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
import type { IAddPCBBomItemsData, IPCBBomTableProps } from '../scripts/PCBs'
import MediationIcon from '@mui/icons-material/Mediation'
import AddPCBBomDialog from './AddPCBBomDialog'
import { showAlert } from '../../../store/application-store'
import { useAppDispatch } from '../../../store/hooks'
import type { PCBBomItemsClass } from '../scripts/PCBBomItems'
import {
	useAddPCBBomItemMutation,
	useUpdatePCBBomItemMutation,
	useDeletePCBBomItemMutation,
} from '../../../store/api/pcbApi'
import { useRevalidator } from 'react-router'

export default function PCBBomTable({ pcbId, pcbBomItems, initSort, initFilter }: IPCBBomTableProps) {
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

	const [addPCBBomItem] = useAddPCBBomItemMutation()
	const [updatePCBBomItem] = useUpdatePCBBomItemMutation()
	const [deletePCBBomItem] = useDeletePCBBomItemMutation()

	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	const pcbBomItemsMap = useMemo(() => {
		const map = new Map()
		pcbBomItems.forEach(item => {
			if (item.id) map.set(item.id, item)
		})
		return map
	}, [pcbBomItems])

	const selectedItems = useMemo(() => {
		const selectedIds = [...rowSelectionModel.ids]
		return selectedIds.map(id => pcbBomItemsMap.get(Number(id))).filter(Boolean) as PCBBomItemsClass[]
	}, [rowSelectionModel, pcbBomItemsMap])

	useEffect(() => {
		localStorage.setItem('pcbBomTableSortModel', JSON.stringify(sortModel))
	}, [sortModel])

	useEffect(() => {
		localStorage.setItem('pcbBomTableFilterModel', JSON.stringify(filterModel))
	}, [filterModel])

	const clearObject = useCallback((): void => {
		setRowSelectionModel({
			type: 'include',
			ids: new Set(),
		})
	}, [])

	async function addItemHandler(item: IAddPCBBomItemsData | IAddPCBBomItemsData[]): Promise<void> {
		try {
			setOpenAddDialog(false)
			if (!Array.isArray(item)) {
				await addPCBBomItem(item).unwrap()
			}
			dispatch(showAlert({ message: 'New PCB  added', severity: 'success' }))
			revalidator.revalidate()
		} catch (err: any) {
			const message = err?.data?.message || err?.message || 'Something went wrong'
			dispatch(showAlert({ message, severity: 'error' }))
		}
	}

	async function editItemHandler(items: IAddPCBBomItemsData | IAddPCBBomItemsData[]): Promise<void> {
		try {
			setOpenEditDialog(false)
			if (Array.isArray(items) && items.length >= 1) {
				await Promise.all(
					items.map(async item => {
						await updatePCBBomItem(item).unwrap()
					}),
				)
				dispatch(showAlert({ message: 'PCB  edited', severity: 'success' }))
				clearObject()
				revalidator.revalidate()
			}
		} catch (err: any) {
			const message = err?.data?.message || err?.message || 'Something went wrong'
			dispatch(showAlert({ message, severity: 'error' }))
		}
	}

	const deleteItemHandler = useCallback(async (): Promise<void> => {
		try {
			setOpenDeleteDialog(false)
			if (selectedItems.length >= 1) {
				await Promise.all(
					selectedItems.map(async item => {
						await deletePCBBomItem({ id: item.id }).unwrap()
					}),
				)
				dispatch(showAlert({ message: 'PCB  deleted', severity: 'success' }))
				revalidator.revalidate()
			}
		} catch (err: any) {
			const message = err?.data?.message || err?.message || 'Something went wrong'
			dispatch(showAlert({ message, severity: 'error' }))
		}
	}, [selectedItems, deletePCBBomItem, dispatch, revalidator])

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
			{ field: 'inventory', headerName: 'Inventory', width: 200, valueGetter: (_, row) => row.inventory?.name ?? '-' },
			{
				field: 'inventoryManufacturer',
				headerName: 'Inventory manufacturer',
				width: 200,
				valueGetter: (_, row) => row.inventory?.manufacturerNumber ?? '-',
			},
			{
				field: 'inventoryPackage',
				headerName: 'Inventory package',
				width: 200,
				valueGetter: (_, row) => row.inventory?.package.name ?? '-',
			},
			{
				field: 'inventorySurfaceMount',
				headerName: 'Inventory surface mount',
				width: 200,
				valueGetter: (_, row) => row.inventory?.surfaceMount.name ?? '-',
			},
			{
				field: 'qtyPerBoard',
				headerName: 'Quantity per Board',
				width: 200,
				valueGetter: (_, row) => row.qtyPerBoard ?? '-',
			},
			{
				field: 'designators',
				headerName: 'Designators',
				width: 200,
				valueGetter: (_, row) => row.designators ?? '-',
			},
			{ field: 'valueSpec', headerName: 'Value Spec', width: 200, valueGetter: (_, row) => row.valueSpec ?? '-' },
			{
				field: 'allowSubstitution',
				headerName: 'Allow substitution',
				width: 150,
				valueGetter: (_, row) => (row.allowSubstitution ? 'Yes' : 'No'),
			},
			{ field: 'comment', headerName: 'Comment', width: 300, valueGetter: (_, row) => row.comment ?? '-' },
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
							backgroundColor: '#ede9fe',
							color: '#7c3aed',
						}}>
						<MediationIcon fontSize='small' />
					</Box>
					<Box>
						<Typography variant='h6' sx={{ fontWeight: 600, lineHeight: 1.2 }}>
							BOM - lista materiałowa
						</Typography>
						<Typography variant='body2' color='text.secondary'>
							Komponenty wymagane do montażu PCB
						</Typography>
					</Box>
				</Box>
			</Box>
			<Box sx={{ mt: '2rem' }}>
				<Box sx={{ mb: '1rem', textAlign: 'right' }}>
					<>
						{!isMobile ? (
							<Button variant='contained' type='button' size='medium' onClick={handleClickAddOpen}>
								Dodaj pozycję BOM
							</Button>
						) : (
							<IconButton type='button' size='small' color='primary' onClick={handleClickAddOpen}>
								<AddIcon />
							</IconButton>
						)}
						{openAddDialog && (
							<AddPCBBomDialog
								edit={false}
								pcbId={pcbId}
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
									<AddPCBBomDialog
										edit={true}
										pcbId={pcbId}
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
					rows={pcbBomItems}
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
