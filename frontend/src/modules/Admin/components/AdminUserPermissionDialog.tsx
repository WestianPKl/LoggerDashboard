import { Box, Dialog, DialogContent, DialogTitle } from '@mui/material'
import type { IAddAdminUserPermissionProps } from '../scripts/IAdmin'
import AdminUserPermissionTable from './AdminUserPermissionTable'

/**
 * Displays a dialog for adding or editing user permissions for an admin user.
 *
 * @param selectedItems - An array of selected user items, where the first item's `id` is used to display permissions.
 * @param openAddDialog - Boolean flag to control whether the dialog is open.
 * @param handleCloseAdd - Callback function to handle closing the dialog.
 *
 * @remarks
 * Renders a Material-UI `Dialog` containing a user permission table for the selected user.
 * Only the first selected user's permissions are shown.
 *
 * @returns A dialog component for managing admin user permissions.
 */
export default function AdminAddUserPermissionDialog({
	selectedItems,
	openAddDialog,
	handleCloseAdd,
}: IAddAdminUserPermissionProps) {
	return (
		<Dialog
			sx={{ width: '100%' }}
			open={openAddDialog}
			onClose={() => handleCloseAdd()}
			closeAfterTransition={false}
			fullWidth
			maxWidth='xl'>
			<DialogTitle>User permission</DialogTitle>
			<DialogContent>
				<Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
					{selectedItems?.[0]?.id && <AdminUserPermissionTable userId={selectedItems[0].id} isAdmin={true} />}
				</Box>
			</DialogContent>
		</Dialog>
	)
}
