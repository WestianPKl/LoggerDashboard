import {
	Box,
	Button,
	Dialog,
	useMediaQuery,
	useTheme,
	DialogActions,
	DialogContent,
	DialogTitle,
	IconButton,
} from '@mui/material'
import EquipmentLoggerSelect from '../../../components/EquipmentLoggerSelect'
import DeleteIcon from '@mui/icons-material/Delete'
import type { IHouseDetailsNewLoggerNodeDialogProps } from '../scripts/IHouseDetails'
import { useState } from 'react'
import { EquipmentClass } from '../../Equipment/scripts/EquipmentClass'

/**
 * Displays a dialog for adding a new logger node to a house floor.
 *
 * This component renders a modal dialog that allows users to select a logger and associate it with a specific house floor.
 * It provides options to save the new logger node or cancel the operation, and also includes a delete button for removing the node.
 *
 * @param loggerData - Data related to the logger and the house floor, used for associating the new logger node.
 * @param detailsDialog - Boolean flag indicating whether the dialog is open.
 * @param onCloseDialog - Callback function to close the dialog.
 * @param addItemHandler - Callback function to handle adding the new logger node.
 * @param handleClickDeleteNode - Callback function to handle deleting the logger node.
 *
 * @returns A React element rendering the new logger node dialog.
 */
export default function HouseDetailsLoggerNewNodeDialog({
	loggerData,
	detailsDialog,
	onCloseDialog,
	addItemHandler,
	handleClickDeleteNode,
}: IHouseDetailsNewLoggerNodeDialogProps) {
	const [logger, setLogger] = useState<EquipmentClass | null | undefined>(null)

	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	/**
	 * Handles the change event for the logger selection.
	 *
	 * Updates the logger state with the selected equipment item.
	 *
	 * @param item - The selected equipment item, which can be of type `EquipmentClass`, `null`, or `undefined`.
	 */
	function onLoggerChangeHandler(item: EquipmentClass | null | undefined): void {
		setLogger(item)
	}

	/**
	 * Handles the form submission event for adding a new logger node.
	 * Prevents the default form submission behavior, constructs the data object
	 * with the selected logger and floor IDs, closes the dialog, and triggers
	 * the item addition handler.
	 *
	 * @param e - The form submission event.
	 */
	function onSubmitHandler(e: React.FormEvent): void {
		e.preventDefault()
		closeDialog()
		addItemHandler({
			equLoggerId: logger?.id,
			houseFloorId: loggerData.floorId,
		})
	}

	/**
	 * Closes the logger dialog by resetting the logger state and invoking the dialog close handler.
	 *
	 * This function sets the logger to `null` and then calls the provided `onCloseDialog` function
	 * to handle any additional cleanup or UI updates required when closing the dialog.
	 */
	function closeDialog(): void {
		setLogger(null)
		onCloseDialog()
	}

	return (
		<Dialog fullWidth maxWidth='sm' open={detailsDialog} onClose={closeDialog} closeAfterTransition={false}>
			<DialogTitle sx={{ textAlign: 'center', position: 'relative', px: 2 }}>
				New logger
				<IconButton
					sx={{ position: 'absolute', right: 8, top: 8 }}
					color='error'
					type='button'
					size={isMobile ? 'small' : 'medium'}
					onClick={() => handleClickDeleteNode(loggerData)}
					aria-label='delete'>
					<DeleteIcon />
				</IconButton>
			</DialogTitle>
			<Box sx={{ padding: 0, margin: 0 }} onSubmit={onSubmitHandler} component='form' noValidate autoComplete='off'>
				<DialogContent>
					<Box
						sx={{
							width: isMobile ? 200 : 400,
							height: 140,
							display: 'flex',
							flexDirection: 'column',
							justifyContent: 'center',
							alignItems: 'center',
						}}>
						<EquipmentLoggerSelect getItem={onLoggerChangeHandler} item={logger} />
					</Box>
				</DialogContent>
				<DialogActions>
					<Button variant='outlined' size={isMobile ? 'small' : 'medium'} onClick={closeDialog}>
						Cancel
					</Button>
					<Button variant='outlined' size={isMobile ? 'small' : 'medium'} type='submit' disabled={!logger}>
						Save
					</Button>
				</DialogActions>
			</Box>
		</Dialog>
	)
}
