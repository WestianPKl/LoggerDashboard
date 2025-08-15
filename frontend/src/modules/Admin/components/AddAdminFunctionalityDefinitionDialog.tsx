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
import type { IAddFunctionalityDefinitionProps } from '../scripts/IAdmin'

/**
 * AdminAddFunctionalityDefinitionDialog is a dialog component for adding or editing functionality definitions in the admin module.
 *
 * This component supports both single and multiple edit modes. When editing a single item, the form fields are populated with the selected item's data.
 * When editing multiple items, the form fields are disabled and the dialog allows batch editing.
 *
 * @param {Object} props - Component props.
 * @param {boolean} props.edit - Indicates if the dialog is in edit mode.
 * @param {IAddFunctionalityDefinitionData[] | undefined} props.selectedItems - The currently selected items to edit.
 * @param {boolean} props.openAddDialog - Controls whether the dialog is open.
 * @param {() => void} props.handleCloseAdd - Handler to close the dialog.
 * @param {(data: IAddFunctionalityDefinitionData | IAddFunctionalityDefinitionData[]) => void} props.addItemHandler - Handler to add or update functionality definitions.
 *
 * @returns {JSX.Element} The rendered dialog component for adding or editing functionality definitions.
 */
export default function AdminAddFunctionalityDefinitionDialog({
	edit,
	selectedItems,
	openAddDialog,
	handleCloseAdd,
	addItemHandler,
}: IAddFunctionalityDefinitionProps) {
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
	 * @param e - The change event triggered by the input element.
	 */
	function onNameChangeHandler(e: React.ChangeEvent<HTMLInputElement>): void {
		setName(e.target.value)
	}
	/**
	 * Handles the change event for the description input field.
	 * Updates the description state with the current value from the input.
	 *
	 * @param e - The change event from the description input element.
	 */
	function onDescriptionChangeHandler(e: React.ChangeEvent<HTMLInputElement>): void {
		setDescription(e.target.value)
	}

	/**
	 * Handles the form submission for adding or editing admin functionality definitions.
	 *
	 * - If not in edit mode, submits a single new item with `name` and `description`.
	 * - If in edit mode and `multiple` is true, submits an array of selected items.
	 * - If in edit mode and `multiple` is false, submits a single edited item as an array.
	 *
	 * Closes the dialog before calling the `addItemHandler` with the appropriate data.
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
			const data = { id: itemId, name, description }
			closeDialog()
			addItemHandler([data])
		}
	}

	/**
	 * Closes the add admin functionality definition dialog and resets form fields.
	 *
	 * This function clears the `name` and `description` fields, resets the `itemId` to `undefined`,
	 * and invokes the `handleCloseAdd` callback to close the dialog.
	 */
	function closeDialog(): void {
		setName('')
		setDescription('')
		setItemId(undefined)
		handleCloseAdd()
	}

	return (
		<Dialog sx={{ width: '100%' }} open={openAddDialog} onClose={closeDialog} closeAfterTransition={false}>
			<DialogTitle>{edit ? 'Edit functionality definition' : 'Add functionality definition'}</DialogTitle>
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
						disabled={!name.trim() || (edit && multiple)}>
						{edit ? 'Save' : 'Add'}
					</Button>
				</DialogActions>
			</Box>
		</Dialog>
	)
}
