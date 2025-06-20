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
import type { IAddHouseData, IHouseTableProps } from '../scripts/IHouse'
import HouseIcon from '@mui/icons-material/House'
import type { HouseClass } from '../scripts/HouseClass'
import AddHouseDialog from './AddHouseDialog'
import { showAlert } from '../../../store/application-store'
import { canWrite, canDelete } from '../../../store/auth-actions'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { useAddHouseMutation, useUpdateHouseMutation, useDeleteHouseMutation } from '../../../store/api/houseApi'
import { useRevalidator } from 'react-router'

export default function HouseTable({ houses }: IHouseTableProps) {
	const dispatch = useAppDispatch()
	const revalidator = useRevalidator()

	const [selectedItems, setSelectedItems] = useState<HouseClass[]>([])
	const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>({
		type: 'include',
		ids: new Set(),
	})
	const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false)
	const [openAddDialog, setOpenAddDialog] = useState<boolean>(false)
	const [openEditDialog, setOpenEditDialog] = useState<boolean>(false)

	const isWritable = useAppSelector(state => canWrite('house', 'houseHouse')(state))
	const isDeletable = useAppSelector(state => canDelete('house', 'houseHouse')(state))

	const [addHouse] = useAddHouseMutation()
	const [updateHouse] = useUpdateHouseMutation()
	const [deleteHouse] = useDeleteHouseMutation()

	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	const columns = useMemo<GridColDef[]>(
		() => [
			{ field: 'id', headerName: 'ID', width: 50 },
			{ field: 'name', headerName: 'Name', width: 150 },
			{ field: 'postalCode', headerName: 'Postal code', width: 150 },
			{ field: 'city', headerName: 'City', width: 150 },
			{ field: 'street', headerName: 'Street', width: 150 },
			{ field: 'houseNumber', headerName: 'House number', width: 150 },
			{
				field: 'createdBy.username',
				headerName: 'Created by',
				width: 155,
				valueGetter: (_, row) => `${row.createdBy.username}`,
			},
			{
				field: 'updatedBy.username',
				headerName: 'Updated by',
				width: 155,
				valueGetter: (_, row) => `${row.updatedBy.username}`,
			},
			{
				field: 'createdAt',
				headerName: 'Creation date',
				width: 160,
				valueGetter: (_, row) => `${row.createdAt.replace('T', ' ').replace('Z', ' ').split('.')[0]}`,
			},
			{
				field: 'updatedAt',
				headerName: 'Update date',
				width: 160,
				valueGetter: (_, row) => `${row.updatedAt.replace('T', ' ').replace('Z', ' ').split('.')[0]}`,
			},
		],
		[]
	)

	const housesMap = useMemo(() => {
		const map = new Map()
		houses.forEach(item => {
			if (item.id) map.set(item.id, item)
		})
		return map
	}, [houses])

	useEffect(() => {
		const selectedIds = [...rowSelectionModel.ids]
		setSelectedItems(selectedIds.map(id => housesMap.get(Number(id))).filter(Boolean))
	}, [rowSelectionModel, housesMap])

	function clearObject() {
		setSelectedItems([])
		setRowSelectionModel({
			type: 'include',
			ids: new Set(),
		})
	}

	async function addItemHandler(item: IAddHouseData | IAddHouseData[]) {
		try {
			setOpenAddDialog(false)
			if (!Array.isArray(item)) {
				const formData = new FormData()
				if (item.name) {
					formData.append('name', item.name)
				}
				if (item.postalCode) {
					formData.append('postalCode', item.postalCode)
				}
				if (item.city) {
					formData.append('city', item.city)
				}
				if (item.street) {
					formData.append('street', item.street)
				}
				if (item.houseNumber) {
					formData.append('houseNumber', item.houseNumber)
				}
				if (item.pictureLink) {
					formData.append('pictureLink', item.pictureLink)
				}
				await addHouse(formData).unwrap()
			}
			dispatch(showAlert({ message: 'New house added', severity: 'success' }))
			revalidator.revalidate()
		} catch (err: any) {
			const message = err?.data?.message || err?.message || 'Something went wrong'
			dispatch(showAlert({ message, severity: 'error' }))
		}
	}

	async function editItemHandler(items: IAddHouseData | IAddHouseData[]) {
		try {
			setOpenEditDialog(false)
			if (Array.isArray(items) && items.length >= 1) {
				await Promise.all(
					items.map(async item => {
						const formData = new FormData()
						if (item.name) {
							formData.append('name', item.name)
						}
						if (item.postalCode) {
							formData.append('postalCode', item.postalCode)
						}
						if (item.city) {
							formData.append('city', item.city)
						}
						if (item.street) {
							formData.append('street', item.street)
						}
						if (item.houseNumber) {
							formData.append('houseNumber', item.houseNumber)
						}
						if (item.pictureLink) {
							formData.append('pictureLink', item.pictureLink)
						}
						if (item.id) {
							await updateHouse({ body: formData, id: item.id })
						}
					})
				)
				dispatch(showAlert({ message: 'House edited', severity: 'success' }))
				clearObject()
				revalidator.revalidate()
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
						await deleteHouse({ id: item.id })
					})
				)
				dispatch(showAlert({ message: 'House deleted', severity: 'success' }))
				revalidator.revalidate()
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
						<HouseIcon />
					</Icon>
					<Typography variant='h6' component='p'>
						Houses database
					</Typography>
				</Box>
				<Typography component='span'>Your database containg all the houses you have registered.</Typography>
			</Box>
			<Box sx={{ mt: '2rem' }}>
				<Box sx={{ mb: '1rem', textAlign: 'right' }}>
					{isWritable && (
						<>
							{!isMobile ? (
								<Button variant='contained' type='button' size='medium' onClick={handleClickAddOpen}>
									Add new house
								</Button>
							) : (
								<IconButton type='button' size='small' color='primary' onClick={handleClickAddOpen}>
									<AddIcon />
								</IconButton>
							)}
							<AddHouseDialog
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
									<AddHouseDialog
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
					rows={houses}
					columns={columns}
					initialState={{ pagination: { paginationModel } }}
					pageSizeOptions={[15, 30, 45]}
					checkboxSelection={isWritable ? true : false}
					disableRowSelectionOnClick={true}
					sx={{ border: 0 }}
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
