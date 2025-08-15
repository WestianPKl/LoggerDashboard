import { Box, Dialog, DialogContent, DialogTitle } from '@mui/material'
import type { IAddAdminRolePermissionProps } from '../scripts/IAdmin'
import AdminUserPermissionTable from './AdminUserPermissionTable'

/**
 * Displays a dialog for managing role permissions in the admin panel.
 *
 * @param selectedItems - An array of selected role items, where the first item's `id` is used to display permissions.
 * @param openAddDialog - Boolean flag to control the open state of the dialog.
 * @param handleCloseAdd - Callback function to handle closing the dialog.
 *
 * @remarks
 * If a role is selected (`selectedItems[0]?.id`), the `AdminUserPermissionTable` is rendered for that role.
 *
 * @returns A dialog component containing the permissions table for the selected admin role.
 */
export default function AdminAddRolePermissionDialog({
	selectedItems,
	openAddDialog,
	handleCloseAdd,
}: IAddAdminRolePermissionProps) {
	return (
		<Dialog
			sx={{ width: '100%' }}
			open={openAddDialog}
			onClose={() => handleCloseAdd()}
			closeAfterTransition={false}
			fullWidth
			maxWidth='xl'>
			<DialogTitle>Role permission</DialogTitle>
			<DialogContent>
				<Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
					{selectedItems?.[0]?.id && <AdminUserPermissionTable roleId={selectedItems[0].id} isAdmin={true} />}
				</Box>
			</DialogContent>
		</Dialog>
	)
}
