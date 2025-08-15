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

/**
 * EquipmentTypeTable component displays a table of equipment types with CRUD (Create, Read, Update, Delete) operations.
 *
 * @param equipmentType - An array of equipment type objects to display in the table.
 *
 * Features:
 * - Displays equipment types in a paginated, selectable table.
 * - Allows adding, editing, and deleting equipment types based on user permissions.
 * - Supports responsive UI for mobile and desktop.
 * - Integrates with Redux for state management and permission checks.
 * - Uses dialogs for add, edit, and delete operations.
 * - Shows success and error alerts for user actions.
 *
 * @remarks
 * - Requires permission checks for write and delete actions.
 * - Uses MUI DataGrid for table rendering.
 * - Expects mutation hooks and alert actions to be available in the context.
 *
 * @component
 */
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

	/**
	 * Clears the current selection by resetting the selected items array
	 * and updating the row selection model to an empty state.
	 *
	 * This function is typically used to deselect all items in the equipment type table.
	 */
	function clearObject(): void {
		setSelectedItems([])
		setRowSelectionModel({
			type: 'include',
			ids: new Set(),
		})
	}

	/**
	 * Handles adding a new equipment type or multiple equipment types.
	 *
	 * Closes the add dialog, attempts to add the equipment type(s) via an API call,
	 * shows a success alert on success, and triggers a data revalidation.
	 * If an error occurs, displays an error alert with the appropriate message.
	 *
	 * @param item - The equipment data to add, either a single item or an array of items.
	 * @returns A promise that resolves when the operation is complete.
	 */
	async function addItemHandler(item: IAddEquipmentData | IAddEquipmentData[]): Promise<void> {
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

	/**
	 * Handles editing of one or multiple equipment type items.
	 *
	 * Closes the edit dialog, updates the equipment type(s) via API,
	 * shows a success alert on completion, clears the form object,
	 * and triggers a revalidation. If an error occurs, displays an error alert.
	 *
	 * @param items - A single equipment data object or an array of equipment data objects to be edited.
	 * @returns A promise that resolves when the edit operation(s) are complete.
	 */
	async function editItemHandler(items: IAddEquipmentData | IAddEquipmentData[]): Promise<void> {
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

	/**
	 * Handles the deletion of selected equipment types.
	 *
	 * Closes the delete confirmation dialog, then attempts to delete all selected equipment types
	 * by calling the `deleteEquipmentType` API for each selected item. If the deletion is successful,
	 * displays a success alert and triggers a data revalidation. If an error occurs during deletion,
	 * displays an error alert with the appropriate message.
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

	/**
	 * Opens the dialog for adding a new equipment type by setting the `openAddDialog` state to true.
	 *
	 * @remarks
	 * This function is typically used as an event handler for UI elements (e.g., a button)
	 * that trigger the display of the add equipment type dialog.
	 */
	function handleClickAddOpen(): void {
		setOpenAddDialog(true)
	}

	/**
	 * Opens the edit dialog by setting the `openEditDialog` state to `true`.
	 * Typically used as an event handler for edit actions in the equipment type table.
	 */
	function handleClickEditOpen(): void {
		setOpenEditDialog(true)
	}

	/**
	 * Opens the delete confirmation dialog by setting the `openDeleteDialog` state to `true`.
	 *
	 * This function is typically called when the user initiates a delete action,
	 * such as clicking a "Delete" button in the UI.
	 */
	function handleClickDeleteOpen(): void {
		setOpenDeleteDialog(true)
	}

	/**
	 * Closes the delete confirmation dialog by setting its open state to false.
	 *
	 * This function is typically called when the user cancels or completes a delete action,
	 * ensuring the delete dialog is no longer visible.
	 */
	function handleCloseDelete(): void {
		setOpenDeleteDialog(false)
	}

	/**
	 * Closes the "Add Equipment Type" dialog by setting its open state to false.
	 *
	 * This function is typically used as an event handler for closing the add dialog,
	 * such as when the user cancels or completes the add operation.
	 */
	function handleCloseAdd(): void {
		setOpenAddDialog(false)
	}

	/**
	 * Closes the edit dialog by setting the `openEditDialog` state to false.
	 *
	 * This function is typically used as an event handler to close the edit dialog
	 * when the user cancels or completes an edit operation.
	 */
	function handleCloseEdit(): void {
		setOpenEditDialog(false)
	}

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
					columns={useMemo<GridColDef[]>(
						() => [
							{ field: 'id', headerName: 'ID', width: 100 },
							{ field: 'name', headerName: 'Name', width: 360 },
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
