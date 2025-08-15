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
import type { IAddAccessLevelDefinitionData, IAccessLevelDefinitionTableProps } from '../scripts/IAdmin'
import SwitchAccessShortcutAddIcon from '@mui/icons-material/SwitchAccessShortcutAdd'
import type { AccessLevelDefinitionClass } from '../scripts/AccessLevelDefinitionClass'
import AddAdminAccessLevelDefinitionDialog from './AddAdminAccessLevelDefinitionDialog'
import { showAlert } from '../../../store/application-store'
import { canWrite, canDelete } from '../../../store/auth-actions'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import {
	useAddAccessLevelDefinitionMutation,
	useUpdateAccessLevelDefinitionMutation,
	useDeleteAccessLevelDefinitionMutation,
} from '../../../store/api/adminApi'
import { useRevalidator } from 'react-router'

/**
 * Renders a table displaying access level definitions for the admin module.
 *
 * This component provides CRUD (Create, Read, Update, Delete) operations for access level definitions,
 * including add, edit, and delete functionalities, with permission checks for each action.
 * It uses Material UI's DataGrid for displaying the data and supports responsive layouts for mobile devices.
 * Dialogs are used for adding, editing, and confirming deletion of access level definitions.
 *
 * @component
 * @param {IAccessLevelDefinitionTableProps} props - The props for the component.
 * @param {AccessLevelDefinitionClass[]} props.accessLevels - The list of access level definitions to display in the table.
 *
 * @returns {JSX.Element} The rendered AdminAccessLevelDefinitionTable component.
 *
 * @example
 * <AdminAccessLevelDefinitionTable accessLevels={accessLevels} />
 */
