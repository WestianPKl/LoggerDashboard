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
import type { IAddEquipmentData, IEquipmentModelTableProps } from '../scripts/IEquipment'
import OnDeviceTrainingIcon from '@mui/icons-material/OnDeviceTraining'
import type { EquipmentModelClass } from '../scripts/EquipmentModelClass'
import AddEquipmentModelDialog from './AddEquipmentModelDialog'
import { showAlert } from '../../../store/application-store'
import { canWrite, canDelete } from '../../../store/auth-actions'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { useAddEquipmentModelMutation } from '../../../store/api/equipmentApi'
import { useUpdateEquipmentModelMutation } from '../../../store/api/equipmentApi'
import { useDeleteEquipmentModelMutation } from '../../../store/api/equipmentApi'
import { useRevalidator } from 'react-router'

/**
 * EquipmentModelTable component displays a table of equipment models with CRUD (Create, Read, Update, Delete) operations.
 *
 * @param {IEquipmentModelTableProps} props - The props for the component.
 * @param {EquipmentModelClass[]} props.equipmentModel - Array of equipment model objects to display in the table.
 *
 * @returns {JSX.Element} The rendered EquipmentModelTable component.
 *
 * @remarks
 * - Allows users with appropriate permissions to add, edit, and delete equipment models.
 * - Supports selection of table rows for batch operations.
 * - Responsive design adapts to mobile and desktop layouts.
 * - Uses dialogs for add, edit, and delete confirmations.
 * - Integrates with Redux for state management and RTK Query for API mutations.
 *
 * @example
 * ```tsx
 * <EquipmentModelTable equipmentModel={equipmentModels} />
 * ```
 */
