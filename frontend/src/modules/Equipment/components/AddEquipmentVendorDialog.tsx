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
import type { IAddEquipmentVendorProps } from '../scripts/IEquipment'

/**
 * A dialog component for adding or editing equipment vendors.
 *
 * This component displays a modal dialog that allows users to add a new equipment vendor
 * or edit existing vendor(s). It supports both single and multiple edit modes.
 *
 * @param edit - If true, the dialog is in edit mode; otherwise, it's in add mode.
 * @param selectedItems - The currently selected vendor items to edit (if any).
 * @param openAddDialog - Controls whether the dialog is open.
 * @param handleCloseAdd - Callback to close the dialog.
 * @param addItemHandler - Callback to handle adding or updating vendor(s).
 *
 * @remarks
 * - When editing multiple items, the name field is disabled.
 * - Uses Material-UI components for layout and styling.
 */
export default function AddEquipmentVendorDialog({
	edit,
	selectedItems,
	openAddDialog,
	handleCloseAdd,
	addItemHandler,
}: IAddEquipmentVendorProps) {
	const [name, setName] = useState('')
	const [multiple, setMultiple] = useState(false)
	const [itemId, setItemId] = useState<number | undefined>(undefined)

	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	useEffect(() => {
		if (edit) {
			if (selectedItems?.length === 1) {
				setName(selectedItems[0].name || '')
				setItemId(selectedItems[0].id)
				setMultiple(false)
			} else {
				setName('')
				setItemId(undefined)
				setMultiple(true)
			}
		} else {
			setName('')
			setItemId(undefined)
			setMultiple(false)
		}
	}, [openAddDialog, edit, selectedItems])

	/**
	 * Handles the change event for the equipment vendor name input field.
	 * Updates the local state with the new value entered by the user.
	 *
	 * @param e - The change event triggered by the input element.
	 */
	function onNameChangeHandler(e: React.ChangeEvent<HTMLInputElement>): void {
		setName(e.target.value)
	}

	/**
	 * Closes the Add Equipment Vendor dialog by invoking the provided close handler.
	 *
	 * This function should be called to properly close the dialog and perform any necessary cleanup.
	 */
	function closeDialog(): void {
		handleCloseAdd()
	}

	/**
	 * Handles the form submission for adding or editing equipment vendors.
	 *
	 * - Prevents the default form submission behavior.
	 * - If not in edit mode, creates a new vendor with the provided name and calls `addItemHandler`.
	 * - If in edit mode and multiple selection is enabled, maps selected items to the required format and calls `addItemHandler`.
	 * - If in edit mode and single selection, updates the vendor with the given `itemId` and name, and calls `addItemHandler`.
	 * - Closes the dialog after handling the submission.
	 *
	 * @param e - The form event triggered by the submission.
	 */
	function onSubmitHandler(e: React.FormEvent): void {
		e.preventDefault()
		if (!edit) {
			addItemHandler({ name })
		} else if (edit && multiple) {
			addItemHandler(
				selectedItems?.map(e => ({
					id: e.id,
					name: e.name,
				})) || []
			)
		} else if (edit && !multiple) {
			addItemHandler([{ id: itemId, name }])
		}
		closeDialog()
	}

	return (
		<Dialog sx={{ width: '100%' }} open={openAddDialog} onClose={closeDialog} closeAfterTransition={false}>
			<DialogTitle>{edit ? 'Edit equipment vendor' : 'Add equipment vendor'}</DialogTitle>
			<Box sx={{ padding: 0, margin: 0 }} onSubmit={onSubmitHandler} component='form' noValidate autoComplete='off'>
				<DialogContent>
					<Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
						<TextField
							sx={{ mt: 1, width: isMobile ? 200 : 400 }}
							id='name'
							label='Name'
							onChange={onNameChangeHandler}
							disabled={multiple}
							value={name}
							required
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
						disabled={!name.trim() || (edit && multiple)}>
						{edit ? 'Save' : 'Add'}
					</Button>
				</DialogActions>
			</Box>
		</Dialog>
	)
}
