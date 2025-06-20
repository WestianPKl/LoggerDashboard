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

	async function addItemHandler(item: IAddAdminRolePermissionData | IAddAdminRolePermissionData[]) {
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

	async function deleteItemHandler() {
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
					initialState={{ pagination: { paginationModel } }}
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
