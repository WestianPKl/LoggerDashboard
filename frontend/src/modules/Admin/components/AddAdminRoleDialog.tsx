import { useEffect, useState } from 'react'
import {
	Box,
	TextField,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	useMediaQuery,
	useTheme,
} from '@mui/material'
import type { IAddAdminRoleProps } from '../scripts/IAdmin'

/**
 * AdminAddAdminRoleDialog is a dialog component for adding or editing admin roles.
 *
 * @param edit - Indicates whether the dialog is in edit mode.
 * @param selectedItems - The currently selected role items to edit (can be single or multiple).
 * @param openAddDialog - Controls whether the dialog is open.
 * @param handleCloseAdd - Callback to close the dialog.
 * @param addItemHandler - Callback to handle adding or updating roles.
 *
 * @remarks
 * - In add mode, allows entering a new role name and description.
 * - In edit mode, supports editing a single role or handling multiple selected roles (with limited editing).
 * - Uses Material-UI Dialog components for UI.
 * - Disables form fields and submit button appropriately based on mode and selection.
 */
export default function AdminAddAdminRoleDialog({
	edit,
	selectedItems,
	openAddDialog,
	handleCloseAdd,
	addItemHandler,
}: IAddAdminRoleProps) {
	const [name, setName] = useState<string>('')
	const [description, setDescription] = useState<string>('')
	const [multiple, setMultiple] = useState<boolean>(false)
	const [itemId, setItemId] = useState<number | undefined>(undefined)

	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	useEffect(() => {
		if (edit) {
			if (selectedItems?.length === 1) {
				setName(selectedItems[0].name || '')
				setDescription(selectedItems[0].description || '')
				setItemId(selectedItems[0].id)
				setMultiple(false)
			} else {
				setName('')
				setDescription('')
				setItemId(undefined)
				setMultiple(true)
			}
		} else {
			setName('')
			setDescription('')
			setItemId(undefined)
			setMultiple(false)
		}
	}, [openAddDialog, selectedItems, edit])

	/**
	 * Handles the change event for the name input field.
	 * Updates the local state with the new value entered by the user.
	 *
	 * @param e - The change event from the input element.
	 */
	function onNameChangeHandler(e: React.ChangeEvent<HTMLInputElement>): void {
		setName(e.target.value)
	}
	/**
	 * Handles the change event for the description input field.
	 * Updates the local state with the new value entered by the user.
	 *
	 * @param e - The change event from the description input element.
	 */
	function onDescriptionChangeHandler(e: React.ChangeEvent<HTMLInputElement>): void {
		setDescription(e.target.value)
	}

	/**
	 * Handles the form submission for adding or editing admin roles.
	 *
	 * - If not in edit mode, submits a single new role with `name` and `description`.
	 * - If in edit mode and `multiple` is true, submits an array of selected roles for editing.
	 * - If in edit mode and `multiple` is false, submits a single role for editing.
	 *
	 * Closes the dialog and calls the `addItemHandler` with the appropriate data.
	 *
	 * @param e - The form event triggered by submission.
	 */
	function onSubmitHandler(e: React.FormEvent): void {
		e.preventDefault()
		if (!edit) {
			closeDialog()
			addItemHandler({ name, description })
		} else if (edit && multiple) {
			closeDialog()
			addItemHandler(
				selectedItems?.map(e => ({
					id: e.id,
					name: e.name,
					description: e.description,
				})) || []
			)
		} else if (edit && !multiple) {
			closeDialog()
			addItemHandler([{ id: itemId, name, description }])
		}
	}

	/**
	 * Resets the form fields and closes the Add Admin Role dialog.
	 *
	 * This function clears the `name` and `description` input fields,
	 * resets the `itemId` to `undefined`, and invokes the handler to close
	 * the Add Admin Role dialog.
	 */
	function closeDialog(): void {
		setName('')
		setDescription('')
		setItemId(undefined)
		handleCloseAdd()
	}

	return (
		<Dialog sx={{ width: '100%' }} open={openAddDialog} onClose={closeDialog} closeAfterTransition={false}>
			<DialogTitle>{edit ? 'Edit Role' : 'Add Role'}</DialogTitle>
			<Box sx={{ padding: 0, margin: 0 }} onSubmit={onSubmitHandler} component='form' noValidate autoComplete='off'>
				<DialogContent>
					<Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
						<TextField
							sx={{ mt: '1rem', width: isMobile ? 200 : 400 }}
							id='name'
							label='Name'
							onChange={onNameChangeHandler}
							disabled={multiple}
							value={name}
							required
							autoFocus
						/>
						<TextField
							sx={{ mt: '1rem', width: isMobile ? 200 : 400 }}
							id='description'
							label='Description'
							onChange={onDescriptionChangeHandler}
							disabled={multiple}
							value={description}
						/>
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
						disabled={!name?.trim() || (edit && multiple)}>
						{edit ? 'Save' : 'Add'}
					</Button>
				</DialogActions>
			</Box>
		</Dialog>
	)
}
