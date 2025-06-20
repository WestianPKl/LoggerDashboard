import { useState, useEffect, useMemo } from 'react'
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
import { DataGrid, type GridColDef, type GridRowSelectionModel } from '@mui/x-data-grid'
import type { IAddHouseFloorData, IHouseFloorTableProps } from '../scripts/IHouse'
import HouseSidingIcon from '@mui/icons-material/HouseSiding'
import type { HouseFloorClass } from '../scripts/HouseFloorClass'
import AddHouseFloorDialog from './AddHouseFloorDialog'
import { showAlert } from '../../../store/application-store'
import { canWrite, canDelete } from '../../../store/auth-actions'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import {
	useAddHouseFloorMutation,
	useUpdateHouseFloorMutation,
	useDeleteHouseFloorMutation,
} from '../../../store/api/houseApi'
import { useRevalidator } from 'react-router'

export default function HouseFloorTable({ houseFloors }: IHouseFloorTableProps) {
	const dispatch = useAppDispatch()
	const revalidator = useRevalidator()

	const [selectedItems, setSelectedItems] = useState<HouseFloorClass[]>([])
	const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>({
		type: 'include',
		ids: new Set(),
	})
	const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false)
	const [openAddDialog, setOpenAddDialog] = useState<boolean>(false)
	const [openEditDialog, setOpenEditDialog] = useState<boolean>(false)

	const isWritable = useAppSelector(state => canWrite('house', 'houseFloor')(state))
	const isDeletable = useAppSelector(state => canDelete('house', 'houseFloor')(state))

	const [addHouseFloor] = useAddHouseFloorMutation()
	const [updateHouseFloor] = useUpdateHouseFloorMutation()
	const [deleteHouseFloor] = useDeleteHouseFloorMutation()

	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	const columns = useMemo<GridColDef[]>(
		() => [
			{ field: 'id', headerName: 'ID', width: 100 },
			{ field: 'name', headerName: 'Name', width: 350 },
			{ field: 'layout', headerName: 'Layout', width: 350 },
			{
				field: 'house.name',
				headerName: 'House name',
				width: 300,
				valueGetter: (_, row) => `${row.house.name}`,
			},
		],
		[]
	)

	const houseFloorsMap = useMemo(() => {
		const map = new Map()
		houseFloors.forEach(item => {
			if (item.id) map.set(item.id, item)
		})
		return map
	}, [houseFloors])

	useEffect(() => {
		const selectedIds = [...rowSelectionModel.ids]
		setSelectedItems(selectedIds.map(id => houseFloorsMap.get(Number(id))).filter(Boolean))
	}, [rowSelectionModel, houseFloorsMap])

	function clearObject() {
		setSelectedItems([])
		setRowSelectionModel({
			type: 'include',
			ids: new Set(),
		})
	}

	async function addItemHandler(item: IAddHouseFloorData | IAddHouseFloorData[]) {
		try {
			setOpenAddDialog(false)
			if (!Array.isArray(item)) {
				const formData = new FormData()
				if (item.name) {
					formData.append('name', item.name)
				}
				if (item.houseId) {
					formData.append('houseId', `${item.houseId}`)
				}
				if (item.layout) {
					formData.append('layout', item.layout)
				}
				await addHouseFloor(formData).unwrap()
			}
			dispatch(showAlert({ message: 'New house floor added', severity: 'success' }))
			revalidator.revalidate()
		} catch (err: any) {
			const message = err?.data?.message || err?.message || 'Something went wrong'
			dispatch(showAlert({ message, severity: 'error' }))
		}
	}

	async function editItemHandler(items: IAddHouseFloorData | IAddHouseFloorData[]) {
		try {
			setOpenEditDialog(false)
			if (Array.isArray(items) && items.length >= 1) {
				await Promise.all(
					items.map(async item => {
						const formData = new FormData()
						if (item.name) {
							formData.append('name', item.name)
						}
						if (item.houseId) {
							formData.append('houseId', `${item.houseId}`)
						}
						if (item.layout) {
							formData.append('layout', item.layout)
						}
						if (item.id) {
							await updateHouseFloor({ body: formData, id: item.id }).unwrap()
						}
					})
				)
				revalidator.revalidate()
				dispatch(showAlert({ message: 'House floor edited', severity: 'success' }))
				clearObject()
			}
		} catch (err: any) {
			const message = err?.data?.message || err?.message || 'Something went wrong'
			dispatch(showAlert({ message, severity: 'error' }))
		}
	}

	async function deleteItemHandler() {
		try {
			setOpenDeleteDialog(false)
			if (selectedItems.length >= 1) {
				await Promise.all(
					selectedItems.map(async item => {
						await deleteHouseFloor({ id: item.id }).unwrap()
					})
				)
				revalidator.revalidate()
				dispatch(showAlert({ message: 'House floor deleted', severity: 'success' }))
			}
		} catch (err: any) {
			const message = err?.data?.message || err?.message || 'Something went wrong'
			dispatch(showAlert({ message, severity: 'error' }))
		}
	}

	function handleClickAddOpen() {
		setOpenAddDialog(true)
	}

	function handleClickEditOpen() {
		setOpenEditDialog(true)
	}

	function handleClickDeleteOpen() {
		setOpenDeleteDialog(true)
	}

	function handleCloseDelete() {
		setOpenDeleteDialog(false)
	}

	function handleCloseAdd() {
		setOpenAddDialog(false)
	}

	function handleCloseEdit() {
		setOpenEditDialog(false)
	}

	const paginationModel = { page: 0, pageSize: 15 }
	return (
		<Box sx={{ textAlign: 'center' }}>
			<Box sx={{ textAlign: 'left' }}>
				<Box sx={{ display: 'flex' }}>
					<Icon sx={{ mr: '0.5rem' }}>
						<HouseSidingIcon />
					</Icon>
					<Typography variant='h6' component='p'>
						Houses floors database
					</Typography>
				</Box>
				<Typography component='span'>Your database containg all the houses floors you have registered.</Typography>
			</Box>
			<Box sx={{ mt: '2rem' }}>
				<Box sx={{ mb: '1rem', textAlign: 'right' }}>
					{isWritable && (
						<>
							{!isMobile ? (
								<Button variant='contained' type='button' size='medium' onClick={handleClickAddOpen}>
									Add new house floor
								</Button>
							) : (
								<IconButton type='button' size='small' color='primary' onClick={handleClickAddOpen}>
									<AddIcon />
								</IconButton>
							)}
							<AddHouseFloorDialog
								edit={false}
								handleCloseAdd={handleCloseAdd}
								openAddDialog={openAddDialog}
								addItemHandler={addItemHandler}
							/>
						</>
					)}
					{selectedItems.length > 0 && (
						<>
							{isWritable && (
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
									<AddHouseFloorDialog
										edit={true}
										handleCloseAdd={handleCloseEdit}
										openAddDialog={openEditDialog}
										selectedItems={selectedItems}
										addItemHandler={editItemHandler}
									/>
								</>
							)}
							{isDeletable && (
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
							)}
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
					rows={houseFloors}
					columns={columns}
					initialState={{ pagination: { paginationModel } }}
					pageSizeOptions={[15, 30, 45]}
					checkboxSelection={isWritable ? true : false}
					disableRowSelectionOnClick={true}
					sx={{ border: 0, width: '100%' }}
					density='comfortable'
					disableColumnResize={true}
					disableColumnSelector={true}
					disableVirtualization={true}
					disableMultipleRowSelection={true}
					onRowSelectionModelChange={newRowSelectionModel => {
						setRowSelectionModel(newRowSelectionModel)
					}}
					rowSelectionModel={rowSelectionModel}
				/>
			</Box>
		</Box>
	)
}
