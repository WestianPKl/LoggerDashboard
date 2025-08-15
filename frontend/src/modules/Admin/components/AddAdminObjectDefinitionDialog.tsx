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
import type { IAddFunctionalityDefinitionProps, IAddFunctionalityDefinitionData } from '../scripts/IAdmin'

/**
 * Dialog component for adding or editing functionality definitions in the admin panel.
 *
 * This component displays a modal dialog that allows users to add a new functionality definition
 * or edit existing ones. It supports both single and multiple selection editing modes.
 *
 * @component
 * @param {Object} props - Component props.
 * @param {boolean} props.edit - Indicates if the dialog is in edit mode.
 * @param {IAddFunctionalityDefinitionData[]} [props.selectedItems] - The currently selected items to edit.
 * @param {boolean} props.openAddDialog - Controls whether the dialog is open.
 * @param {() => void} props.handleCloseAdd - Callback to close the dialog.
 * @param {(data: IAddFunctionalityDefinitionData | IAddFunctionalityDefinitionData[]) => void} props.addItemHandler - Handler to add or update functionality definitions.
 *
 * @returns {JSX.Element} The rendered dialog component.
 */
export default function AdminAddFunctionalityDefinitionDialog({
	edit,
	selectedItems,
	openAddDialog,
	handleCloseAdd,
	addItemHandler,
}: IAddFunctionalityDefinitionProps) {
	const [name, setName] = useState<string | undefined>('')
	const [description, setDescription] = useState<string | undefined>('')
	const [multiple, setMultiple] = useState<boolean>(false)
	const [itemId, setItemId] = useState<number | undefined>(undefined)

	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	useEffect(() => {
		if (edit) {
			if (selectedItems?.length == 1) {
				setName(selectedItems[0].name)
				setDescription(selectedItems[0].description)
				setItemId(selectedItems[0].id)
				setMultiple(false)
				return
			} else {
				setName('')
				setDescription('')
				setMultiple(true)
				return
			}
		}
	}, [setMultiple, setName, setDescription, openAddDialog, selectedItems, edit])

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
	 * Updates the description state with the current value from the input.
	 *
	 * @param e - The change event from the description input element.
	 */
	function onDescriptionChangeHandler(e: React.ChangeEvent<HTMLInputElement>): void {
		setDescription(e.target.value)
	}

	/**
	 * Handles the form submission for adding or editing admin object definitions.
	 *
	 * - If not in edit mode, creates a new item with the provided name and description.
	 * - If in edit mode and multiple selection is enabled, processes all selected items and adds them.
	 * - If in edit mode and multiple selection is not enabled, updates a single item.
	 *
	 * Closes the dialog and calls the `addItemHandler` with the appropriate data.
	 *
	 * @param e - The form submission event.
	 */
	function onSubmitHandler(e: React.FormEvent): void {
		e.preventDefault()
		if (!edit) {
			closeDialog()
			addItemHandler({
				name: name,
				description: description,
			})
		} else if (edit && multiple) {
			let items: IAddFunctionalityDefinitionData[] = []
			selectedItems?.forEach(e => {
				if (e) {
					items.push({
						id: e.id,
						name: e.name,
						description: e.description,
					})
				}
			})
			closeDialog()
			addItemHandler(items)
		} else if (edit && !multiple) {
			closeDialog()
			addItemHandler([
				{
					id: itemId,
					name: name,
					description: description,
				},
			])
		}
	}

	/**
	 * Closes the add admin object definition dialog.
	 *
	 * Resets the `name` and `description` state variables to empty strings,
	 * and invokes the `handleCloseAdd` callback to perform any additional
	 * closing logic.
	 */
	function closeDialog(): void {
		setName('')
		setDescription('')
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
					<Button variant='outlined' size={isMobile ? 'small' : 'medium'} type='submit'>
						{edit ? 'Save' : 'Add'}
					</Button>
				</DialogActions>
			</Box>
		</Dialog>
	)
}
