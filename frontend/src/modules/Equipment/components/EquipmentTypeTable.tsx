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
import type { IAddEquipmentData, IEquipmentTypeTableProps } from '../scripts/IEquipment'
import MergeTypeIcon from '@mui/icons-material/MergeType'
import type { EquipmentTypeClass } from '../scripts/EquipmentTypeClass'
import AddEquipmentTypeDialog from './AddEquipmentTypeDialog'
import { showAlert } from '../../../store/application-store'
import { canWrite, canDelete } from '../../../store/auth-actions'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { useAddEquipmentTypeMutation } from '../../../store/api/equipmentApi'
import { useUpdateEquipmentTypeMutation } from '../../../store/api/equipmentApi'
import { useDeleteEquipmentTypeMutation } from '../../../store/api/equipmentApi'
import { useRevalidator } from 'react-router'

export default function EquipmentTypeTable({ equipmentType }: IEquipmentTypeTableProps) {
	const dispatch = useAppDispatch()
	const revalidator = useRevalidator()

	const [selectedItems, setSelectedItems] = useState<EquipmentTypeClass[]>([])
	const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>({
		type: 'include',
		ids: new Set(),
	})
	const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false)
	const [openAddDialog, setOpenAddDialog] = useState<boolean>(false)
	const [openEditDialog, setOpenEditDialog] = useState<boolean>(false)

	const isWritable = useAppSelector(state => canWrite('equ', 'equType')(state))
	const isDeletable = useAppSelector(state => canDelete('equ', 'equType')(state))

	const [addEquipmentType] = useAddEquipmentTypeMutation()
	const [updateEquipmentType] = useUpdateEquipmentTypeMutation()
	const [deleteEquipmentType] = useDeleteEquipmentTypeMutation()

	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	const columns = useMemo<GridColDef[]>(
		() => [
			{ field: 'id', headerName: 'ID', width: 100 },
			{ field: 'name', headerName: 'Name', width: 360 },
		],
		[]
	)

	const equipmentTypeMap = useMemo(() => {
		const map = new Map()
		equipmentType.forEach(item => {
			if (item.id) map.set(item.id, item)
		})
		return map
	}, [equipmentType])

	useEffect(() => {
		const selectedIds = [...rowSelectionModel.ids]
		setSelectedItems(selectedIds.map(id => equipmentTypeMap.get(Number(id))).filter(Boolean))
	}, [rowSelectionModel, equipmentTypeMap])

	function clearObject() {
		setSelectedItems([])
		setRowSelectionModel({
			type: 'include',
			ids: new Set(),
		})
	}

	async function addItemHandler(item: IAddEquipmentData | IAddEquipmentData[]) {
		try {
			setOpenAddDialog(false)
			if (!Array.isArray(item)) {
				await addEquipmentType(item).unwrap()
			}
			dispatch(showAlert({ message: 'New equipment type added', severity: 'success' }))
			revalidator.revalidate()
		} catch (err: any) {
			const message = err?.data?.message || err?.message || 'Something went wrong'
			dispatch(showAlert({ message, severity: 'error' }))
		}
	}

	async function editItemHandler(items: IAddEquipmentData | IAddEquipmentData[]) {
		try {
			setOpenEditDialog(false)
			if (Array.isArray(items) && items.length >= 1) {
				await Promise.all(
					items.map(async item => {
						await updateEquipmentType(item).unwrap()
					})
				)
				dispatch(showAlert({ message: 'Equipment type edited', severity: 'success' }))
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
						await deleteEquipmentType({ id: item.id }).unwrap()
					})
				)
				dispatch(showAlert({ message: 'Equipment model deleted', severity: 'success' }))
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
						<MergeTypeIcon />
					</Icon>
					<Typography variant='h6' component='p'>
						Equipment types database
					</Typography>
				</Box>
				<Typography component='span'>Your database containg all the equipment types you have registered.</Typography>
			</Box>
			<Box sx={{ mt: '2rem' }}>
				<Box sx={{ mb: '1rem', textAlign: 'right' }}>
					{isWritable && (
						<>
							{!isMobile ? (
								<Button variant='contained' type='button' size='medium' onClick={handleClickAddOpen}>
									Add new equipment type
								</Button>
							) : (
								<IconButton type='button' size='small' color='primary' onClick={handleClickAddOpen}>
									<AddIcon />
								</IconButton>
							)}
							<AddEquipmentTypeDialog
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
									<AddEquipmentTypeDialog
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
					rows={equipmentType}
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
