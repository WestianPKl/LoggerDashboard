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
import type { IAddAccessLevelDefinitionProps } from '../scripts/IAdmin'

/**
 * A dialog component for adding or editing admin access level definitions.
 *
 * This component displays a modal dialog that allows users to create a new access level definition
 * or edit an existing one. It supports both single and multiple selection edit modes.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {boolean} props.edit - Indicates if the dialog is in edit mode.
 * @param {IAddAccessLevelDefinitionData[]} [props.selectedItems] - The currently selected items for editing.
 * @param {boolean} props.openAddDialog - Controls whether the dialog is open.
 * @param {() => void} props.handleCloseAdd - Callback to close the dialog.
 * @param {(data: IAddAccessLevelDefinitionData | IAddAccessLevelDefinitionData[]) => void} props.addItemHandler - Callback to handle adding or editing items.
 *
 * @returns {JSX.Element} The rendered dialog component.
 */
export default function AdminAddAccessLevelDefinitionDialog({
	edit,
	selectedItems,
	openAddDialog,
	handleCloseAdd,
	addItemHandler,
}: IAddAccessLevelDefinitionProps) {
	const [name, setName] = useState<string>('')
	const [accessLevel, setAccessLevel] = useState<number>(0)
	const [multiple, setMultiple] = useState<boolean>(false)
	const [itemId, setItemId] = useState<number | undefined>(undefined)

	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	useEffect(() => {
		if (edit) {
			if (selectedItems?.length === 1) {
				setName(selectedItems[0].name || '')
				setAccessLevel(selectedItems[0].accessLevel ?? 0)
				setItemId(selectedItems[0].id)
				setMultiple(false)
			} else {
				setName('')
				setAccessLevel(0)
				setItemId(undefined)
				setMultiple(true)
			}
		} else {
			setName('')
			setAccessLevel(0)
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
	 * Handles the change event for the access level input field.
	 * Updates the access level state with the numeric value from the input.
	 *
	 * @param e - The change event from the access level input element.
	 */
	function onAccessLevelChangeHandler(e: React.ChangeEvent<HTMLInputElement>): void {
		setAccessLevel(Number(e.target.value))
	}

	/**
	 * Handles the form submission for adding or editing admin access level definitions.
	 *
	 * - If not in edit mode, creates a new access level definition with the provided name and access level.
	 * - If in edit mode and multiple selection is enabled, updates multiple access level definitions based on selected items.
	 * - If in edit mode and multiple selection is not enabled, updates a single access level definition.
	 *
	 * Closes the dialog and invokes the addItemHandler with the appropriate data.
	 *
	 * @param e - The form submission event.
	 */
	function onSubmitHandler(e: React.FormEvent): void {
		e.preventDefault()
		if (!edit) {
			const data = {
				name: name.trim(),
				accessLevel: accessLevel,
			}
			closeDialog()
			addItemHandler(data)
		} else if (edit && multiple) {
			closeDialog()
			addItemHandler(
				selectedItems?.map(e => ({
					id: e.id,
					name: e.name,
					accessLevel: e.accessLevel,
				})) || []
			)
		} else if (edit && !multiple) {
			const data = {
				id: itemId,
				name: name.trim(),
				accessLevel: accessLevel,
			}
			closeDialog()
			addItemHandler([data])
		}
	}

	/**
	 * Resets the dialog state by clearing the name, setting the access level to 0,
	 * unsetting the item ID, and invoking the handler to close the add dialog.
	 *
	 * @returns {void}
	 */
	function closeDialog(): void {
		setName('')
		setAccessLevel(0)
		setItemId(undefined)
		handleCloseAdd()
	}

	return (
		<Dialog sx={{ width: '100%' }} open={openAddDialog} onClose={closeDialog} closeAfterTransition={false}>
			<DialogTitle>{edit ? 'Edit access level' : 'Add access level'}</DialogTitle>
			<Box sx={{ padding: 0, margin: 0 }} onSubmit={onSubmitHandler} component='form' noValidate autoComplete='off'>
				<DialogContent>
					<Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
						<TextField
							autoFocus
							sx={{ mt: '1rem', width: isMobile ? 200 : 400 }}
							id='name'
							label='Name'
							onChange={onNameChangeHandler}
							disabled={multiple}
							value={name}
							required
						/>
						<TextField
							sx={{ mt: '1rem', width: isMobile ? 200 : 400 }}
							id='accessLevel'
							label='Access level'
							onChange={onAccessLevelChangeHandler}
							disabled={multiple}
							value={accessLevel}
							type='number'
							inputProps={{ min: 0 }}
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