export default function EquipmentModelTable({ equipmentModel }: IEquipmentModelTableProps) {
	const dispatch = useAppDispatch()
	const revalidator = useRevalidator()

	const [selectedItems, setSelectedItems] = useState<EquipmentModelClass[]>([])
	const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>({
		type: 'include',
		ids: new Set(),
	})
	const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false)
	const [openAddDialog, setOpenAddDialog] = useState<boolean>(false)
	const [openEditDialog, setOpenEditDialog] = useState<boolean>(false)

	const isWritable = useAppSelector(state => canWrite('equ', 'equModel')(state))
	const isDeletable = useAppSelector(state => canDelete('equ', 'equModel')(state))

	const [addEquipmentModel] = useAddEquipmentModelMutation()
	const [updateEquipmentModel] = useUpdateEquipmentModelMutation()
	const [deleteEquipmentModel] = useDeleteEquipmentModelMutation()

	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	const equipmentModelMap = useMemo(() => {
		const map = new Map()
		equipmentModel.forEach(item => {
			if (item.id) map.set(item.id, item)
		})
		return map
	}, [equipmentModel])

	useEffect(() => {
		const selectedIds = [...rowSelectionModel.ids]
		setSelectedItems(selectedIds.map(id => equipmentModelMap.get(Number(id))).filter(Boolean))
	}, [rowSelectionModel, equipmentModelMap])

	/**
	 * Clears the current selection by resetting the selected items array
	 * and updating the row selection model to an empty state.
	 *
	 * This function sets the selected items to an empty array and
	 * initializes the row selection model with an empty set of IDs,
	 * effectively deselecting all items in the equipment model table.
	 */
	function clearObject(): void {
		setSelectedItems([])
		setRowSelectionModel({
			type: 'include',
			ids: new Set(),
		})
	}

	/**
	 * Handles the addition of a new equipment model or multiple models.
	 *
	 * Closes the add dialog, attempts to add the equipment model(s) via an API call,
	 * shows a success alert on completion, and triggers a data revalidation.
	 * If an error occurs, displays an error alert with the relevant message.
	 *
	 * @param item - The equipment data to add, either a single item or an array of items.
	 * @returns A promise that resolves when the operation is complete.
	 */
	async function addItemHandler(item: IAddEquipmentData | IAddEquipmentData[]): Promise<void> {
		try {
			setOpenAddDialog(false)
			if (!Array.isArray(item)) {
				await addEquipmentModel(item).unwrap()
			}
			dispatch(showAlert({ message: 'New equipment model added', severity: 'success' }))
			revalidator.revalidate()
		} catch (err: any) {
			const message = err?.data?.message || err?.message || 'Something went wrong'
			dispatch(showAlert({ message, severity: 'error' }))
		}
	}

	/**
	 * Handles editing of one or multiple equipment model items.
	 *
	 * Closes the edit dialog, updates the equipment model(s) via API,
	 * shows a success alert on completion, clears the form object, and triggers a revalidation.
	 * If an error occurs during the update, displays an error alert with the relevant message.
	 *
	 * @param items - A single equipment model data object or an array of such objects to be edited.
	 * @returns A Promise that resolves when the edit operation(s) are complete.
	 */
	async function editItemHandler(items: IAddEquipmentData | IAddEquipmentData[]): Promise<void> {
		try {
			setOpenEditDialog(false)
			if (Array.isArray(items) && items.length >= 1) {
				await Promise.all(
					items.map(async item => {
						await updateEquipmentModel(item).unwrap()
					})
				)
				dispatch(showAlert({ message: 'Equipment model edited', severity: 'success' }))
				clearObject()
				revalidator.revalidate()
			}
		} catch (err: any) {
			const message = err?.data?.message || err?.message || 'Something went wrong'
			dispatch(showAlert({ message, severity: 'error' }))
		}
	}

	/**
	 * Handles the deletion of selected equipment models.
	 *
	 * Closes the delete confirmation dialog, then attempts to delete all selected equipment models
	 * by calling the `deleteEquipmentModel` API for each selected item. If all deletions succeed,
	 * shows a success alert and triggers a revalidation of the data. If any error occurs during
	 * the deletion process, displays an error alert with the appropriate message.
	 *
	 * @returns {Promise<void>} A promise that resolves when the deletion process is complete.
	 */
	async function deleteItemHandler(): Promise<void> {
		try {
			setOpenDeleteDialog(false)
			if (selectedItems.length >= 1) {
				await Promise.all(
					selectedItems.map(async item => {
						await deleteEquipmentModel({ id: item.id }).unwrap()
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
	 * Opens the dialog for adding a new equipment model by setting the `openAddDialog` state to true.
	 *
	 * @remarks
	 * This function is typically used as an event handler for UI elements that trigger the add dialog.
	 */
	function handleClickAddOpen(): void {
		setOpenAddDialog(true)
	}

	/**
	 * Opens the edit dialog by setting the `openEditDialog` state to `true`.
	 * Typically used as an event handler for edit actions in the equipment model table.
	 */
	function handleClickEditOpen(): void {
		setOpenEditDialog(true)
	}

	/**
	 * Opens the delete confirmation dialog by setting the `openDeleteDialog` state to `true`.
	 * Typically used as an event handler for delete actions in the equipment model table.
	 */
	function handleClickDeleteOpen(): void {
		setOpenDeleteDialog(true)
	}

	/**
	 * Closes the delete confirmation dialog by setting its open state to false.
	 *
	 * This function is typically used as an event handler for dialog close actions.
	 */
	function handleCloseDelete(): void {
		setOpenDeleteDialog(false)
	}

	/**
	 * Closes the "Add Equipment" dialog by setting its open state to false.
	 *
	 * This function is typically used as an event handler for dialog close actions.
	 */
	function handleCloseAdd(): void {
		setOpenAddDialog(false)
	}

	/**
	 * Closes the edit dialog by setting its open state to false.
	 *
	 * This function is typically used as an event handler to close
	 * the edit dialog in the equipment model table component.
	 */
	function handleCloseEdit(): void {
		setOpenEditDialog(false)
	}

	return (
		<Box sx={{ textAlign: 'center' }}>
			<Box sx={{ textAlign: 'left' }}>
				<Box sx={{ display: 'flex' }}>
					<Icon sx={{ mr: '0.5rem' }}>
						<OnDeviceTrainingIcon />
					</Icon>
					<Typography variant='h6' component='p'>
						Equipment models database
					</Typography>
				</Box>
				<Typography component='span'>Your database containg all the equipment models you have registered.</Typography>
			</Box>
			<Box sx={{ mt: '2rem' }}>
				<Box sx={{ mb: '1rem', textAlign: 'right' }}>
					{isWritable && (
						<>
							{!isMobile ? (
								<Button variant='contained' type='button' size='medium' onClick={handleClickAddOpen}>
									Add new equipment model
								</Button>
							) : (
								<IconButton type='button' size='small' color='primary' onClick={handleClickAddOpen}>
									<AddIcon />
								</IconButton>
							)}
							<AddEquipmentModelDialog
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
									<AddEquipmentModelDialog
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
					rows={equipmentModel}
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
