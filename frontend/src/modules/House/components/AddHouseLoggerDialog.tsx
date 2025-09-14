import { useEffect, useState } from 'react'
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, useMediaQuery, useTheme } from '@mui/material'
import type { IAddHouseLoggerProps } from '../scripts/IHouse'
import type { EquipmentClass } from '../../Equipment/scripts/EquipmentClass'
import EquipmentLoggerSelect from '../../../components/EquipmentLoggerSelect'
import HouseFloorSelect from '../../../components/HouseFloorSelect'
import type { HouseFloorClass } from '../scripts/HouseFloorClass'

/**
 * A dialog component for adding or editing a house logger entry.
 *
 * This component displays a modal dialog that allows users to select an equipment logger and a house floor,
 * either to add a new house logger entry or to edit existing ones. It supports both single and multiple edit modes.
 *
 * @param edit - Indicates if the dialog is in edit mode.
 * @param selectedItems - The currently selected items for editing (can be multiple).
 * @param openAddDialog - Controls whether the dialog is open.
 * @param handleCloseAdd - Callback to close the dialog.
 * @param addItemHandler - Callback to handle adding or updating items.
 *
 * @returns A React element representing the add/edit house logger dialog.
 */
export default function AddHouseLoggerDialog({
	edit,
	selectedItems,
	openAddDialog,
	handleCloseAdd,
	addItemHandler,
}: IAddHouseLoggerProps) {
	const [logger, setLogger] = useState<EquipmentClass | null>(null)
	const [houseFloor, setHouseFloor] = useState<HouseFloorClass | null>(null)
	const [multiple, setMultiple] = useState(false)
	const [itemId, setItemId] = useState<number | undefined>(undefined)

	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	useEffect(() => {
		if (edit) {
			if (selectedItems?.length === 1) {
				const item = selectedItems[0]
				setItemId(item.id)
				setLogger(item.logger || null)
				setHouseFloor(item.floor || null)
				setMultiple(false)
			} else {
				setItemId(undefined)
				setLogger(null)
				setHouseFloor(null)
				setMultiple(true)
			}
		} else {
			setItemId(undefined)
			setLogger(null)
			setHouseFloor(null)
			setMultiple(false)
		}
	}, [openAddDialog, edit, selectedItems])

	/**
	 * Handles the change event for the logger selection.
	 *
	 * Updates the logger state with the selected equipment item or null if no selection is made.
	 *
	 * @param item - The selected equipment item of type `EquipmentClass` or `null` if no item is selected.
	 */
	function onLoggerChangeHandler(item: EquipmentClass | null): void {
		setLogger(item)
	}

	/**
	 * Handles the change event for the house floor selection.
	 * Updates the state with the selected `HouseFloorClass` item or `null` if no selection is made.
	 *
	 * @param item - The selected `HouseFloorClass` instance or `null` if the selection is cleared.
	 */
	function onHouseFloorChangeHandler(item: HouseFloorClass | null): void {
		setHouseFloor(item)
	}

	/**
	 * Closes the Add House Logger dialog by invoking the provided close handler.
	 *
	 * @remarks
	 * This function is typically called to close the dialog when the user cancels or completes the add operation.
	 */
	function closeDialog(): void {
		handleCloseAdd()
	}

	/**
	 * Handles the form submission for adding or editing a house logger.
	 *
	 * - Prevents the default form submission behavior.
	 * - If not in edit mode, constructs a single `IAddHouseLoggerData` object and passes it to `addItemHandler`.
	 * - If in edit mode with multiple selection, maps selected items to `IAddHouseLoggerData[]` and passes them to `addItemHandler`.
	 * - If in edit mode with a single item, constructs an `IAddHouseLoggerData` object and passes it as an array to `addItemHandler`.
	 * - Closes the dialog after handling the submission.
	 *
	 * @param e - The form event triggered by submitting the form.
	 */
	function onSubmitHandler(e: React.FormEvent): void {
		e.preventDefault()
		if (!edit) {
			addItemHandler({
				equLoggerId: logger?.id,
				houseFloorId: houseFloor?.id,
			})
		} else if (edit && multiple) {
			addItemHandler(
				selectedItems?.map(e => ({
					id: e.id,
					equLoggerId: e.equLoggerId,
					houseFloorId: e.houseFloorId,
				})) || []
			)
		} else if (edit && !multiple) {
			addItemHandler([
				{
					id: itemId,
					equLoggerId: logger?.id,
					houseFloorId: houseFloor?.id,
				},
			])
		}
		closeDialog()
	}

	return (
		<Dialog sx={{ width: '100%' }} open={openAddDialog} onClose={closeDialog} closeAfterTransition={false}>
			<DialogTitle>{edit ? 'Edit house Logger' : 'Add house Logger'}</DialogTitle>
			<Box sx={{ padding: 0, margin: 0 }} onSubmit={onSubmitHandler} component='form' noValidate autoComplete='off'>
				<DialogContent>
					<Box
						sx={{
							width: isMobile ? 200 : 400,
							height: 150,
							display: 'flex',
							flexDirection: 'column',
							justifyContent: 'center',
							alignItems: 'center',
						}}>
						<EquipmentLoggerSelect getItem={onLoggerChangeHandler} item={logger} />
						<HouseFloorSelect getItem={onHouseFloorChangeHandler} item={houseFloor} />
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
						disabled={!logger || !houseFloor || (edit && multiple)}>
						{edit ? 'Save' : 'Add'}
					</Button>
				</DialogActions>
			</Box>
		</Dialog>
	)
}
