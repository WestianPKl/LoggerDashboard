import { Box, Dialog, DialogContent, DialogTitle } from '@mui/material'
import type { IAddAdminRoleUserProps } from '../scripts/IAdmin'
import AdminUserRoleMain from './AdminUserRoleMain'

/**
 * Displays a dialog for managing users assigned to a specific admin role.
 *
 * @param selectedItems - The currently selected items, where the first item's `id` is used as the role identifier.
 * @param openAddDialog - Boolean flag to control whether the dialog is open.
 * @param handleCloseAdd - Callback function to handle closing the dialog.
 *
 * @remarks
 * - Renders the `AdminUserRoleMain` component for the selected role.
 * - The dialog is full width and uses the 'xl' maxWidth setting.
 * - Only renders the user role management UI if a valid role ID is present in `selectedItems`.
 */
export default function AdminAddRoleUserDialog({
	selectedItems,
	openAddDialog,
	handleCloseAdd,
}: IAddAdminRoleUserProps) {
	return (
		<Dialog
			sx={{ width: '100%' }}
			open={openAddDialog}
			onClose={() => handleCloseAdd()}
			closeAfterTransition={false}
			fullWidth
			maxWidth='xl'>
			<DialogTitle>Role users</DialogTitle>
			<DialogContent>
				<Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
					{selectedItems?.[0]?.id && <AdminUserRoleMain roleId={selectedItems?.[0]?.id} isAdmin={true} />}
				</Box>
			</DialogContent>
		</Dialog>
	)
}
