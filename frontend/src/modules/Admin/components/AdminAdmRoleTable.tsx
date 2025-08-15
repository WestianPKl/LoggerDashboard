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
import SecurityIcon from '@mui/icons-material/Security'
import PermIdentityIcon from '@mui/icons-material/PermIdentity'
import { DataGrid, type GridColDef, type GridRowSelectionModel } from '@mui/x-data-grid'
import type { IAddAdminRoleData, IAdminRolesTableProps } from '../scripts/IAdmin'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import type { AdminRoleClass } from '../scripts/AdminRoleClass'
import AddAdminRoleDialog from './AddAdminRoleDialog'
import AddRoleUserDialog from './AdminRoleUserDialog'
import AdminAddRolePermissionDialog from './AdminRolePermissionDialog'
import { showAlert } from '../../../store/application-store'
import { canWrite, canDelete } from '../../../store/auth-actions'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import {
	useAddAdminRoleMutation,
	useUpdateAdminRoleMutation,
	useDeleteAdminRoleMutation,
} from '../../../store/api/adminApi'
import { useRevalidator } from 'react-router'

/**
 * Renders a table displaying a list of admin roles with CRUD operations and assignment features.
 *
 * @component
 * @param {IAdminRolesTableProps} props - The props for the component.
 * @param {AdminRoleClass[]} props.admRoles - Array of admin role objects to display in the table.
 *
 * @remarks
 * - Provides actions for adding, editing, deleting, assigning users, and assigning permissions to roles.
 * - Supports responsive UI for mobile and desktop.
 * - Integrates with Redux for permissions and alert handling.
 * - Uses Material-UI DataGrid for tabular display and selection.
 * - Dialogs are used for add, edit, assign, permission, and delete operations.
 *
 * @example
 * ```tsx
 * <AdminAdmRoleTable admRoles={rolesArray} />
 * ```
 */
