import { useState, useEffect, useMemo } from 'react'
import {
	Box,
	Typography,
	Icon,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	DialogContentText,
	useMediaQuery,
	useTheme,
	IconButton,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { DataGrid, type GridColDef, type GridRowSelectionModel } from '@mui/x-data-grid'
import type { IAddHouseData, IHouseTableProps } from '../scripts/IHouse'
import HouseIcon from '@mui/icons-material/House'
import type { HouseClass } from '../scripts/HouseClass'
import AddHouseDialog from './AddHouseDialog'
import { showAlert } from '../../../store/application-store'
import { canWrite, canDelete } from '../../../store/auth-actions'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { useAddHouseMutation, useUpdateHouseMutation, useDeleteHouseMutation } from '../../../store/api/houseApi'
import { useRevalidator } from 'react-router'

/**
 * Renders a table displaying a list of houses with CRUD (Create, Read, Update, Delete) operations.
 *
 * Features:
 * - Displays house data in a Material-UI DataGrid with columns for ID, name, address, creation and update info.
 * - Supports adding, editing, and deleting houses via dialogs.
 * - Allows row selection for batch editing or deletion.
 * - Responsive UI with different controls for mobile and desktop.
 * - Integrates with Redux for permissions and alert notifications.
 * - Uses RTK Query mutations for API interactions.
 *
 * Props:
 * @param {IHouseTableProps} props - The props for the HouseTable component.
 * @param {HouseClass[]} props.houses - The array of house objects to display in the table.
 *
 * @returns {JSX.Element} The rendered HouseTable component.
 */
export default function HouseTable({ houses }: IHouseTableProps) {
	const dispatch = useAppDispatch()
	const revalidator = useRevalidator()

	const [selectedItems, setSelectedItems] = useState<HouseClass[]>([])
	const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>({
		type: 'include',
		ids: new Set(),
	})
	const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false)
	const [openAddDialog, setOpenAddDialog] = useState<boolean>(false)
	const [openEditDialog, setOpenEditDialog] = useState<boolean>(false)

	const isWritable = useAppSelector(state => canWrite('house', 'houseHouse')(state))
	const isDeletable = useAppSelector(state => canDelete('house', 'houseHouse')(state))

	const [addHouse] = useAddHouseMutation()
	const [updateHouse] = useUpdateHouseMutation()
	const [deleteHouse] = useDeleteHouseMutation()

	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	const columns = useMemo<GridColDef[]>(
		() => [
			{ field: 'id', headerName: 'ID', width: 50 },
			{ field: 'name', headerName: 'Name', width: 150 },
			{ field: 'postalCode', headerName: 'Postal code', width: 150 },
			{ field: 'city', headerName: 'City', width: 150 },
			{ field: 'street', headerName: 'Street', width: 150 },
			{ field: 'houseNumber', headerName: 'House number', width: 150 },
			{
				field: 'createdBy.username',
				headerName: 'Created by',
				width: 155,
				valueGetter: (_, row) => `${row.createdBy.username}`,
			},
			{
				field: 'updatedBy.username',
				headerName: 'Updated by',
				width: 155,
				valueGetter: (_, row) => `${row.updatedBy.username}`,
			},
			{
				field: 'createdAt',
				headerName: 'Creation date',
				width: 160,
				valueGetter: (_, row) => `${row.createdAt.replace('T', ' ').replace('Z', ' ').split('.')[0]}`,
			},
			{
				field: 'updatedAt',
				headerName: 'Update date',
				width: 160,
				valueGetter: (_, row) => `${row.updatedAt.replace('T', ' ').replace('Z', ' ').split('.')[0]}`,
			},
		],
		[]
	)

	const housesMap = useMemo(() => {
		const map = new Map()
		houses.forEach(item => {
			if (item.id) map.set(item.id, item)
		})
		return map
	}, [houses])

	useEffect(() => {
		const selectedIds = [...rowSelectionModel.ids]
		setSelectedItems(selectedIds.map(id => housesMap.get(Number(id))).filter(Boolean))
	}, [rowSelectionModel, housesMap])

	/**
	 * Clears the current selection by resetting the selected items array
	 * and the row selection model to their initial empty states.
	 *
	 * This function is typically used to deselect all items in the house table.
	 */
	function clearObject(): void {
		setSelectedItems([])
		setRowSelectionModel({
			type: 'include',
			ids: new Set(),
		})
	}

	/**
	 * Handles adding a new house item or multiple items.
	 *
	 * If a single item is provided, constructs a FormData object with the item's properties
	 * and sends it to the `addHouse` API. After a successful addition, shows a success alert
	 * and triggers a revalidation. If an error occurs, displays an error alert with the message.
	 *
	 * @param item - The house data to add, either a single `IAddHouseData` object or an array of them.
	 * @returns A Promise that resolves when the operation is complete.
	 */
	async function addItemHandler(item: IAddHouseData | IAddHouseData[]): Promise<void> {
		try {
			setOpenAddDialog(false)
			if (!Array.isArray(item)) {
				const formData = new FormData()
				if (item.name) {
					formData.append('name', item.name)
				}
				if (item.postalCode) {
					formData.append('postalCode', item.postalCode)
				}
				if (item.city) {
					formData.append('city', item.city)
				}
				if (item.street) {
					formData.append('street', item.street)
				}
				if (item.houseNumber) {
					formData.append('houseNumber', item.houseNumber)
				}
				if (item.pictureLink) {
					formData.append('pictureLink', item.pictureLink)
				}
				await addHouse(formData).unwrap()
			}
			dispatch(showAlert({ message: 'New house added', severity: 'success' }))
			revalidator.revalidate()
		} catch (err: any) {
			const message = err?.data?.message || err?.message || 'Something went wrong'
			dispatch(showAlert({ message, severity: 'error' }))
		}
	}

	/**
	 * Handles editing one or multiple house items.
	 *
	 * This function closes the edit dialog, processes each item (single or array),
	 * constructs a FormData object for each, and sends an update request if the item has an ID.
	 * On success, it shows a success alert, clears the form, and triggers a revalidation.
	 * On failure, it dispatches an error alert with the error message.
	 *
	 * @param items - A single house data object or an array of house data objects to be edited.
	 * @returns A Promise that resolves when all updates are complete.
	 */
	async function editItemHandler(items: IAddHouseData | IAddHouseData[]): Promise<void> {
		try {
			setOpenEditDialog(false)
			if (Array.isArray(items) && items.length >= 1) {
				await Promise.all(
					items.map(async item => {
						const formData = new FormData()
						if (item.name) {
							formData.append('name', item.name)
						}
						if (item.postalCode) {
							formData.append('postalCode', item.postalCode)
						}
						if (item.city) {
							formData.append('city', item.city)
						}
						if (item.street) {
							formData.append('street', item.street)
						}
						if (item.houseNumber) {
							formData.append('houseNumber', item.houseNumber)
						}
						if (item.pictureLink) {
							formData.append('pictureLink', item.pictureLink)
						}
						if (item.id) {
							await updateHouse({ body: formData, id: item.id })
						}
					})
				)
				dispatch(showAlert({ message: 'House edited', severity: 'success' }))
				clearObject()
				revalidator.revalidate()
			}
		} catch (err: any) {
			const message = err?.data?.message || err?.message || 'Something went wrong'
			dispatch(showAlert({ message, severity: 'error' }))
		}
	}

	/**
	 * Handles the deletion of selected house items.
	 *
	 * Closes the delete confirmation dialog, deletes all selected houses asynchronously,
	 * shows a success alert upon completion, and triggers a data revalidation.
	 * If an error occurs during deletion, displays an error alert with the appropriate message.
	 *
	 * @returns {Promise<void>} A promise that resolves when the deletion process is complete.
	 */
	async function deleteItemHandler(): Promise<void> {
		try {
			setOpenDeleteDialog(false)
			if (selectedItems.length >= 1) {
				await Promise.all(
					selectedItems.map(async item => {
						await deleteHouse({ id: item.id })
					})
				)
				dispatch(showAlert({ message: 'House deleted', severity: 'success' }))
				revalidator.revalidate()
			}
		} catch (err: any) {
			const message = err?.data?.message || err?.message || 'Something went wrong'
			dispatch(showAlert({ message, severity: 'error' }))
		}
	}

	/**
	 * Opens the dialog for adding a new house entry by setting the `openAddDialog` state to true.
	 *
	 * @remarks
	 * This function is typically used as an event handler for UI elements that trigger the add dialog.
	 */
	function handleClickAddOpen(): void {
		setOpenAddDialog(true)
	}

	/**
	 * Opens the edit dialog by setting the `openEditDialog` state to `true`.
	 * Typically used as an event handler for edit actions in the house table component.
	 */
	function handleClickEditOpen(): void {
		setOpenEditDialog(true)
	}

	/**
	 * Opens the delete confirmation dialog by setting the `openDeleteDialog` state to `true`.
	 * Typically used as an event handler for delete actions in the UI.
	 */
	function handleClickDeleteOpen(): void {
		setOpenDeleteDialog(true)
	}

	/**
	 * Closes the delete confirmation dialog by setting its open state to false.
	 *
	 * This function is typically used as an event handler for dialog close actions.
	 */
	function handleCloseDelete(): void {
		setOpenDeleteDialog(false)
	}

	/**
	 * Closes the "Add" dialog by setting its open state to false.
	 *
	 * This function is typically used as an event handler to close the dialog
	 * for adding a new item in the house table component.
	 */
	function handleCloseAdd(): void {
		setOpenAddDialog(false)
	}

	/**
	 * Closes the edit dialog by setting the `openEditDialog` state to false.
	 * Typically used as a handler for dialog close events.
	 */
	function handleCloseEdit(): void {
		setOpenEditDialog(false)
	}

	return (
		<Box sx={{ textAlign: 'center' }}>
			<Box sx={{ textAlign: 'left' }}>
				<Box sx={{ display: 'flex' }}>
					<Icon sx={{ mr: '0.5rem' }}>
						<HouseIcon />
					</Icon>
					<Typography variant='h6' component='p'>
						Houses database
					</Typography>
				</Box>
				<Typography component='span'>Your database containg all the houses you have registered.</Typography>
			</Box>
			<Box sx={{ mt: '2rem' }}>
				<Box sx={{ mb: '1rem', textAlign: 'right' }}>
					{isWritable && (
						<>
							{!isMobile ? (
								<Button variant='contained' type='button' size='medium' onClick={handleClickAddOpen}>
									Add new house
								</Button>
							) : (
								<IconButton type='button' size='small' color='primary' onClick={handleClickAddOpen}>
									<AddIcon />
								</IconButton>
							)}
							<AddHouseDialog
								edit={false}
								handleCloseAdd={handleCloseAdd}
								openAddDialog={openAddDialog}
								addItemHandler={addItemHandler}
							/>
						</>
					)}
					{selectedItems.length > 0 && (
						<>
							{isWritable && (
								<>
									{!isMobile ? (
										<Button
											sx={{ ml: '0.3rem' }}
											variant='contained'
											color='info'
											type='button'
											size={isMobile ? 'small' : 'medium'}
											onClick={handleClickEditOpen}>
											Edit
										</Button>
									) : (
										<IconButton
											sx={{ ml: '0.3rem' }}
											color='info'
											type='button'
											size={isMobile ? 'small' : 'medium'}
											onClick={handleClickEditOpen}>
											<EditIcon />
										</IconButton>
									)}
									<AddHouseDialog
										edit={true}
										handleCloseAdd={handleCloseEdit}
										openAddDialog={openEditDialog}
										selectedItems={selectedItems}
										addItemHandler={editItemHandler}
									/>
								</>
							)}
							{isDeletable && (
								<>
									{!isMobile ? (
										<Button
											sx={{ ml: '0.3rem' }}
											variant='contained'
											color='error'
											type='button'
											size={isMobile ? 'small' : 'medium'}
											onClick={handleClickDeleteOpen}>
											Delete
										</Button>
									) : (
										<IconButton
											sx={{ ml: '0.3rem' }}
											color='error'
											type='button'
											size={isMobile ? 'small' : 'medium'}
											onClick={handleClickDeleteOpen}>
											<DeleteIcon />
										</IconButton>
									)}
								</>
							)}
							<Dialog open={openDeleteDialog} onClose={handleCloseDelete} closeAfterTransition={false}>
								<DialogTitle>Do you want to delete selected item(s)?</DialogTitle>
								<DialogContent>
									<DialogContentText>You have selected {selectedItems.length} item(s) to delete.</DialogContentText>
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
						</>
					)}
				</Box>

				<DataGrid
					rows={houses}
					columns={columns}
					initialState={{ pagination: { paginationModel: { page: 0, pageSize: 15 } } }}
					pageSizeOptions={[15, 30, 45]}
					checkboxSelection={isWritable ? true : false}
					disableRowSelectionOnClick={true}
					sx={{ border: 0 }}
					density='comfortable'
					disableColumnResize={true}
					disableColumnSelector={true}
					disableVirtualization={true}
					disableMultipleRowSelection={true}
					onRowSelectionModelChange={newRowSelectionModel => {
						setRowSelectionModel(newRowSelectionModel)
					}}
					rowSelectionModel={rowSelectionModel}
				/>
			</Box>
		</Box>
	)
}
