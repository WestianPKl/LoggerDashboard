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
import type { IAddEquipmentModelProps } from '../scripts/IEquipment'

/**
 * A dialog component for adding or editing equipment models.
 *
 * This component displays a modal dialog that allows users to either add a new equipment model
 * or edit existing ones. It supports both single and multiple selection edit modes.
 *
 * @component
 * @param {boolean} edit - Indicates whether the dialog is in edit mode.
 * @param {IEquipmentModel[]} selectedItems - The currently selected equipment models for editing.
 * @param {boolean} openAddDialog - Controls whether the dialog is open.
 * @param {() => void} handleCloseAdd - Callback to close the dialog.
 * @param {(data: IAddEquipmentModel | IAddEquipmentModel[]) => void} addItemHandler - Handler for submitting the form data.
 *
 * @returns {JSX.Element} The rendered dialog component for adding or editing equipment models.
 */
export default function AddEquipmentModelDialog({
	edit,
	selectedItems,
	openAddDialog,
	handleCloseAdd,
	addItemHandler,
}: IAddEquipmentModelProps) {
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
	 * Handles the change event for the equipment name input field.
	 * Updates the local state with the new value entered by the user.
	 *
	 * @param e - The change event from the input element.
	 */
	function onNameChangeHandler(e: React.ChangeEvent<HTMLInputElement>): void {
		setName(e.target.value)
	}

	/**
	 * Closes the Add Equipment dialog by invoking the provided close handler.
	 * Typically used to reset dialog state and hide the modal from the user interface.
	 */
	function closeDialog(): void {
		handleCloseAdd()
	}

	/**
	 * Handles the form submission for adding or editing equipment models.
	 *
	 * - If not in edit mode, adds a single equipment model with the provided name.
	 * - If in edit mode and multiple selection is enabled, adds or updates multiple equipment models based on selected items.
	 * - If in edit mode and multiple selection is not enabled, adds or updates a single equipment model with the specified ID and name.
	 * - Closes the dialog after handling the submission.
	 *
	 * @param e - The form event triggered by submitting the form.
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
			<DialogTitle>{edit ? 'Edit equipment model' : 'Add equipment model'}</DialogTitle>
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
