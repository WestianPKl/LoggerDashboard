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
	type GridEventListener,
	type GridFilterModel,
	type GridRowSelectionModel,
	type GridSortModel,
} from '@mui/x-data-grid'
import type { IAddPCBData, IPCBTableProps } from '../scripts/PCBs'
import DeveloperBoardIcon from '@mui/icons-material/DeveloperBoardOutlined'
import AddPCBDialog from './AddPCBDialog'
import { showAlert } from '../../../store/application-store'
import { useAppDispatch } from '../../../store/hooks'
import type { PCBClass } from '../scripts/PCB'
import { useAddPCBMutation, useUpdatePCBMutation, useDeletePCBMutation } from '../../../store/api/pcbApi'
import { useRevalidator, useNavigate } from 'react-router'
import formatLocalDateTime from '../../../components/scripts/ComponentsInterface'

export default function PCBTable({ pcb, initSort, initFilter }: IPCBTableProps) {
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

	const [addPCB] = useAddPCBMutation()
	const [updatePCB] = useUpdatePCBMutation()
	const [deletePCB] = useDeletePCBMutation()

	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	const pcbMap = useMemo(() => {
		const map = new Map()
		pcb.forEach(item => {
			if (item.id) map.set(item.id, item)
		})
		return map
	}, [pcb])

	const selectedItems = useMemo(() => {
		const selectedIds = [...rowSelectionModel.ids]
		return selectedIds.map(id => pcbMap.get(Number(id))).filter(Boolean) as PCBClass[]
	}, [rowSelectionModel, pcbMap])

	useEffect(() => {
		localStorage.setItem('pcbTableSortModel', JSON.stringify(sortModel))
	}, [sortModel])

	useEffect(() => {
		localStorage.setItem('pcbTableFilterModel', JSON.stringify(filterModel))
	}, [filterModel])

	const clearObject = useCallback((): void => {
		setRowSelectionModel({
			type: 'include',
			ids: new Set(),
		})
	}, [])

	const addItemHandler = useCallback(
		async (item: IAddPCBData | IAddPCBData[]): Promise<void> => {
			try {
				setOpenAddDialog(false)

				if (!Array.isArray(item)) {
					const formData = new FormData()

					formData.append('name', item.name || '')
					formData.append('revision', item.revision || '')
					formData.append('comment', item.comment || '')
					if (item.topUrl instanceof File) formData.append('topUrl', item.topUrl)
					if (item.bottomUrl instanceof File) formData.append('bottomUrl', item.bottomUrl)

					await addPCB(formData).unwrap()
				}
				dispatch(showAlert({ message: 'New PCB  added', severity: 'success' }))
				revalidator.revalidate()
			} catch (err: any) {
				const message = err?.data?.message || err?.message || 'Something went wrong'
				dispatch(showAlert({ message, severity: 'error' }))
			}
		},
		[addPCB, dispatch, revalidator],
	)

	const editItemHandler = useCallback(
		async (items: IAddPCBData | IAddPCBData[]): Promise<void> => {
			try {
				setOpenEditDialog(false)
				if (Array.isArray(items) && items.length >= 1) {
					await Promise.all(
						items.map(async item => {
							const formData = new FormData()

							formData.append('name', item.name || '')
							formData.append('revision', item.revision || '')
							formData.append('comment', item.comment || '')
							if (item.topUrl instanceof File) formData.append('topUrl', item.topUrl)
							if (item.bottomUrl instanceof File) formData.append('bottomUrl', item.bottomUrl)

							await updatePCB({ body: formData, id: item.id }).unwrap()
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
		},
		[updatePCB, dispatch, clearObject, revalidator],
	)

	const deleteItemHandler = useCallback(async (): Promise<void> => {
		try {
			setOpenDeleteDialog(false)
			if (selectedItems.length >= 1) {
				await Promise.all(
					selectedItems.map(async item => {
						await deletePCB({ id: item.id }).unwrap()
					}),
				)
				dispatch(showAlert({ message: 'PCB  deleted', severity: 'success' }))
				revalidator.revalidate()
			}
		} catch (err: any) {
			const message = err?.data?.message || err?.message || 'Something went wrong'
			dispatch(showAlert({ message, severity: 'error' }))
		}
	}, [selectedItems, deletePCB, dispatch, revalidator])

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

	const handleRowClick: GridEventListener<'rowClick'> = params => {
		navigate(`/pcb/${params.id}`)
	}

	const columns = useMemo<GridColDef[]>(
		() => [
			{ field: 'id', headerName: 'ID', width: 100 },
			{ field: 'name', headerName: 'Nazwa', width: 200, valueGetter: (_, row) => row.name ?? '-' },
			{
				field: 'revision',
				headerName: 'Rewizja',
				width: 200,
				valueGetter: (_, row) => row.revision ?? '-',
			},
			{ field: 'comment', headerName: 'Komentarz', width: 300, valueGetter: (_, row) => row.comment ?? '-' },
			{
				field: 'verified',
				headerName: 'Zweryfikowany',
				width: 160,
				valueGetter: (_, row) => (row.verified ? 'Tak' : 'Nie'),
			},
			{ field: 'topUrl', headerName: 'Obraz góra', width: 150, valueGetter: (_, row) => (row.topUrl ? 'Tak' : 'Nie') },
			{
				field: 'bottomUrl',
				headerName: 'Obraz dół',
				width: 150,
				valueGetter: (_, row) => (row.bottomUrl ? 'Tak' : 'Nie'),
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
							backgroundColor: '#dcfce7',
							color: '#16a34a',
						}}>
						<DeveloperBoardIcon fontSize='small' />
					</Box>
					<Box>
						<Typography variant='h6' sx={{ fontWeight: 600, lineHeight: 1.2 }}>
							Baza PCB
						</Typography>
						<Typography variant='body2' color='text.secondary'>
							Wszystkie zarejestrowane płytki PCB
						</Typography>
					</Box>
				</Box>
			</Box>
			<Box sx={{ mt: '2rem' }}>
				<Box sx={{ mb: '1rem', textAlign: 'right' }}>
					<>
						{!isMobile ? (
							<Button variant='contained' type='button' size='medium' onClick={handleClickAddOpen}>
								Dodaj PCB
							</Button>
						) : (
							<IconButton type='button' size='small' color='primary' onClick={handleClickAddOpen}>
								<AddIcon />
							</IconButton>
						)}
						{openAddDialog && (
							<AddPCBDialog
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
									<AddPCBDialog
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
					rows={pcb}
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
						'& .MuiDataGrid-row': {
							cursor: 'pointer',
						},
					}}
					density='comfortable'
					disableColumnResize={true}
					disableColumnSelector={true}
					disableMultipleRowSelection={true}
					onRowSelectionModelChange={handleRowSelectionModelChange}
					showToolbar
					onRowClick={handleRowClick}
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