export default function AdminAdmRoleTable({ admRoles }: IAdminRolesTableProps) {
	const dispatch = useAppDispatch()
	const revalidator = useRevalidator()

	const [selectedItems, setSelectedItems] = useState<AdminRoleClass[]>([])
	const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>({
		type: 'include',
		ids: new Set(),
	})
	const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false)
	const [openAddDialog, setOpenAddDialog] = useState<boolean>(false)
	const [openEditDialog, setOpenEditDialog] = useState<boolean>(false)
	const [openAssignDialog, setOpenAssignDialog] = useState<boolean>(false)
	const [openPermissionDialog, setOpenPermissionDialog] = useState<boolean>(false)

	const isWritable = useAppSelector(state => canWrite('adm', 'admRole')(state))
	const isDeletable = useAppSelector(state => canDelete('adm', 'admRole')(state))

	const [addAdminRole] = useAddAdminRoleMutation()
	const [updateAdminRole] = useUpdateAdminRoleMutation()
	const [deleteAdminRole] = useDeleteAdminRoleMutation()

	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	const admRolesMap = useMemo(() => {
		const map = new Map()
		admRoles.forEach(item => {
			if (item.id) map.set(item.id, item)
		})
		return map
	}, [admRoles])

	useEffect(() => {
		const selectedIds = [...rowSelectionModel.ids]
		setSelectedItems(selectedIds.map(id => admRolesMap.get(Number(id))).filter(Boolean))
	}, [rowSelectionModel, admRolesMap])

	/**
	 * Clears the current selection by resetting the selected items array
	 * and updating the row selection model to an empty state.
	 *
	 * This function is typically used to deselect all items in the admin role table.
	 */
	function clearObject(): void {
		setSelectedItems([])
		setRowSelectionModel({
			type: 'include',
			ids: new Set(),
		})
	}

	/**
	 * Handles adding a new admin role or multiple roles.
	 *
	 * Closes the add dialog, attempts to add the provided role(s) via the API,
	 * shows a success alert on completion, and triggers a data revalidation.
	 * If an error occurs, displays an error alert with the relevant message.
	 *
	 * @param item - The admin role data to add, either a single object or an array of objects.
	 * @returns A promise that resolves when the operation is complete.
	 */
	async function addItemHandler(item: IAddAdminRoleData | IAddAdminRoleData[]): Promise<void> {
		try {
			setOpenAddDialog(false)
			if (!Array.isArray(item)) {
				await addAdminRole(item).unwrap()
			}
			dispatch(showAlert({ message: 'New role added', severity: 'success' }))
			revalidator.revalidate()
		} catch (err: any) {
			const message = err?.data?.message || err?.message || 'Something went wrong'
			dispatch(showAlert({ message, severity: 'error' }))
		}
	}

	/**
	 * Handles editing of one or multiple admin roles.
	 *
	 * Closes the edit dialog, updates the provided admin role(s) via API,
	 * shows a success alert on completion, clears the form object, and triggers a revalidation.
	 * If an error occurs, displays an error alert with the relevant message.
	 *
	 * @param items - A single admin role data object or an array of such objects to be updated.
	 * @returns A Promise that resolves when the operation is complete.
	 */
	async function editItemHandler(items: IAddAdminRoleData | IAddAdminRoleData[]): Promise<void> {
		try {
			setOpenEditDialog(false)
			if (Array.isArray(items) && items.length >= 1) {
				await Promise.all(
					items.map(async item => {
						await updateAdminRole(item).unwrap()
					})
				)
				dispatch(showAlert({ message: 'Role edited', severity: 'success' }))
				clearObject()
				revalidator.revalidate()
			}
		} catch (err: any) {
			const message = err?.data?.message || err?.message || 'Something went wrong'
			dispatch(showAlert({ message, severity: 'error' }))
		}
	}

	/**
	 * Handles the deletion of selected admin roles.
	 *
	 * Closes the delete confirmation dialog, then attempts to delete all selected roles
	 * by calling the `deleteAdminRole` API for each selected item. If all deletions succeed,
	 * shows a success alert and triggers a revalidation. If any error occurs during deletion,
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
						await deleteAdminRole({ id: item.id }).unwrap()
					})
				)
				dispatch(showAlert({ message: 'Role deleted', severity: 'success' }))
				revalidator.revalidate()
			}
		} catch (err: any) {
			const message = err?.data?.message || err?.message || 'Something went wrong'
			dispatch(showAlert({ message, severity: 'error' }))
		}
	}

	/**
	 * Opens the "Add" dialog by setting the `openAddDialog` state to `true`.
	 * Typically used as an event handler for triggering the addition of a new item or entry.
	 */
	function handleClickAddOpen(): void {
		setOpenAddDialog(true)
	}

	/**
	 * Opens the edit dialog by setting the `openEditDialog` state to `true`.
	 * Typically used as an event handler for edit actions in the admin role table.
	 */
	function handleClickEditOpen(): void {
		setOpenEditDialog(true)
	}

	/**
	 * Opens the assign dialog by setting the `openAssignDialog` state to `true`.
	 * Typically used as an event handler for triggering the assignment UI.
	 */
	function handleClickAssignOpen(): void {
		setOpenAssignDialog(true)
	}

	/**
	 * Opens the permission dialog by setting the `openPermissionDialog` state to `true`.
	 *
	 * This function is typically used as an event handler to trigger the display
	 * of the permission dialog in the admin role table component.
	 */
	function handleClickPermissionOpen(): void {
		setOpenPermissionDialog(true)
	}

	/**
	 * Opens the delete confirmation dialog by setting the `openDeleteDialog` state to `true`.
	 * Typically used as an event handler for delete actions in the admin role table.
	 */
	function handleClickDeleteOpen(): void {
		setOpenDeleteDialog(true)
	}

	/**
	 * Closes the delete confirmation dialog by setting its open state to false.
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
	 * Typically used as a handler for dialog close events.
	 */
	function handleCloseEdit(): void {
		setOpenEditDialog(false)
	}

	/**
	 * Closes the assign dialog by setting its open state to false.
	 *
	 * This function is typically used as an event handler to close
	 * the assignment dialog in the admin role table component.
	 */
	function handleCloseAssign(): void {
		setOpenAssignDialog(false)
	}

	/**
	 * Closes the permission dialog by setting its open state to false.
	 *
	 * This function is typically used as an event handler to close
	 * the permission dialog in the admin role table component.
	 */
	function handleClosePermission(): void {
		setOpenPermissionDialog(false)
	}

	return (
		<Box sx={{ textAlign: 'center' }}>
			<Box sx={{ textAlign: 'left' }}>
				<Box sx={{ display: 'flex' }}>
					<Icon sx={{ mr: '0.5rem' }}>
						<AdminPanelSettingsIcon />
					</Icon>
					<Typography variant='h6' component='p'>
						Roles database
					</Typography>
				</Box>
				<Typography component='span'>Your database containg all the roles you have registered.</Typography>
			</Box>
			<Box sx={{ mt: '2rem' }}>
				<Box sx={{ mb: '1rem', textAlign: 'right' }}>
					{isWritable && (
						<>
							{!isMobile ? (
								<Button variant='contained' type='button' size='medium' onClick={handleClickAddOpen}>
									Add new role
								</Button>
							) : (
								<IconButton type='button' size='small' color='primary' onClick={handleClickAddOpen}>
									<AddIcon />
								</IconButton>
							)}
							<AddAdminRoleDialog
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
									<AddAdminRoleDialog
										edit={true}
										handleCloseAdd={handleCloseEdit}
										openAddDialog={openEditDialog}
										selectedItems={selectedItems}
										addItemHandler={editItemHandler}
									/>
								</>
							)}
							{isWritable && (
								<>
									{!isMobile ? (
										<Button
											sx={{ ml: '0.3rem' }}
											variant='contained'
											color='info'
											type='button'
											size={isMobile ? 'small' : 'medium'}
											onClick={handleClickAssignOpen}>
											Assign users
										</Button>
									) : (
										<IconButton
											sx={{ ml: '0.3rem' }}
											color='info'
											type='button'
											size={isMobile ? 'small' : 'medium'}
											onClick={handleClickAssignOpen}>
											<PermIdentityIcon />
										</IconButton>
									)}
									<AddRoleUserDialog
										handleCloseAdd={handleCloseAssign}
										openAddDialog={openAssignDialog}
										selectedItems={selectedItems}
									/>
								</>
							)}
							{isWritable && (
								<>
									{!isMobile ? (
										<Button
											sx={{ ml: '0.3rem' }}
											variant='contained'
											color='info'
											type='button'
											size={isMobile ? 'small' : 'medium'}
											onClick={handleClickPermissionOpen}>
											Assign permissions
										</Button>
									) : (
										<IconButton
											sx={{ ml: '0.3rem' }}
											color='info'
											type='button'
											size={isMobile ? 'small' : 'medium'}
											onClick={handleClickPermissionOpen}>
											<SecurityIcon />
										</IconButton>
									)}
									<AdminAddRolePermissionDialog
										handleCloseAdd={handleClosePermission}
										openAddDialog={openPermissionDialog}
										selectedItems={selectedItems}
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
					rows={admRoles}
					columns={useMemo<GridColDef[]>(
						() => [
							{ field: 'id', headerName: 'ID', width: 100 },
							{ field: 'name', headerName: 'Name', width: 360 },
							{ field: 'description', headerName: 'Description', width: 360 },
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
								width: 150,
								valueGetter: (_, row) => `${row.createdAt.replace('T', ' ').replace('Z', ' ').split('.')[0]}`,
							},
							{
								field: 'updatedAt',
								headerName: 'Update date',
								width: 150,
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
