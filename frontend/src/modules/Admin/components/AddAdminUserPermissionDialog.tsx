import { useState } from 'react'
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, useMediaQuery, useTheme } from '@mui/material'
import type { IAddAdminUserPermissionDialogProps } from '../scripts/IAdmin'
import AdminFunctionalityDefinitionSelect from '../../../components/AdminFunctionalityDefinitionSelect'
import AdminObjectDefinitionSelect from '../../../components/AdminObjectDefinitionSelect'
import AdminAccessLevelDefinitionSelect from '../../../components/AdminAccessLevelSelect'
import type { FunctionalityDefinitionClass } from '../scripts/FunctionalityDefinitionClass'
import type { ObjectDefinitionClass } from '../scripts/ObjectDefinitionClass'
import type { AccessLevelDefinitionClass } from '../scripts/AccessLevelDefinitionClass'

/**
 * A dialog component for adding a new user permission in the admin panel.
 *
 * This dialog allows the selection of a functionality, object, and access level to assign to a user or role.
 * It manages its own local state for the selected definitions and handles form submission and dialog closure.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {string | number} props.userId - The ID of the user to whom the permission will be added.
 * @param {string | number} props.roleId - The ID of the role associated with the permission.
 * @param {boolean} props.openAddDialog - Controls whether the dialog is open.
 * @param {() => void} props.handleCloseAdd - Callback to close the dialog.
 * @param {(data: any) => void} props.addItemHandler - Callback to handle adding the new permission.
 *
 * @returns {JSX.Element} The rendered dialog component for adding user permissions.
 */
export default function AddUserPermissionDialog({
	userId,
	roleId,
	openAddDialog,
	handleCloseAdd,
	addItemHandler,
}: IAddAdminUserPermissionDialogProps) {
	const [functionalityDefinition, setFunctionalityDefinition] = useState<FunctionalityDefinitionClass | null>(null)
	const [objectDefinition, setObjectDefinition] = useState<ObjectDefinitionClass | null>(null)
	const [accessLevelDefinition, setAccessLevelDefinition] = useState<AccessLevelDefinitionClass | null>(null)

	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	/**
	 * Handles the form submission event for adding an admin user permission.
	 *
	 * Prevents the default form submission behavior, validates required definitions,
	 * constructs the data object for the new permission, closes the dialog, and
	 * invokes the handler to add the item.
	 *
	 * @param e - The form submission event.
	 */
	function onSubmitHandler(e: React.FormEvent): void {
		e.preventDefault()
		if (!functionalityDefinition || !accessLevelDefinition) return
		const data = {
			userId,
			roleId,
			admFunctionalityDefinitionId: functionalityDefinition.id,
			admObjectDefinitionId: objectDefinition?.id ?? null,
			admAccessLevelDefinitionId: accessLevelDefinition.id,
		}
		closeDialog()
		addItemHandler(data)
	}

	/**
	 * Closes the Add Admin User Permission dialog and resets related state.
	 *
	 * This function clears the current selections for functionality, object, and access level definitions,
	 * then invokes the handler to close the dialog.
	 */
	function closeDialog(): void {
		setFunctionalityDefinition(null)
		setObjectDefinition(null)
		setAccessLevelDefinition(null)
		handleCloseAdd()
	}

	return (
		<Dialog sx={{ width: '100%' }} open={openAddDialog} onClose={closeDialog} closeAfterTransition={false}>
			<DialogTitle>Add permission</DialogTitle>
			<Box sx={{ padding: 0, margin: 0 }} onSubmit={onSubmitHandler} component='form' noValidate autoComplete='off'>
				<DialogContent>
					<Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
						<AdminFunctionalityDefinitionSelect getItem={setFunctionalityDefinition} item={functionalityDefinition} />
						<AdminObjectDefinitionSelect getItem={setObjectDefinition} item={objectDefinition} />
						<AdminAccessLevelDefinitionSelect getItem={setAccessLevelDefinition} item={accessLevelDefinition} />
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
						disabled={!functionalityDefinition || !accessLevelDefinition}>
						Add
					</Button>
				</DialogActions>
			</Box>
		</Dialog>
	)
}
