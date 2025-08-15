import { useState } from 'react'
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, useMediaQuery, useTheme } from '@mui/material'
import type { IAddAdminRoleUserDialogProps } from '../scripts/IAdmin'
import AdminUserSelect from '../../../components/AdminUserSelect'
import type { UserClass } from '../../User/scripts/UserClass'

/**
 * A dialog component for adding one or more users to a specific admin role.
 *
 * @component
 * @param {Object} props - Component props.
 * @param {string | number} props.roleId - The ID of the role to which users will be added.
 * @param {boolean} props.openAddDialog - Controls whether the dialog is open.
 * @param {() => void} props.handleCloseAdd - Callback to close the dialog.
 * @param {(data: { user: UserClass[]; roleId: string | number }) => void} props.addItemHandler - Handler called when users are added to the role.
 *
 * @returns {JSX.Element} The rendered dialog component for adding users to a role.
 *
 * @remarks
 * - Uses Material-UI components for layout and styling.
 * - Integrates with a user selection component (`AdminUserSelect`).
 * - Disables the "Add" button if no users are selected.
 */
export default function AddUserRoleDialog({
	roleId,
	openAddDialog,
	handleCloseAdd,
	addItemHandler,
}: IAddAdminRoleUserDialogProps) {
	const [users, setUsers] = useState<UserClass[] | undefined>(undefined)

	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	/**
	 * Handles the form submission event for adding an admin role to users.
	 *
	 * Prevents the default form submission behavior, validates the presence of users,
	 * constructs the data object with selected users and role ID, closes the dialog,
	 * and invokes the handler to add the item.
	 *
	 * @param e - The form submission event.
	 */
	function onSubmitHandler(e: React.FormEvent): void {
		e.preventDefault()
		if (!users || users.length === 0) return
		const data = {
			user: users,
			roleId,
		}
		closeDialog()
		addItemHandler(data)
	}

	/**
	 * Handles changes to the selected users.
	 *
	 * @param item - An array of `UserClass` objects representing the selected users.
	 */
	function onUserChangeHandler(item: UserClass[]): void {
		setUsers(item)
	}

	/**
	 * Closes the Add Admin Role User dialog.
	 *
	 * This function resets the selected users state to `undefined` and triggers the dialog close handler.
	 *
	 * @returns {void}
	 */
	function closeDialog(): void {
		setUsers(undefined)
		handleCloseAdd()
	}

	return (
		<Dialog sx={{ width: '100%' }} open={openAddDialog} onClose={closeDialog} closeAfterTransition={false}>
			<DialogTitle>Add user to role</DialogTitle>
			<Box sx={{ padding: 0, margin: 0 }} onSubmit={onSubmitHandler} component='form' noValidate autoComplete='off'>
				<DialogContent>
					<Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
						<AdminUserSelect getItem={onUserChangeHandler} item={users} />
					</Box>
				</DialogContent>
				<DialogActions>
					<Button variant='outlined' size={isMobile ? 'small' : 'medium'} onClick={closeDialog}>
						Cancel
					</Button>
					<Button
						variant='outlined'
						size={isMobile ? 'small' : 'medium'}
						type='submit'
						disabled={!users || users.length === 0}>
						Add
					</Button>
				</DialogActions>
			</Box>
		</Dialog>
	)
}
