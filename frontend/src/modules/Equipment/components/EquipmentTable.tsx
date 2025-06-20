import { useEffect, useMemo, useState } from 'react'
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
import SettingsBackupRestoreIcon from '@mui/icons-material/SettingsBackupRestore'
import DeleteIcon from '@mui/icons-material/Delete'
import { DataGrid, type GridColDef, type GridRowSelectionModel } from '@mui/x-data-grid'
import type { IEquipmentTableProps, IAddEquipment } from '../scripts/IEquipment'
import DevicesIcon from '@mui/icons-material/Devices'
import { EquipmentClass } from '../scripts/EquipmentClass'
import AddEquipmentDialog from './AddEquipmentDialog'
import { showAlert } from '../../../store/application-store'
import { canWrite, canDelete } from '../../../store/auth-actions'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { useAddEquipmentMutation, useRestoreEquipmentMutation } from '../../../store/api/equipmentApi'
import { useUpdateEquipmentMutation } from '../../../store/api/equipmentApi'
import { useDeleteEquipmentMutation } from '../../../store/api/equipmentApi'
import { useRevalidator } from 'react-router'

export default function EquipmentTable({ equipment, adminPanel }: IEquipmentTableProps) {
	const dispatch = useAppDispatch()
	const revalidator = useRevalidator()

	const [selectedItems, setSelectedItems] = useState<EquipmentClass[]>([])
	const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>({
		type: 'include',
		ids: new Set(),
	})
	const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false)
	const [openAddDialog, setOpenAddDialog] = useState<boolean>(false)
	const [openEditDialog, setOpenEditDialog] = useState<boolean>(false)
	const [openRestoreDialog, setOpenRestoreDialog] = useState<boolean>(false)

	const isWritable = useAppSelector(state => canWrite('equ', 'equEquipment')(state))
	const isDeletable = useAppSelector(state => canDelete('equ', 'equEquipment')(state))

	const [addEquipment] = useAddEquipmentMutation()
	const [updateEquipment] = useUpdateEquipmentMutation()
	const [deleteEquipment] = useDeleteEquipmentMutation()
	const [restoreEquipment] = useRestoreEquipmentMutation()

	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	const columns = useMemo<GridColDef[]>(
		() => [
			{ field: 'id', headerName: 'ID', width: 50 },
			{ field: 'serialNumber', headerName: 'Serial number', width: 200 },
			{
				field: 'vendor.name',
				headerName: 'Vendor name',
				width: 200,
				valueGetter: (_, row) => `${row.vendor.name}`,
			},
			{
				field: 'model.name',
				headerName: 'Model name',
				width: 200,
				valueGetter: (_, row) => `${row.model.name}`,
			},
			{
				field: 'type.name',
				headerName: 'Type name',
				width: 155,
				valueGetter: (_, row) => `${row.type.name}`,
			},
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

	const equipmentMap = useMemo(() => {
		const map = new Map()
		equipment.forEach(item => {
			if (item.id) map.set(item.id, item)
		})
		return map
	}, [equipment])

	useEffect(() => {
		const selectedIds = [...rowSelectionModel.ids]
		setSelectedItems(selectedIds.map(id => equipmentMap.get(Number(id))).filter(Boolean))
	}, [rowSelectionModel, equipmentMap])

	function clearObject() {
		setSelectedItems([])
		setRowSelectionModel({
			type: 'include',
			ids: new Set(),
		})
	}

	async function addItemHandler(item: IAddEquipment | IAddEquipment[]) {
		try {
			setOpenAddDialog(false)
			if (!Array.isArray(item)) {
				await addEquipment(item).unwrap()
			}
			dispatch(showAlert({ message: 'New equipment added', severity: 'success' }))
			revalidator.revalidate()
		} catch (err: any) {
			const message = err?.data?.message || err?.message || 'Something went wrong'
			dispatch(showAlert({ message, severity: 'error' }))
		}
	}

	async function editItemHandler(items: IAddEquipment | IAddEquipment[]) {
		try {
			setOpenEditDialog(false)
			if (Array.isArray(items) && items.length >= 1) {
				await Promise.all(
					items.map(async item => {
						await updateEquipment(item).unwrap()
					})
				)
				dispatch(showAlert({ message: 'Equipment edited', severity: 'success' }))
				clearObject()
				revalidator.revalidate()
			}
		} catch (err: any) {
			const message = err?.data?.message || err?.message || 'Something went wrong'
			dispatch(showAlert({ message, severity: 'error' }))
		}
	}

	async function restoreItemHandler() {
		try {
			setOpenRestoreDialog(false)
			if (selectedItems.length >= 1) {
				await Promise.all(
					selectedItems.map(async item => {
						await restoreEquipment(item).unwrap()
					})
				)
				dispatch(showAlert({ message: 'Equipment restored', severity: 'success' }))
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
						await deleteEquipment({ id: item.id }).unwrap()
					})
				)
				dispatch(showAlert({ message: 'Equipment deleted', severity: 'success' }))
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

	function handleClickRestoreOpen() {
		setOpenRestoreDialog(true)
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

	function handleCloseRestore() {
		setOpenRestoreDialog(false)
	}

	const paginationModel = { page: 0, pageSize: 15 }
	return (
		<Box sx={{ textAlign: 'center' }}>
			<Box sx={{ textAlign: 'left' }}>
				<Box sx={{ display: 'flex' }}>
					<Icon sx={{ mr: '0.5rem' }}>
						<DevicesIcon />
					</Icon>
					<Typography variant='h6' component='p'>
						Equipment database
					</Typography>
				</Box>
				<Typography component='span'>Your database containg all the equipment you have registered.</Typography>
			</Box>
			<Box sx={{ mt: '2rem' }}>
				<Box sx={{ mb: '1rem', textAlign: 'right' }}>
					{isWritable && (
						<>
							{!isMobile ? (
								<Button variant='contained' type='button' size='medium' onClick={handleClickAddOpen}>
									Add new equipment
								</Button>
							) : (
								<IconButton type='button' size='small' color='primary' onClick={handleClickAddOpen}>
									<AddIcon />
								</IconButton>
							)}
							<AddEquipmentDialog
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
									<AddEquipmentDialog
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

							{isDeletable && adminPanel && (
								<>
									{!isMobile ? (
										<Button
											sx={{ ml: '0.3rem' }}
											variant='contained'
											color='success'
											type='button'
											size={isMobile ? 'small' : 'medium'}
											onClick={handleClickRestoreOpen}>
											Restore
										</Button>
									) : (
										<IconButton
											sx={{ ml: '0.3rem' }}
											color='error'
											type='button'
											size={isMobile ? 'small' : 'medium'}
											onClick={handleClickRestoreOpen}>
											<SettingsBackupRestoreIcon />
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
							<Dialog open={openRestoreDialog} onClose={handleCloseRestore} closeAfterTransition={false}>
								<DialogTitle>Do you want to restore selected item(s)?</DialogTitle>
								<DialogContent>
									<DialogContentText>You have selected {selectedItems.length} item(s) to restore.</DialogContentText>
								</DialogContent>
								<DialogActions>
									<Button variant='outlined' size={isMobile ? 'small' : 'medium'} onClick={handleCloseRestore}>
										Cancel
									</Button>
									<Button
										variant='outlined'
										size={isMobile ? 'small' : 'medium'}
										onClick={restoreItemHandler}
										autoFocus
										color='success'>
										Restore
									</Button>
								</DialogActions>
							</Dialog>
						</>
					)}
				</Box>
				<DataGrid
					rows={equipment}
					columns={columns}
					initialState={{ pagination: { paginationModel } }}
					pageSizeOptions={[15, 30, 45]}
					checkboxSelection={isWritable ? true : false}
					disableRowSelectionOnClick={true}
					sx={{ border: 0, width: '100%' }}
					density='comfortable'
					disableColumnResize={true}
					disableColumnSelector={true}
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
