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
import type { IAddFunctionalityDefinitionData, IFunctionalityDefinitionTableProps } from '../scripts/IAdmin'
import AssistantIcon from '@mui/icons-material/Assistant'
import type { FunctionalityDefinitionClass } from '../scripts/FunctionalityDefinitionClass'
import AddAdminFunctionalityDefinitionDialog from './AddAdminFunctionalityDefinitionDialog'
import { showAlert } from '../../../store/application-store'
import { canWrite, canDelete } from '../../../store/auth-actions'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import {
	useAddFunctionalityDefinitionMutation,
	useUpdateFunctionalityDefinitionMutation,
	useDeleteFunctionalityDefinitionMutation,
} from '../../../store/api/adminApi'
import { useRevalidator } from 'react-router'

/**
 * Renders a table displaying a list of functionality definitions for the admin module.
 *
 * Provides features for adding, editing, and deleting functionality definitions, with
 * permissions-based controls for write and delete actions. Supports selection of items,
 * responsive UI for mobile and desktop, and displays dialogs for add, edit, and delete operations.
 *
 * @component
 * @param {IFunctionalityDefinitionTableProps} props - The props for the table component.
 * @param {FunctionalityDefinitionClass[]} props.functionalityDefinitions - The array of functionality definitions to display.
 *
 * @returns {JSX.Element} The rendered admin functionality definition table component.
 */
