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

	const columns = useMemo<GridColDef[]>(
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
	)

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

	function clearObject() {
		setSelectedItems([])
		setRowSelectionModel({
			type: 'include',
			ids: new Set(),
		})
	}

	async function addItemHandler(item: IAddAdminRoleData | IAddAdminRoleData[]) {
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

	async function editItemHandler(items: IAddAdminRoleData | IAddAdminRoleData[]) {
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

	async function deleteItemHandler() {
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

	function handleClickAddOpen() {
		setOpenAddDialog(true)
	}

	function handleClickEditOpen() {
		setOpenEditDialog(true)
	}

	function handleClickAssignOpen() {
		setOpenAssignDialog(true)
	}

	function handleClickPermissionOpen() {
		setOpenPermissionDialog(true)
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

	function handleCloseAssign() {
		setOpenAssignDialog(false)
	}

	function handleClosePermission() {
		setOpenPermissionDialog(false)
	}

	const paginationModel = { page: 0, pageSize: 15 }
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
					columns={columns}
					initialState={{ pagination: { paginationModel } }}
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
