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
import type { IAddEquipmentTypeProps } from '../scripts/IEquipment'

/**
 * A dialog component for adding or editing equipment types.
 *
 * This component displays a modal dialog that allows users to add a new equipment type
 * or edit existing equipment types. It supports both single and multiple selection editing.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {boolean} props.edit - Indicates if the dialog is in edit mode.
 * @param {Array<IAddEquipmentType>} [props.selectedItems] - The currently selected equipment types for editing.
 * @param {boolean} props.openAddDialog - Controls whether the dialog is open.
 * @param {() => void} props.handleCloseAdd - Handler to close the dialog.
 * @param {(data: IAddEquipmentType | IAddEquipmentType[]) => void} props.addItemHandler - Handler to add or update equipment types.
 *
 * @returns {JSX.Element} The rendered dialog component.
 */
export default function AddEquipmentTypeDialog({
	edit,
	selectedItems,
	openAddDialog,
	handleCloseAdd,
	addItemHandler,
}: IAddEquipmentTypeProps) {
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
	 * Handles the change event for the equipment type name input field.
	 * Updates the local state with the new value entered by the user.
	 *
	 * @param e - The change event from the input element.
	 */
	function onNameChangeHandler(e: React.ChangeEvent<HTMLInputElement>): void {
		setName(e.target.value)
	}

	/**
	 * Closes the Add Equipment Type dialog by invoking the provided close handler.
	 *
	 * Calls the `handleCloseAdd` function to perform any necessary cleanup or state updates
	 * when the dialog is dismissed.
	 */
	function closeDialog(): void {
		handleCloseAdd()
	}

	/**
	 * Handles the form submission for adding or editing equipment types.
	 *
	 * - If not in edit mode, adds a single equipment type with the provided name.
	 * - If in edit mode and multiple selection is enabled, updates multiple equipment types based on selected items.
	 * - If in edit mode and multiple selection is not enabled, updates a single equipment type with the provided id and name.
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
			<DialogTitle>{edit ? 'Edit equipment type' : 'Add equipment type'}</DialogTitle>
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
						/>
					</Box>
				</DialogContent>
				<DialogActions>
					<Button variant='outlined' size={isMobile ? 'small' : 'medium'} onClick={closeDialog}>
						Cancel
					</Button>
					<Button variant='outlined' size={isMobile ? 'small' : 'medium'} type='submit'>
						{edit ? 'Save' : 'Add'}
					</Button>
				</DialogActions>
			</Box>
		</Dialog>
	)
}