export default function AdminFunctionalityDefinitionTable({
	functionalityDefinitions,
}: IFunctionalityDefinitionTableProps) {
	const dispatch = useAppDispatch()
	const revalidator = useRevalidator()

	const [selectedItems, setSelectedItems] = useState<FunctionalityDefinitionClass[]>([])
	const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>({
		type: 'include',
		ids: new Set(),
	})
	const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false)
	const [openAddDialog, setOpenAddDialog] = useState<boolean>(false)
	const [openEditDialog, setOpenEditDialog] = useState<boolean>(false)

	const isWritable = useAppSelector(state => canWrite('adm', 'admFunctionalityDefinition')(state))
	const isDeletable = useAppSelector(state => canDelete('adm', 'admFunctionalityDefinition')(state))

	const [addFunctionalityDefinition] = useAddFunctionalityDefinitionMutation()
	const [updateFunctionalityDefinition] = useUpdateFunctionalityDefinitionMutation()
	const [deleteFunctionalityDefinition] = useDeleteFunctionalityDefinitionMutation()

	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	const functionalityDefinitionsMap = useMemo(() => {
		const map = new Map()
		functionalityDefinitions.forEach(item => {
			if (item.id) map.set(item.id, item)
		})
		return map
	}, [functionalityDefinitions])

	useEffect(() => {
		const selectedIds = [...rowSelectionModel.ids]
		setSelectedItems(selectedIds.map(id => functionalityDefinitionsMap.get(Number(id))).filter(Boolean))
	}, [rowSelectionModel, functionalityDefinitionsMap])

	/**
	 * Clears the current selection by resetting the selected items array
	 * and updating the row selection model to an empty state.
	 *
	 * This function sets the selected items to an empty array and
	 * initializes the row selection model with an empty set of IDs,
	 * effectively deselecting all rows.
	 */
	function clearObject(): void {
		setSelectedItems([])
		setRowSelectionModel({
			type: 'include',
			ids: new Set(),
		})
	}

	/**
	 * Handles the addition of a new functionality definition item or an array of items.
	 * Closes the add dialog, attempts to add the item(s) via an API call, and displays a success alert on success.
	 * If an error occurs, displays an error alert with the error message.
	 * Also triggers a revalidation of the data after a successful addition.
	 *
	 * @param item - The functionality definition data to add, either a single item or an array of items.
	 * @returns A Promise that resolves when the operation is complete.
	 */
	async function addItemHandler(
		item: IAddFunctionalityDefinitionData | IAddFunctionalityDefinitionData[]
	): Promise<void> {
		try {
			setOpenAddDialog(false)
			if (!Array.isArray(item)) {
				await addFunctionalityDefinition(item).unwrap()
			}
			dispatch(showAlert({ message: 'New functionality definition added', severity: 'success' }))
			revalidator.revalidate()
		} catch (err: any) {
			const message = err?.data?.message || err?.message || 'Something went wrong'
			dispatch(showAlert({ message, severity: 'error' }))
		}
	}

	/**
	 * Handles editing of one or multiple functionality definition items.
	 *
	 * Closes the edit dialog, updates each provided item using the `updateFunctionalityDefinition` API,
	 * and displays a success alert upon completion. If an error occurs during the update process,
	 * an error alert is shown with the relevant message.
	 *
	 * @param items - A single functionality definition data object or an array of such objects to be edited.
	 * @returns A promise that resolves when all updates are complete.
	 */
	async function editItemHandler(
		items: IAddFunctionalityDefinitionData | IAddFunctionalityDefinitionData[]
	): Promise<void> {
		try {
			setOpenEditDialog(false)
			if (Array.isArray(items) && items.length >= 1) {
				await Promise.all(
					items.map(async item => {
						await updateFunctionalityDefinition(item).unwrap()
					})
				)
				dispatch(showAlert({ message: 'Functionality definition edited', severity: 'success' }))
				clearObject()
				revalidator.revalidate()
			}
		} catch (err: any) {
			const message = err?.data?.message || err?.message || 'Something went wrong'
			dispatch(showAlert({ message, severity: 'error' }))
		}
	}

	/**
	 * Handles the deletion of selected functionality definitions.
	 *
	 * Closes the delete confirmation dialog, then attempts to delete all selected items in parallel.
	 * On successful deletion, shows a success alert and triggers a revalidation.
	 * If an error occurs during deletion, displays an error alert with the relevant message.
	 *
	 * @async
	 * @returns {Promise<void>} A promise that resolves when the deletion process is complete.
	 */
	async function deleteItemHandler(): Promise<void> {
		try {
			setOpenDeleteDialog(false)
			if (selectedItems.length >= 1) {
				await Promise.all(
					selectedItems.map(async item => {
						await deleteFunctionalityDefinition({ id: item.id }).unwrap()
					})
				)
				dispatch(showAlert({ message: 'Functionality definition deleted', severity: 'success' }))
				revalidator.revalidate()
			}
		} catch (err: any) {
			const message = err?.data?.message || err?.message || 'Something went wrong'
			dispatch(showAlert({ message, severity: 'error' }))
		}
	}

	/**
	 * Opens the dialog for adding a new functionality definition by setting the `openAddDialog` state to `true`.
	 *
	 * @remarks
	 * This function is typically used as an event handler for UI elements (e.g., a button) that trigger the display of the add dialog.
	 */
	function handleClickAddOpen(): void {
		setOpenAddDialog(true)
	}

	/**
	 * Opens the edit dialog by setting the `openEditDialog` state to `true`.
	 * Typically used as an event handler for edit actions in the UI.
	 */
	function handleClickEditOpen(): void {
		setOpenEditDialog(true)
	}

	/**
	 * Opens the delete confirmation dialog by setting the `openDeleteDialog` state to `true`.
	 * Typically used as an event handler for delete actions in the admin functionality definition table.
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
	 * Closes the "Add" dialog by setting its open state to false.
	 *
	 * Typically used as an event handler to hide the dialog when the user cancels or completes an add operation.
	 */
	function handleCloseAdd(): void {
		setOpenAddDialog(false)
	}

	/**
	 * Closes the edit dialog by setting its open state to false.
	 *
	 * This function is typically used as an event handler to close
	 * the edit dialog in the AdminFunctionalityDefinitionTable component.
	 */
	function handleCloseEdit(): void {
		setOpenEditDialog(false)
	}

	return (
		<Box sx={{ textAlign: 'center' }}>
			<Box sx={{ textAlign: 'left' }}>
				<Box sx={{ display: 'flex' }}>
					<Icon sx={{ mr: '0.5rem' }}>
						<AssistantIcon />
					</Icon>
					<Typography variant='h6' component='p'>
						Functionality definitions database
					</Typography>
				</Box>
				<Typography component='span'>
					Your database containg all the functionality definitions you have registered.
				</Typography>
			</Box>
			<Box sx={{ mt: '2rem' }}>
				<Box sx={{ mb: '1rem', textAlign: 'right' }}>
					{isWritable && (
						<>
							{!isMobile ? (
								<Button variant='contained' type='button' size='medium' onClick={handleClickAddOpen}>
									Add new functionality definition
								</Button>
							) : (
								<IconButton type='button' size='small' color='primary' onClick={handleClickAddOpen}>
									<AddIcon />
								</IconButton>
							)}
							<AddAdminFunctionalityDefinitionDialog
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
									<AddAdminFunctionalityDefinitionDialog
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
					rows={functionalityDefinitions}
					columns={useMemo<GridColDef[]>(
						() => [
							{ field: 'id', headerName: 'ID', width: 100 },
							{ field: 'name', headerName: 'Name', width: 360 },
							{ field: 'description', headerName: 'Description', width: 360 },
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
