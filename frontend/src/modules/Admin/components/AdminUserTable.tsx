import { useState, useEffect, useMemo } from 'react'
import { Box, Typography, Icon, Button, useMediaQuery, useTheme, IconButton } from '@mui/material'
import SecurityIcon from '@mui/icons-material/Security'
import PermIdentityIcon from '@mui/icons-material/PermIdentity'
import { DataGrid, type GridColDef, type GridRowSelectionModel } from '@mui/x-data-grid'
import type { IUserTableProps } from '../scripts/IAdmin'
import type { UserClass } from '../../User/scripts/UserClass'
import AdminUserPermissionDialog from './AdminUserPermissionDialog'
import formatLocalDateTime from '../../../components/scripts/ComponentsInterface'

export default function AdminUserTable({ users }: IUserTableProps) {
	const [selectedItems, setSelectedItems] = useState<UserClass[]>([])
	const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>({
		type: 'include',
		ids: new Set(),
	})
	const [openPermissionDialog, setOpenPermissionDialog] = useState<boolean>(false)

	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	const usersMap = useMemo(() => {
		const map = new Map()
		users.forEach(item => {
			if (item.id) map.set(item.id, item)
		})
		return map
	}, [users])

	useEffect(() => {
		const selectedIds = [...rowSelectionModel.ids]
		setSelectedItems(selectedIds.map(id => usersMap.get(Number(id))).filter(Boolean))
	}, [rowSelectionModel, usersMap])

	function handleClickPermissionOpen(): void {
		setOpenPermissionDialog(true)
	}
	function handleClosePermission(): void {
		setOpenPermissionDialog(false)
	}

	return (
		<Box sx={{ textAlign: 'center' }}>
			<Box sx={{ textAlign: 'left' }}>
				<Box sx={{ display: 'flex' }}>
					<Icon sx={{ mr: '0.5rem' }}>
						<PermIdentityIcon />
					</Icon>
					<Typography variant='h6' component='p'>
						Users database
					</Typography>
				</Box>
				<Typography component='span'>Your database containg all the registered users.</Typography>
			</Box>
			<Box sx={{ mt: '2rem' }}>
				<Box sx={{ mb: '1rem', textAlign: 'right' }}>
					{selectedItems.length > 0 && (
						<>
							{!isMobile ? (
								<Button
									sx={{ ml: '0.3rem' }}
									variant='contained'
									color='info'
									type='button'
									size={isMobile ? 'small' : 'medium'}
									onClick={handleClickPermissionOpen}>
									Assign permission
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
							<AdminUserPermissionDialog
								handleCloseAdd={handleClosePermission}
								openAddDialog={openPermissionDialog}
								selectedItems={selectedItems}
							/>
						</>
					)}
				</Box>
				<DataGrid
					rows={users}
					columns={useMemo<GridColDef[]>(
						() => [
							{ field: 'id', headerName: 'ID', width: 100 },
							{ field: 'username', headerName: 'Username', width: 360 },
							{ field: 'email', headerName: 'Email', width: 360 },
							{
								field: 'createdAt',
								headerName: 'Creation date',
								width: 160,
								valueGetter: (_, row) => `${formatLocalDateTime(row.createdAt)}`,
							},
							{
								field: 'updatedAt',
								headerName: 'Update date',
								width: 160,
								valueGetter: (_, row) => `${formatLocalDateTime(row.updatedAt)}`,
							},
							{ field: 'avatar', headerName: 'Avatar', width: 360 },
						],
						[],
					)}
					initialState={{ pagination: { paginationModel: { page: 0, pageSize: 15 } } }}
					pageSizeOptions={[15, 30, 45]}
					checkboxSelection={true}
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
