import { Box, Typography } from '@mui/material'
import { DataGrid, type GridColDef } from '@mui/x-data-grid'
import GroupIcon from '@mui/icons-material/Group'
import type { IUserRolesProps } from '../scripts/IUser'

/**
 * Displays a table of user roles using Material-UI's DataGrid component.
 *
 * @component
 * @param {IUserRolesProps} props - The props for the UserRolesTable component.
 * @param {Array} props.rolesData - An array of role objects to display in the table.
 *
 * @remarks
 * - Shows role name and description in a paginated, compact table.
 * - Disables row selection, column resizing, and column selector.
 * - Includes a header with an icon and description.
 *
 * @example
 * <UserRolesTable rolesData={roles} />
 */
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
					initialState={{ pagination: { paginationModel: { page: 0, pageSize: 15 } } }}
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
