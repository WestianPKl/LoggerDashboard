import { useState } from 'react'
import {
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogTitle,
	DialogContent,
	DialogContentText,
	useMediaQuery,
	useTheme,
} from '@mui/material'
import type { IHouseDetailsFloorProps } from '../scripts/IHouseDetails'
import { useDeleteHouseFloorMutation, useUpdateHouseFloorMutation } from '../../../store/api/houseApi'
import { showAlert } from '../../../store/application-store'
import { useAppDispatch } from '../../../store/hooks'
import type { IAddHouseFloorData } from '../../House/scripts/IHouse'
import AddHouseFloorDialog from '../../House/components/AddHouseFloorDialog'
import { useRevalidator } from 'react-router'

/**
 * Component for editing and deleting a house floor within the House Details module.
 *
 * Renders "Edit floor" and (conditionally) "Delete floor" buttons, and manages dialogs for editing and confirming deletion.
 * Handles update and delete operations for a floor, dispatching alerts and triggering data revalidation on success or error.
 *
 * @param floor - The floor object to be edited or deleted.
 * @param houseId - The ID of the house to which the floor belongs.
 *
 * @remarks
 * - The "Delete floor" button is only shown if the floor has no associated loggers.
 * - Uses Redux for dispatching alerts and RTK Query mutations for API calls.
 * - Utilizes Material UI components for UI and dialogs.
 */
export default function HouseDetailsEditFloor({ floor, houseId }: IHouseDetailsFloorProps) {
	const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false)
	const [openEditDialog, setOpenEditDialog] = useState<boolean>(false)
	const revalidator = useRevalidator()

	const dispatch = useAppDispatch()
	const [updateHouseFloor] = useUpdateHouseFloorMutation()
	const [deleteHouseFloor] = useDeleteHouseFloorMutation()

	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	/**
	 * Handles editing one or multiple house floor items.
	 *
	 * @param items - A single `IAddHouseFloorData` object or an array of such objects representing the house floor(s) to edit.
	 * @returns A promise that resolves when the edit operation(s) are complete.
	 *
	 * The function:
	 * - Accepts either a single item or an array of items.
	 * - For each item, constructs a `FormData` object with the relevant fields (`name`, `houseId`, `layout`).
	 * - Calls the `updateHouseFloor` API for each item with the constructed form data.
	 * - On success, closes the edit dialog, shows a success alert, and triggers a revalidation.
	 * - On failure, dispatches an error alert with the error message.
	 */
	async function editItemHandler(items: IAddHouseFloorData | IAddHouseFloorData[]): Promise<void> {
		try {
			if (Array.isArray(items) && items.length >= 1) {
				await Promise.all(
					items.map(async item => {
						const formData = new FormData()
						if (item.name) {
							formData.append('name', item.name)
						}
						if (houseId) {
							formData.append('houseId', `${houseId}`)
						}
						if (item.layout) {
							formData.append('layout', item.layout)
						}
						if (item.id) {
							await updateHouseFloor({ body: formData, id: item.id }).unwrap()
						}
					})
				)
				handleCloseEdit()
				dispatch(showAlert({ message: 'House floor edited', severity: 'success' }))
				revalidator.revalidate()
			}
		} catch (err: any) {
			const message = err?.data?.message || err?.message || 'Something went wrong'
			dispatch(showAlert({ message, severity: 'error' }))
		}
	}

	/**
	 * Handles the deletion of a house floor item.
	 *
	 * Attempts to delete the current floor by its ID using the `deleteHouseFloor` API call.
	 * On successful deletion, dispatches a success alert and triggers a revalidation.
	 * If an error occurs, dispatches an error alert with the appropriate message.
	 *
	 * @returns {Promise<void>} A promise that resolves when the deletion process is complete.
	 */
	async function deleteItemHandler(): Promise<void> {
		try {
			if (floor.id) {
				await deleteHouseFloor({ id: floor.id }).unwrap()
				dispatch(showAlert({ message: 'House floor deleted', severity: 'success' }))
				revalidator.revalidate()
			}
		} catch (err: any) {
			const message = err?.data?.message || err?.message || 'Something went wrong'
			dispatch(showAlert({ message, severity: 'error' }))
		}
	}

	/**
	 * Opens the edit dialog by setting the `openEditDialog` state to `true`.
	 *
	 * This function is typically used as an event handler for edit actions,
	 * such as clicking an "Edit" button in the UI.
	 */
	function handleClickEditOpen(): void {
		setOpenEditDialog(true)
	}

	/**
	 * Opens the delete confirmation dialog by setting the `openDeleteDialog` state to `true`.
	 *
	 * @remarks
	 * This function is typically used as an event handler for delete actions,
	 * such as when a user clicks a "Delete" button in the UI.
	 */
	function handleClickDeleteOpen(): void {
		setOpenDeleteDialog(true)
	}

	/**
	 * Closes the delete confirmation dialog by setting its open state to false.
	 *
	 * This function is typically called when the user cancels or completes a delete action,
	 * ensuring that the delete dialog is no longer visible.
	 */
	function handleCloseDelete(): void {
		setOpenDeleteDialog(false)
	}

	/**
	 * Closes the edit dialog by setting the open state to false.
	 *
	 * This function is typically used as an event handler to close
	 * the edit dialog when the user cancels or completes editing.
	 */
	function handleCloseEdit(): void {
		setOpenEditDialog(false)
	}

	return (
		<Box>
			<Button
				size={isMobile ? 'small' : 'medium'}
				sx={{ marginRight: '1rem' }}
				variant='contained'
				color='warning'
				onClick={handleClickEditOpen}>
				Edit floor
			</Button>
			{floor.loggers.length === 0 && (
				<Button
					size={isMobile ? 'small' : 'medium'}
					sx={{ marginRight: '1rem' }}
					variant='contained'
					color='error'
					onClick={handleClickDeleteOpen}>
					Delete floor
				</Button>
			)}
			<AddHouseFloorDialog
				isDashboard={true}
				edit={true}
				handleCloseAdd={handleCloseEdit}
				openAddDialog={openEditDialog}
				selectedItems={[floor]}
				addItemHandler={editItemHandler}
			/>
			<Dialog open={openDeleteDialog} onClose={handleCloseDelete} closeAfterTransition={false}>
				<DialogTitle>Do you want to delete selected item?</DialogTitle>
				<DialogContent>
					<DialogContentText>{`Selected floor ID${floor.id} ${floor.name} will be removed?`}</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button variant='outlined' size={isMobile ? 'small' : 'medium'} onClick={handleCloseDelete}>
						Cancel
					</Button>
					<Button
						variant='outlined'
						size={isMobile ? 'small' : 'medium'}
						onClick={deleteItemHandler}
						autoFocus
						color='error'>
						Delete
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	)
}