export default function AdminAccessLevelDefinitionTable({ accessLevels }: IAccessLevelDefinitionTableProps) {
	const dispatch = useAppDispatch()
	const revalidator = useRevalidator()

	const [selectedItems, setSelectedItems] = useState<AccessLevelDefinitionClass[]>([])
	const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>({
		type: 'include',
		ids: new Set(),
	})
	const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false)
	const [openAddDialog, setOpenAddDialog] = useState<boolean>(false)
	const [openEditDialog, setOpenEditDialog] = useState<boolean>(false)

	const isWritable = useAppSelector(state => canWrite('adm', 'admFunctionalityDefinition')(state))
	const isDeletable = useAppSelector(state => canDelete('adm', 'admFunctionalityDefinition')(state))

	const [addAccessLevelDefinition] = useAddAccessLevelDefinitionMutation()
	const [updateAccessLevelDefinition] = useUpdateAccessLevelDefinitionMutation()
	const [deleteAccessLevelDefinition] = useDeleteAccessLevelDefinitionMutation()

	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	const accessLevelsMap = useMemo(() => {
		const map = new Map()
		accessLevels.forEach(item => {
			if (item.id) map.set(item.id, item)
		})
		return map
	}, [accessLevels])

	useEffect(() => {
		const selectedIds = [...rowSelectionModel.ids]
		setSelectedItems(selectedIds.map(id => accessLevelsMap.get(Number(id))).filter(Boolean))
	}, [rowSelectionModel, accessLevelsMap])

	/**
	 * Clears the current selection by resetting the selected items array
	 * and initializing the row selection model to an empty state.
	 *
	 * This function is typically used to deselect all items in the table.
	 */
	function clearObject(): void {
		setSelectedItems([])
		setRowSelectionModel({
			type: 'include',
			ids: new Set(),
		})
	}

	/**
	 * Handles the addition of a new access level definition or multiple definitions.
	 *
	 * Closes the add dialog, attempts to add the provided item(s) via the API,
	 * shows a success alert on success, and triggers a data revalidation.
	 * If an error occurs, displays an error alert with the relevant message.
	 *
	 * @param item - The access level definition data to add, either a single item or an array of items.
	 * @returns A promise that resolves when the operation is complete.
	 */
	async function addItemHandler(item: IAddAccessLevelDefinitionData | IAddAccessLevelDefinitionData[]): Promise<void> {
		try {
			setOpenAddDialog(false)
			if (!Array.isArray(item)) {
				await addAccessLevelDefinition(item).unwrap()
			}
			dispatch(showAlert({ message: 'New access definition added', severity: 'success' }))
			revalidator.revalidate()
		} catch (err: any) {
			const message = err?.data?.message || err?.message || 'Something went wrong'
			dispatch(showAlert({ message, severity: 'error' }))
		}
	}

	/**
	 * Handles editing of one or multiple access level definition items.
	 *
	 * Closes the edit dialog, updates the provided item(s) via the `updateAccessLevelDefinition` API,
	 * and shows a success alert upon completion. If an error occurs during the update process,
	 * an error alert is displayed with the relevant message.
	 * After successful updates, clears the form/object and triggers a revalidation.
	 *
	 * @param items - A single access level definition item or an array of such items to be edited.
	 * @returns A Promise that resolves when all updates are complete.
	 */
	async function editItemHandler(
		items: IAddAccessLevelDefinitionData | IAddAccessLevelDefinitionData[]
	): Promise<void> {
		try {
			setOpenEditDialog(false)
			if (Array.isArray(items) && items.length >= 1) {
				await Promise.all(
					items.map(async item => {
						await updateAccessLevelDefinition(item).unwrap()
					})
				)
				dispatch(showAlert({ message: 'Access definition edited', severity: 'success' }))
				clearObject()
				revalidator.revalidate()
			}
		} catch (err: any) {
			const message = err?.data?.message || err?.message || 'Something went wrong'
			dispatch(showAlert({ message, severity: 'error' }))
		}
	}

	/**
	 * Handles the deletion of selected access level definitions.
	 *
	 * Closes the delete confirmation dialog, then attempts to delete all selected items
	 * by calling the `deleteAccessLevelDefinition` API for each. If successful, shows a success alert
	 * and triggers a revalidation of the data. If an error occurs, displays an error alert with the error message.
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
						await deleteAccessLevelDefinition({ id: item.id }).unwrap()
					})
				)
				dispatch(showAlert({ message: 'Access definition deleted', severity: 'success' }))
				revalidator.revalidate()
			}
		} catch (err: any) {
			const message = err?.data?.message || err?.message || 'Something went wrong'
			dispatch(showAlert({ message, severity: 'error' }))
		}
	}

	/**
	 * Opens the dialog for adding a new access level definition by setting the `openAddDialog` state to `true`.
	 *
	 * @remarks
	 * This function is typically used as an event handler for UI elements (e.g., a button) that trigger the display of the add dialog.
	 */
	function handleClickAddOpen(): void {
		setOpenAddDialog(true)
	}

	/**
	 * Opens the edit dialog by setting the `openEditDialog` state to `true`.
	 * Typically used as an event handler for edit actions in the access level definition table.
	 */
	function handleClickEditOpen(): void {
		setOpenEditDialog(true)
	}

	/**
	 * Opens the delete confirmation dialog by setting the `openDeleteDialog` state to `true`.
	 * Typically used as an event handler for delete actions in the admin access level definition table.
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
	 * This function is typically used as an event handler to hide the dialog
	 * when the user cancels or completes the add operation.
	 */
	function handleCloseAdd(): void {
		setOpenAddDialog(false)
	}

	/**
	 * Closes the edit dialog by setting the open state to false.
	 *
	 * This function is typically used as an event handler to close
	 * the edit dialog in the Admin Access Level Definition Table component.
	 */
	function handleCloseEdit(): void {
		setOpenEditDialog(false)
	}

	return (
		<Box sx={{ textAlign: 'center' }}>
			<Box sx={{ textAlign: 'left' }}>
				<Box sx={{ display: 'flex' }}>
					<Icon sx={{ mr: '0.5rem' }}>
						<SwitchAccessShortcutAddIcon />
					</Icon>
					<Typography variant='h6' component='p'>
						Access definitions database
					</Typography>
				</Box>
				<Typography component='span'>Your database containg all the access definitions you have registered.</Typography>
			</Box>
			<Box sx={{ mt: '2rem' }}>
				<Box sx={{ mb: '1rem', textAlign: 'right' }}>
					{isWritable && (
						<>
							{!isMobile ? (
								<Button variant='contained' type='button' size='medium' onClick={handleClickAddOpen}>
									Add new access level
								</Button>
							) : (
								<IconButton type='button' size='small' color='primary' onClick={handleClickAddOpen}>
									<AddIcon />
								</IconButton>
							)}
							<AddAdminAccessLevelDefinitionDialog
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
									<AddAdminAccessLevelDefinitionDialog
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
					rows={accessLevels}
					columns={useMemo<GridColDef[]>(
						() => [
							{ field: 'id', headerName: 'ID', width: 100 },
							{ field: 'name', headerName: 'Name', width: 360 },
							{ field: 'accessLevel', headerName: 'Access level', width: 360 },
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
