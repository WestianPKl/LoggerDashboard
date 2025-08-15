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
import DeleteIcon from '@mui/icons-material/Delete'
import { showAlert } from '../../../store/application-store'
import { useAppDispatch } from '../../../store/hooks'
import { DataGrid, type GridColDef, type GridRowSelectionModel } from '@mui/x-data-grid'
import SecurityIcon from '@mui/icons-material/Security'
import type { IUserPermissionProps } from '../scripts/IUser'
import type { PermissionClass } from '../../Admin/scripts/PermissionClass'
import { useAddPermissionMutation, useDeletePermissionMutation } from '../../../store/api/adminApi'
import type { IAddAdminRolePermissionData } from '../../Admin/scripts/IAdmin'
import AddUserPermissionDialog from '../../Admin/components/AddAdminUserPermissionDialog'
import { useRevalidator } from 'react-router'

/**
 * Renders a table displaying user or role permissions with options to add or delete permissions.
 *
 * @component
 * @param {IUserPermissionProps} props - The props for the UserPermissionTable component.
 * @param {PermissionClass[]} props.permissionData - Array of permission objects to display in the table.
 * @param {boolean} props.isAdmin - Indicates if the current user has admin privileges, enabling add/delete actions.
 * @param {number | undefined} [props.userId] - The ID of the user whose permissions are being managed (optional).
 * @param {number | undefined} [props.roleId] - The ID of the role whose permissions are being managed (optional).
 *
 * @returns {JSX.Element} The rendered UserPermissionTable component.
 *
 * @remarks
 * - Allows admins to add or delete permissions for a user or role.
 * - Uses Material UI DataGrid for displaying permissions.
 * - Responsive design adapts controls for mobile and desktop.
 * - Integrates with Redux for dispatching alerts and RTK Query for mutations.
 */
