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

	/**
	 * Clears the current selection by resetting the selected items array
	 * and initializing the row selection model to an empty state.
	 *
	 * This function sets the selected items to an empty array and updates
	 * the row selection model with an 'include' type and an empty set of IDs.
	 * Typically used to deselect all items in the equipment table.
	 */
	function clearObject(): void {
		setSelectedItems([])
		setRowSelectionModel({
			type: 'include',
			ids: new Set(),
		})
	}

	/**
	 * Handles adding a new equipment item or multiple items.
	 *
	 * Closes the add dialog, attempts to add the equipment via the API,
	 * shows a success alert on success, and triggers a revalidation.
	 * If an error occurs, displays an error alert with the relevant message.
	 *
	 * @param item - The equipment item or array of items to add.
	 * @returns A promise that resolves when the operation is complete.
	 */
	async function addItemHandler(item: IAddEquipment | IAddEquipment[]): Promise<void> {
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

	/**
	 * Handles editing of one or multiple equipment items.
	 *
	 * Closes the edit dialog, updates the provided equipment item(s) via the `updateEquipment` API,
	 * and shows a success alert upon completion. If an error occurs during the update process,
	 * displays an error alert with the relevant message.
	 *
	 * @param items - A single equipment item or an array of equipment items to be edited.
	 * @returns A Promise that resolves when all updates are complete.
	 */
	async function editItemHandler(items: IAddEquipment | IAddEquipment[]): Promise<void> {
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

	/**
	 * Handles the restoration of selected equipment items.
	 *
	 * Closes the restore dialog, then attempts to restore all selected equipment items in parallel.
	 * On successful restoration, displays a success alert and triggers a data revalidation.
	 * If an error occurs during the restoration process, displays an error alert with the relevant message.
	 *
	 * @returns {Promise<void>} A promise that resolves when the restoration process is complete.
	 */
	async function restoreItemHandler(): Promise<void> {
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

	/**
	 * Handles the deletion of selected equipment items.
	 *
	 * Closes the delete confirmation dialog, then attempts to delete all selected equipment items
	 * concurrently. If deletion is successful, displays a success alert and triggers a data revalidation.
	 * If an error occurs during deletion, displays an error alert with the appropriate message.
	 *
	 * @async
	 * @function
	 * @returns {Promise<void>} A promise that resolves when the deletion process is complete.
	 */
	async function deleteItemHandler(): Promise<void> {
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

	/**
	 * Opens the dialog for adding new equipment by setting the `openAddDialog` state to `true`.
	 *
	 * @remarks
	 * This function is typically used as an event handler for UI elements (e.g., a button)
	 * that trigger the display of the add equipment dialog.
	 */
	function handleClickAddOpen(): void {
		setOpenAddDialog(true)
	}

	/**
	 * Opens the edit dialog by setting the `openEditDialog` state to `true`.
	 * Typically used as an event handler for edit actions in the equipment table.
	 */
	function handleClickEditOpen(): void {
		setOpenEditDialog(true)
	}

	/**
	 * Opens the restore dialog by setting the `openRestoreDialog` state to `true`.
	 * Typically used as an event handler for restore actions in the equipment table.
	 */
	function handleClickRestoreOpen(): void {
		setOpenRestoreDialog(true)
	}

	/**
	 * Opens the delete confirmation dialog by setting the `openDeleteDialog` state to `true`.
	 *
	 * This function is typically called when the user initiates a delete action,
	 * such as clicking a delete button in the equipment table.
	 */
	function handleClickDeleteOpen(): void {
		setOpenDeleteDialog(true)
	}

	/**
	 * Closes the delete confirmation dialog by setting its open state to false.
	 *
	 * This function is typically called when the user cancels or completes a delete action,
	 * ensuring the dialog is no longer visible.
	 */
	function handleCloseDelete(): void {
		setOpenDeleteDialog(false)
	}

	/**
	 * Closes the "Add Equipment" dialog by setting its open state to false.
	 *
	 * This function is typically used as an event handler for closing the add dialog,
	 * such as when the user cancels or completes the add operation.
	 */
	function handleCloseAdd(): void {
		setOpenAddDialog(false)
	}

	/**
	 * Closes the edit dialog by setting the open state to false.
	 *
	 * This function is typically used as an event handler to close
	 * the edit dialog in the equipment table component.
	 */
	function handleCloseEdit(): void {
		setOpenEditDialog(false)
	}

	/**
	 * Closes the restore dialog by setting its open state to false.
	 *
	 * This function is typically used as an event handler to close
	 * the restore confirmation dialog in the equipment table component.
	 */
	function handleCloseRestore(): void {
		setOpenRestoreDialog(false)
	}

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
					columns={useMemo<GridColDef[]>(
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
					)}
					initialState={{ pagination: { paginationModel: { page: 0, pageSize: 15 } } }}
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
