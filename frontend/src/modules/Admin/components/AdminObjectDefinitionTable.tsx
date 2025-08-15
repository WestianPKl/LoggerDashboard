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
import type { IAddObjectDefinitionData, IObjectDefinitionTableProps } from '../scripts/IAdmin'
import DataObjectIcon from '@mui/icons-material/DataObject'
import type { ObjectDefinitionClass } from '../scripts/ObjectDefinitionClass'
import AddAdminObjectDefinitionDialog from './AddAdminObjectDefinitionDialog'
import { showAlert } from '../../../store/application-store'
import { canWrite, canDelete } from '../../../store/auth-actions'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import {
	useAddObjectDefinitionMutation,
	useUpdateObjectDefinitionMutation,
	useDeleteObjectDefinitionMutation,
} from '../../../store/api/adminApi'
import { useRevalidator } from 'react-router'

/**
 * Renders a table displaying a list of object definitions with CRUD (Create, Read, Update, Delete) capabilities.
 *
 * This component provides an interface for managing object definitions, including adding, editing, and deleting entries.
 * It supports selection of rows, responsive design for mobile devices, and permission-based access to actions.
 *
 * @component
 * @param {IObjectDefinitionTableProps} props - The props for the component.
 * @param {ObjectDefinitionClass[]} props.objectDefinitions - The array of object definitions to display in the table.
 *
 * @returns {JSX.Element} The rendered AdminObjectDefinitionTable component.
 *
 * @remarks
 * - Requires Redux store for dispatching actions and selecting permissions.
 * - Uses Material-UI components for layout and dialogs.
 * - Integrates with RTK Query mutations for data operations.
 * - Displays alerts on operation success or failure.
 * - Only users with appropriate permissions can add, edit, or delete object definitions.
 */
