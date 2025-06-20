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
import type { UserClass } from '../../User/scripts/UserClass'
import { useAddAdminRoleUserMutation, useDeleteAdminRoleUserMutation } from '../../../store/api/adminApi'
import type { IAddAdminRoleUserDataDialog } from '../../Admin/scripts/IAdmin'
import GroupIcon from '@mui/icons-material/Group'
import type { IRoleUserPermissionProps } from '../../Admin/scripts/IAdmin'
import AddUserRoleDialog from '../../Admin/components/AddAdminRoleUserDialog'
import { useRevalidator } from 'react-router'

export default function AdminRoleUserTable({ usersData, roleId, isAdmin }: IRoleUserPermissionProps) {
	const dispatch = useAppDispatch()
	const revalidator = useRevalidator()

	const [selectedItems, setSelectedItems] = useState<UserClass[]>([])
	const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>({
		type: 'include',
		ids: new Set(),
	})

	const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false)
	const [openAddDialog, setOpenAddDialog] = useState<boolean>(false)

	const [addAdminRoleUser] = useAddAdminRoleUserMutation()
	const [deleteAdminRoleUser] = useDeleteAdminRoleUserMutation()

	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	const columns = useMemo<GridColDef[]>(
		() => [
			{ field: 'id', headerName: 'ID', width: 50 },
			{
				field: 'username',
				headerName: 'Username',
				width: 300,
				valueGetter: (_, row) => `${row.username ? row.username : '-'}`,
			},
			{
				field: 'email',
				headerName: 'Email',
				width: 300,
				valueGetter: (_, row) => `${row.email ? row.email : '-'}`,
			},
		],
		[]
	)

	const usersDataMap = useMemo(() => {
		const map = new Map()
		usersData.forEach(item => {
			if (item.id) map.set(item.id, item)
		})
		return map
	}, [usersData])

	useEffect(() => {
		const selectedIds = [...rowSelectionModel.ids]
		setSelectedItems(selectedIds.map(id => usersDataMap.get(Number(id))).filter(Boolean))
	}, [rowSelectionModel, usersDataMap])

	async function addItemHandler(item: IAddAdminRoleUserDataDialog | IAddAdminRoleUserDataDialog[]) {
		try {
			setOpenAddDialog(false)
			if (!Array.isArray(item)) {
				if (item.user && item.user.length > 0) {
					await Promise.all(
						item.user.map(async user => {
							await addAdminRoleUser({ roleId: item.roleId, userId: user.id }).unwrap()
						})
					)
				}
			}
			dispatch(showAlert({ message: 'User added', severity: 'success' }))
			revalidator.revalidate()
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
						await deleteAdminRoleUser({ userId: item.id, roleId: roleId }).unwrap()
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

	function handleClickAddOpen() {
		setOpenAddDialog(true)
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

	const paginationModel = { page: 0, pageSize: 15 }
	return (
		<Box sx={{ textAlign: 'center' }}>
			<Box sx={{ textAlign: 'left' }}>
				<Box sx={{ display: 'flex' }}>
					<Icon sx={{ mr: '0.5rem' }}>
						<GroupIcon />
					</Icon>
					<Typography variant='h6' component='p'>
						Role Users
					</Typography>
				</Box>
				<Typography component='span'>Database containg all the role users.</Typography>
				<Box sx={{ mt: '2rem' }}>
					<Box sx={{ mb: '1rem', textAlign: 'right' }}>
						{isAdmin && roleId && (
							<>
								{!isMobile ? (
									<Button variant='contained' type='button' size='medium' onClick={handleClickAddOpen}>
										Add new user
									</Button>
								) : (
									<IconButton type='button' size='small' color='primary' onClick={handleClickAddOpen}>
										<AddIcon />
									</IconButton>
								)}
								<AddUserRoleDialog
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
					rows={usersData}
					columns={columns}
					initialState={{ pagination: { paginationModel } }}
					pageSizeOptions={[15, 30, 45]}
					disableRowSelectionOnClick={true}
					checkboxSelection={isAdmin && roleId ? true : false}
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
