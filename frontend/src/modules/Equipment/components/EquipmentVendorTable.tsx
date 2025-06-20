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
import type { IAddEquipmentData, IEquipmentVendorTableProps } from '../scripts/IEquipment'
import FactoryIcon from '@mui/icons-material/Factory'
import type { EquipmentVendorClass } from '../scripts/EquipmentVendorClass'
import AddEquipmentVendorDialog from './AddEquipmentVendorDialog'
import { showAlert } from '../../../store/application-store'
import { canWrite, canDelete } from '../../../store/auth-actions'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import {
	useAddEquipmentVendorMutation,
	useUpdateEquipmentVendorMutation,
	useDeleteEquipmentVendorMutation,
} from '../../../store/api/equipmentApi'
import { useRevalidator } from 'react-router'

export default function EquipmentVendorTable({ equipmentVendor }: IEquipmentVendorTableProps) {
	const dispatch = useAppDispatch()
	const revalidator = useRevalidator()

	const [selectedItems, setSelectedItems] = useState<EquipmentVendorClass[]>([])
	const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>({
		type: 'include',
		ids: new Set(),
	})
	const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false)
	const [openAddDialog, setOpenAddDialog] = useState<boolean>(false)
	const [openEditDialog, setOpenEditDialog] = useState<boolean>(false)

	const isWritable = useAppSelector(state => canWrite('equ', 'equVendor')(state))
	const isDeletable = useAppSelector(state => canDelete('equ', 'equVendor')(state))

	const [addEquipmentVendor] = useAddEquipmentVendorMutation()
	const [updateEquipmentVendor] = useUpdateEquipmentVendorMutation()
	const [deleteEquipmentVendor] = useDeleteEquipmentVendorMutation()

	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	const columns = useMemo<GridColDef[]>(
		() => [
			{ field: 'id', headerName: 'ID', width: 100 },
			{ field: 'name', headerName: 'Name', width: 360 },
		],
		[]
	)

	const equipmentVendorMap = useMemo(() => {
		const map = new Map()
		equipmentVendor.forEach(item => {
			if (item.id) map.set(item.id, item)
		})
		return map
	}, [equipmentVendor])

	useEffect(() => {
		const selectedIds = [...rowSelectionModel.ids]
		setSelectedItems(selectedIds.map(id => equipmentVendorMap.get(Number(id))).filter(Boolean))
	}, [rowSelectionModel, equipmentVendorMap])

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
				await addEquipmentVendor(item).unwrap()
			}
			dispatch(showAlert({ message: 'New equipment vendor added', severity: 'success' }))
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
						await updateEquipmentVendor(item).unwrap()
					})
				)
				dispatch(showAlert({ message: 'Equipment vendor edited', severity: 'success' }))
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
						await deleteEquipmentVendor({ id: item.id }).unwrap()
					})
				)
				dispatch(showAlert({ message: 'Equipment vendor deleted', severity: 'success' }))
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
						<FactoryIcon />
					</Icon>
					<Typography variant='h6' component='p'>
						Equipment vendors database
					</Typography>
				</Box>
				<Typography component='span'>Your database containg all the equipment vendors you have registered.</Typography>
			</Box>
			<Box sx={{ mt: '2rem' }}>
				<Box sx={{ mb: '1rem', textAlign: 'right' }}>
					{isWritable && (
						<>
							{!isMobile ? (
								<Button variant='contained' type='button' size='medium' onClick={handleClickAddOpen}>
									Add new equipment vendor
								</Button>
							) : (
								<IconButton type='button' size='small' color='primary' onClick={handleClickAddOpen}>
									<AddIcon />
								</IconButton>
							)}
							<AddEquipmentVendorDialog
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
									<AddEquipmentVendorDialog
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
					rows={equipmentVendor}
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
