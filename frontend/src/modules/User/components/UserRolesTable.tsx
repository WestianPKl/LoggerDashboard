import { Box, Typography } from '@mui/material'
import { DataGrid, type GridColDef } from '@mui/x-data-grid'
import GroupIcon from '@mui/icons-material/Group'
import type { IUserRolesProps } from '../scripts/IUser'

export default function UserRolesTable({ rolesData }: IUserRolesProps) {
	const columns: GridColDef[] = [
		{
			field: 'name',
			headerName: 'Name',
			width: 300,
			valueGetter: (_, row) => `${row.role && row.role.name ? row.role.name : '-'}`,
		},
		{
			field: 'description',
			headerName: 'Description',
			width: 300,
			valueGetter: (_, row) => `${row.role && row.role.description ? row.role.description : '-'}`,
		},
	]

	const paginationModel = { page: 0, pageSize: 15 }

	return (
		<Box sx={{ textAlign: 'center' }}>
			<Box sx={{ textAlign: 'left' }}>
				<Box sx={{ display: 'flex', alignItems: 'center' }}>
					<GroupIcon sx={{ mr: 1 }} />
					<Typography variant='h6' component='p'>
						User roles
					</Typography>
				</Box>
				<Typography component='span'>Database containing all the roles.</Typography>
			</Box>
			<Box sx={{ mt: 4 }}>
				<DataGrid
					getRowId={row => row.roleId}
					rows={rolesData}
					columns={columns}
					initialState={{ pagination: { paginationModel } }}
					pageSizeOptions={[15, 30, 45]}
					disableRowSelectionOnClick
					checkboxSelection={false}
					sx={{ border: 0 }}
					density='compact'
					disableColumnResize
					disableColumnSelector
					disableVirtualization
					hideFooterSelectedRowCount
				/>
			</Box>
		</Box>
	)
}