export default function UserPermissionTable({ permissionData, isAdmin, userId, roleId }: IUserPermissionProps) {
	const dispatch = useAppDispatch()
	const revalidator = useRevalidator()

	const [selectedItems, setSelectedItems] = useState<PermissionClass[]>([])
	const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>({
		type: 'include',
		ids: new Set(),
	})

	const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false)
	const [openAddDialog, setOpenAddDialog] = useState<boolean>(false)

	const [addPermission] = useAddPermissionMutation()
	const [deletePermission] = useDeletePermissionMutation()

	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	const columns = useMemo<GridColDef[]>(
		() => [
			{ field: 'id', headerName: 'ID', width: 80 },
			{
				field: 'functionalityDefinition.name',
				headerName: 'Functionality',
				width: 300,
				valueGetter: (_, row) =>
					`${row.functionalityDefinition && row.functionalityDefinition.name ? row.functionalityDefinition.name : '-'}`,
			},
			{
				field: 'objectDefinition.name',
				headerName: 'Object',
				width: 300,
				valueGetter: (_, row) =>
					`${row.objectDefinition && row.objectDefinition.name ? row.objectDefinition.name : '-'}`,
			},
			{
				field: 'accessLevelDefinition.name',
				headerName: 'Access level',
				width: 200,
				valueGetter: (_, row) =>
					`${row.accessLevelDefinition && row.accessLevelDefinition.name ? row.accessLevelDefinition.name : '-'}`,
			},
		],
		[]
	)

	const permissionDataMap = useMemo(() => {
		const map = new Map()
		permissionData.forEach(item => {
			if (item.id) map.set(item.id, item)
		})
		return map
	}, [permissionData])

	useEffect(() => {
		const selectedIds = [...rowSelectionModel.ids]
		setSelectedItems(selectedIds.map(id => permissionDataMap.get(Number(id))).filter(Boolean))
	}, [rowSelectionModel, permissionDataMap])

	/**
	 * Handles adding a new permission item or an array of items.
	 *
	 * Closes the add dialog, attempts to add the permission(s) via the `addPermission` API,
	 * and shows a success alert upon completion. If an error occurs, displays an error alert.
	 * After a successful addition, triggers a revalidation of the data.
	 *
	 * @param item - The permission data to add, either a single item or an array of items.
	 * @returns A promise that resolves when the operation is complete.
	 */
	async function addItemHandler(item: IAddAdminRolePermissionData | IAddAdminRolePermissionData[]): Promise<void> {
		try {
			setOpenAddDialog(false)
			if (!Array.isArray(item)) {
				await addPermission(item).unwrap()
			}
			dispatch(showAlert({ message: 'Permission added', severity: 'success' }))
			revalidator.revalidate()
		} catch (err: any) {
			dispatch(showAlert({ message: err.message, severity: 'error' }))
		}
	}

	/**
	 * Handles the deletion of selected permission items.
	 *
	 * Closes the delete confirmation dialog, then attempts to delete all selected items in parallel.
	 * On successful deletion, displays a success alert and triggers a data revalidation.
	 * If an error occurs during deletion, displays an error alert with the error message.
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
						await deletePermission({ id: item.id }).unwrap()
					})
				)
				dispatch(showAlert({ message: 'Equipment vendor deleted', severity: 'success' }))
				revalidator.revalidate()
			}
		} catch (err: any) {
			dispatch(showAlert({ message: err.message, severity: 'error' }))
		}
	}

	/**
	 * Opens the dialog for adding a new user permission by setting the `openAddDialog` state to true.
	 */
	function handleClickAddOpen(): void {
		setOpenAddDialog(true)
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
	 * ensuring the dialog is no longer visible.
	 */
	function handleCloseDelete(): void {
		setOpenDeleteDialog(false)
	}

	/**
	 * Closes the "Add" dialog by setting its open state to false.
	 *
	 * This function is typically used as an event handler to close
	 * the dialog for adding new items or permissions in the user interface.
	 */
	function handleCloseAdd(): void {
		setOpenAddDialog(false)
	}

	return (
		<Box sx={{ textAlign: 'center' }}>
			<Box sx={{ textAlign: 'left' }}>
				<Box sx={{ display: 'flex' }}>
					<Icon sx={{ mr: '0.5rem' }}>
						<SecurityIcon />
					</Icon>
					<Typography variant='h6' component='p'>
						Permissions
					</Typography>
				</Box>
				<Typography component='span'>Database containg all permissions.</Typography>
				<Box sx={{ mt: '2rem' }}>
					<Box sx={{ mb: '1rem', textAlign: 'right' }}>
						{isAdmin && (userId || roleId) && (
							<>
								{!isMobile ? (
									<Button variant='contained' type='button' size='medium' onClick={handleClickAddOpen}>
										Add new permission
									</Button>
								) : (
									<IconButton type='button' size='small' color='primary' onClick={handleClickAddOpen}>
										<AddIcon />
									</IconButton>
								)}
								<AddUserPermissionDialog
									userId={userId}
									roleId={roleId}
									handleCloseAdd={handleCloseAdd}
									openAddDialog={openAddDialog}
									addItemHandler={addItemHandler}
								/>

								{selectedItems.length > 0 && (
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
					</Box>
				</Box>
			</Box>
			<Box sx={{ mt: '2rem' }}>
				<DataGrid
					rows={permissionData}
					columns={columns}
					initialState={{ pagination: { paginationModel: { page: 0, pageSize: 15 } } }}
					pageSizeOptions={[15, 30, 45]}
					disableRowSelectionOnClick={true}
					checkboxSelection={isAdmin && (userId || roleId) ? true : false}
					sx={{ border: 0 }}
					density='compact'
					disableColumnResize={true}
					disableColumnSelector={true}
					disableVirtualization={true}
					onRowSelectionModelChange={newRowSelectionModel => {
						setRowSelectionModel(newRowSelectionModel)
					}}
					rowSelectionModel={rowSelectionModel}
				/>
			</Box>
		</Box>
	)
}