export default function AdminObjectDefinitionTable({ objectDefinitions }: IObjectDefinitionTableProps) {
	const dispatch = useAppDispatch()
	const revalidator = useRevalidator()

	const [selectedItems, setSelectedItems] = useState<ObjectDefinitionClass[]>([])
	const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>({
		type: 'include',
		ids: new Set(),
	})
	const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false)
	const [openAddDialog, setOpenAddDialog] = useState<boolean>(false)
	const [openEditDialog, setOpenEditDialog] = useState<boolean>(false)

	const isWritable = useAppSelector(state => canWrite('adm', 'admObjectDefinition')(state))
	const isDeletable = useAppSelector(state => canDelete('adm', 'admObjectDefinition')(state))

	const [addObjectDefinition] = useAddObjectDefinitionMutation()
	const [updateObjectDefinition] = useUpdateObjectDefinitionMutation()
	const [deleteObjectDefinition] = useDeleteObjectDefinitionMutation()

	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	const objectDefinitionsMap = useMemo(() => {
		const map = new Map()
		objectDefinitions.forEach(item => {
			if (item.id) map.set(item.id, item)
		})
		return map
	}, [objectDefinitions])

	useEffect(() => {
		const selectedIds = [...rowSelectionModel.ids]
		setSelectedItems(selectedIds.map(id => objectDefinitionsMap.get(Number(id))).filter(Boolean))
	}, [rowSelectionModel, objectDefinitionsMap])

	/**
	 * Clears the current object selection by resetting the selected items array
	 * and updating the row selection model to an empty state.
	 *
	 * This function sets the selected items to an empty array and initializes
	 * the row selection model with an 'include' type and an empty set of IDs.
	 * Typically used to reset selection state in the admin object definition table.
	 */
	function clearObject(): void {
		setSelectedItems([])
		setRowSelectionModel({
			type: 'include',
			ids: new Set(),
		})
	}

	/**
	 * Handles adding a new object definition or multiple definitions.
	 *
	 * Closes the add dialog, attempts to add the provided item(s) via the `addObjectDefinition` API,
	 * and displays a success alert upon completion. If an error occurs, displays an error alert with
	 * the relevant message. Also triggers a revalidation after a successful addition.
	 *
	 * @param item - The object definition data to add, either a single item or an array of items.
	 * @returns A promise that resolves when the operation is complete.
	 */
	async function addItemHandler(item: IAddObjectDefinitionData | IAddObjectDefinitionData[]): Promise<void> {
		try {
			setOpenAddDialog(false)
			if (!Array.isArray(item)) {
				await addObjectDefinition(item).unwrap()
			}
			dispatch(showAlert({ message: 'New object definition added', severity: 'success' }))
			revalidator.revalidate()
		} catch (err: any) {
			const message = err?.data?.message || err?.message || 'Something went wrong'
			dispatch(showAlert({ message, severity: 'error' }))
		}
	}

	/**
	 * Handles editing of one or multiple object definitions.
	 *
	 * Closes the edit dialog, updates the provided object definition(s) via an API call,
	 * shows a success alert on completion, clears the current object, and triggers a revalidation.
	 * If an error occurs during the update process, displays an error alert with the relevant message.
	 *
	 * @param items - A single object definition or an array of object definitions to be edited.
	 * @returns A Promise that resolves when all updates are complete.
	 */
	async function editItemHandler(items: IAddObjectDefinitionData | IAddObjectDefinitionData[]): Promise<void> {
		try {
			setOpenEditDialog(false)
			if (Array.isArray(items) && items.length >= 1) {
				await Promise.all(
					items.map(async item => {
						await updateObjectDefinition(item).unwrap()
					})
				)
				dispatch(showAlert({ message: 'Object definition edited', severity: 'success' }))
				clearObject()
				revalidator.revalidate()
			}
		} catch (err: any) {
			const message = err?.data?.message || err?.message || 'Something went wrong'
			dispatch(showAlert({ message, severity: 'error' }))
		}
	}

	/**
	 * Handles the deletion of selected object definitions.
	 *
	 * Closes the delete confirmation dialog, then attempts to delete all selected items in parallel.
	 * On successful deletion, shows a success alert and triggers a data revalidation.
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
						await deleteObjectDefinition({ id: item.id }).unwrap()
					})
				)
				dispatch(showAlert({ message: 'Object definition deleted', severity: 'success' }))
				revalidator.revalidate()
			}
		} catch (err: any) {
			const message = err?.data?.message || err?.message || 'Something went wrong'
			dispatch(showAlert({ message, severity: 'error' }))
		}
	}

	/**
	 * Opens the dialog for adding a new object definition by setting the `openAddDialog` state to true.
	 *
	 * @remarks
	 * This function is typically used as an event handler for UI elements that trigger the add dialog.
	 */
	function handleClickAddOpen(): void {
		setOpenAddDialog(true)
	}

	/**
	 * Opens the edit dialog by setting the `openEditDialog` state to true.
	 * Typically used as an event handler for edit actions in the admin object definition table.
	 */
	function handleClickEditOpen(): void {
		setOpenEditDialog(true)
	}

	/**
	 * Opens the delete confirmation dialog by setting the `openDeleteDialog` state to `true`.
	 *
	 * Typically used as an event handler for delete actions in the admin object definition table.
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
	 * Closes the "Add" dialog by setting its open state to false.
	 *
	 * Typically used as an event handler for dialog close actions.
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
						<DataObjectIcon />
					</Icon>
					<Typography variant='h6' component='p'>
						Object definitions database
					</Typography>
				</Box>
				<Typography component='span'>Your database containg all the object definitions you have registered.</Typography>
			</Box>
			<Box sx={{ mt: '2rem' }}>
				<Box sx={{ mb: '1rem', textAlign: 'right' }}>
					{isWritable && (
						<>
							{!isMobile ? (
								<Button variant='contained' type='button' size='medium' onClick={handleClickAddOpen}>
									Add new object definition
								</Button>
							) : (
								<IconButton type='button' size='small' color='primary' onClick={handleClickAddOpen}>
									<AddIcon />
								</IconButton>
							)}
							<AddAdminObjectDefinitionDialog
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
									<AddAdminObjectDefinitionDialog
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
					rows={objectDefinitions}
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
