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

/**
 * EquipmentVendorTable component displays a table of equipment vendors with CRUD (Create, Read, Update, Delete) operations.
 *
 * @param equipmentVendor - An array of equipment vendor objects to be displayed in the table.
 *
 * Features:
 * - Displays a paginated, selectable table of equipment vendors.
 * - Allows adding, editing, and deleting equipment vendors, with dialogs for each operation.
 * - Supports single row selection for edit and delete actions.
 * - Responsive UI: adapts button styles for mobile and desktop.
 * - Integrates with Redux for permissions and alert notifications.
 * - Uses RTK Query mutations for data operations and triggers revalidation on changes.
 *
 * Permissions:
 * - Write and delete actions are conditionally rendered based on user permissions.
 *
 * @component
 */
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

	/**
	 * Clears the current selection by resetting the selected items array
	 * and updating the row selection model to an empty state.
	 *
	 * This function is typically used to deselect all items in the equipment vendor table.
	 */
	function clearObject(): void {
		setSelectedItems([])
		setRowSelectionModel({
			type: 'include',
			ids: new Set(),
		})
	}

	/**
	 * Handles adding a new equipment vendor or multiple vendors.
	 *
	 * Closes the add dialog, attempts to add the provided equipment vendor(s),
	 * shows a success alert on completion, and triggers a revalidation.
	 * If an error occurs, displays an error alert with the relevant message.
	 *
	 * @param item - The equipment vendor data to add, either a single item or an array of items.
	 * @returns A promise that resolves when the operation is complete.
	 */
	async function addItemHandler(item: IAddEquipmentData | IAddEquipmentData[]): Promise<void> {
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

	/**
	 * Handles editing of equipment vendor items.
	 *
	 * Closes the edit dialog, updates one or more equipment vendor items via API,
	 * shows a success alert on completion, clears the form object, and triggers a revalidation.
	 * If an error occurs during the update process, displays an error alert with the relevant message.
	 *
	 * @param items - A single equipment vendor data object or an array of such objects to be edited.
	 * @returns A promise that resolves when all updates are complete.
	 */
	async function editItemHandler(items: IAddEquipmentData | IAddEquipmentData[]): Promise<void> {
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

	/**
	 * Handles the deletion of selected equipment vendor items.
	 *
	 * Closes the delete confirmation dialog, then attempts to delete all selected items
	 * by calling the `deleteEquipmentVendor` API for each. If successful, shows a success alert
	 * and triggers a data revalidation. If an error occurs, displays an error alert with the
	 * relevant message.
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

	/**
	 * Opens the dialog for adding a new equipment vendor by setting the `openAddDialog` state to true.
	 *
	 * @remarks
	 * This function is typically used as an event handler for UI elements that trigger the add vendor dialog.
	 */
	function handleClickAddOpen(): void {
		setOpenAddDialog(true)
	}

	/**
	 * Opens the edit dialog by setting the `openEditDialog` state to `true`.
	 * Typically used as an event handler for edit actions in the equipment vendor table.
	 */
	function handleClickEditOpen(): void {
		setOpenEditDialog(true)
	}

	/**
	 * Opens the delete confirmation dialog by setting the `openDeleteDialog` state to true.
	 * Typically used as an event handler for delete actions in the equipment vendor table.
	 */
	function handleClickDeleteOpen(): void {
		setOpenDeleteDialog(true)
	}

	/**
	 * Closes the delete confirmation dialog by setting its open state to false.
	 *
	 * This function is typically used as an event handler to hide the delete dialog
	 * when the user cancels or completes a delete action.
	 */
	function handleCloseDelete(): void {
		setOpenDeleteDialog(false)
	}

	/**
	 * Closes the "Add" dialog by setting its open state to false.
	 *
	 * This function is typically used as an event handler to hide the dialog
	 * when the user cancels or completes the add operation.
	 */
	function handleCloseAdd(): void {
		setOpenAddDialog(false)
	}

	/**
	 * Closes the edit dialog by setting the `openEditDialog` state to false.
	 *
	 * This function is typically used as an event handler to close the edit dialog
	 * in the equipment vendor table component.
	 */
	function handleCloseEdit(): void {
		setOpenEditDialog(false)
	}

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
