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
import type { IAddHouseLoggerData, IHouseLoggerTableProps } from '../scripts/IHouse'
import DisplaySettingsIcon from '@mui/icons-material/DisplaySettings'
import type { HouseLoggerClass } from '../scripts/HouseLoggerClass'
import AddHouseLoggerDialog from './AddHouseLoggerDialog'
import { showAlert } from '../../../store/application-store'
import { canWrite, canDelete } from '../../../store/auth-actions'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import {
	useAddHouseLoggerMutation,
	useUpdateHouseLoggerMutation,
	useDeleteHouseLoggerMutation,
} from '../../../store/api/houseApi'
import { useRevalidator } from 'react-router'

export default function HouseLoggerTable({ houseLoggers }: IHouseLoggerTableProps) {
	const dispatch = useAppDispatch()
	const revalidator = useRevalidator()

	const [selectedItems, setSelectedItems] = useState<HouseLoggerClass[]>([])
	const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>({
		type: 'include',
		ids: new Set(),
	})
	const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false)
	const [openAddDialog, setOpenAddDialog] = useState<boolean>(false)
	const [openEditDialog, setOpenEditDialog] = useState<boolean>(false)

	const isWritable = useAppSelector(state => canWrite('house', 'houseLogger')(state))
	const isDeletable = useAppSelector(state => canDelete('house', 'houseLogger')(state))

	const [addHouseLogger] = useAddHouseLoggerMutation()
	const [updateHouseLogger] = useUpdateHouseLoggerMutation()
	const [deleteHouseLogger] = useDeleteHouseLoggerMutation()

	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	const columns = useMemo<GridColDef[]>(
		() => [
			{ field: 'id', headerName: 'ID', width: 100 },
			{
				field: 'logger.name',
				headerName: 'Logger',
				width: 300,
				valueGetter: (_, row) =>
					`ID${row.logger.id} ${row.logger.vendor?.name} ${row.logger.model?.name} SN: ${row.logger.serialNumber}`,
			},
			{
				field: 'logger.floors',
				headerName: 'Floors',
				width: 300,
				valueGetter: (_, row) => `${row.floor.name}`,
			},
		],
		[]
	)

	const houseLoggersMap = useMemo(() => {
		const map = new Map()
		houseLoggers.forEach(item => {
			if (item.id) map.set(item.id, item)
		})
		return map
	}, [houseLoggers])

	useEffect(() => {
		const selectedIds = [...rowSelectionModel.ids]
		setSelectedItems(selectedIds.map(id => houseLoggersMap.get(Number(id))).filter(Boolean))
	}, [rowSelectionModel, houseLoggersMap])

	/**
	 * Clears the current selection by resetting the selected items array
	 * and updating the row selection model to an empty state.
	 *
	 * This function sets the selected items to an empty array and
	 * initializes the row selection model with an 'include' type and
	 * an empty set of IDs.
	 */
	function clearObject(): void {
		setSelectedItems([])
		setRowSelectionModel({
			type: 'include',
			ids: new Set(),
		})
	}

	/**
	 * Handles adding a new house logger item or multiple items.
	 *
	 * Closes the add dialog, attempts to add the provided item(s) using the `addHouseLogger` API,
	 * and displays a success alert upon completion. If an error occurs, displays an error alert
	 * with the relevant message. Also triggers a revalidation of the data.
	 *
	 * @param item - The house logger data to add, either a single item or an array of items.
	 * @returns A promise that resolves when the operation is complete.
	 */
	async function addItemHandler(item: IAddHouseLoggerData | IAddHouseLoggerData[]): Promise<void> {
		try {
			setOpenAddDialog(false)
			if (!Array.isArray(item)) {
				await addHouseLogger(item).unwrap()
			}
			dispatch(showAlert({ message: 'New house logger added', severity: 'success' }))
			revalidator.revalidate()
		} catch (err: any) {
			const message = err?.data?.message || err?.message || 'Something went wrong'
			dispatch(showAlert({ message, severity: 'error' }))
		}
	}

	/**
	 * Handles editing of one or multiple house logger items.
	 *
	 * Closes the edit dialog, updates the provided item(s) using the `updateHouseLogger` API,
	 * and displays a success alert upon completion. If an error occurs during the update process,
	 * an error alert is shown with the relevant message.
	 *
	 * @param items - A single `IAddHouseLoggerData` object or an array of such objects to be updated.
	 * @returns A Promise that resolves when all updates are complete.
	 */
	async function editItemHandler(items: IAddHouseLoggerData | IAddHouseLoggerData[]): Promise<void> {
		try {
			setOpenEditDialog(false)
			if (Array.isArray(items) && items.length >= 1) {
				await Promise.all(
					items.map(async item => {
						await updateHouseLogger(item).unwrap()
					})
				)
				dispatch(showAlert({ message: 'House logger edited', severity: 'success' }))
				clearObject()
				revalidator.revalidate()
			}
		} catch (err: any) {
			const message = err?.data?.message || err?.message || 'Something went wrong'
			dispatch(showAlert({ message, severity: 'error' }))
		}
	}

	/**
	 * Handles the deletion of selected house logger items.
	 *
	 * Closes the delete confirmation dialog, then attempts to delete all selected items
	 * by calling the `deleteHouseLogger` API for each. If successful, shows a success alert
	 * and triggers a revalidation of the data. If an error occurs, displays an error alert
	 * with the appropriate message.
	 *
	 * @returns {Promise<void>} A promise that resolves when the deletion process is complete.
	 */
	async function deleteItemHandler(): Promise<void> {
		try {
			setOpenDeleteDialog(false)
			if (selectedItems.length >= 1) {
				await Promise.all(
					selectedItems.map(async item => {
						await deleteHouseLogger({ id: item.id }).unwrap()
					})
				)
				dispatch(showAlert({ message: 'House logger deleted', severity: 'success' }))
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

	const paginationModel = { page: 0, pageSize: 15 }
	return (
		<Box sx={{ textAlign: 'center' }}>
			<Box sx={{ textAlign: 'left' }}>
				<Box sx={{ display: 'flex' }}>
					<Icon sx={{ mr: '0.5rem' }}>
						<DisplaySettingsIcon />
					</Icon>
					<Typography variant='h6' component='p'>
						Houses loggers database
					</Typography>
				</Box>
				<Typography component='span'>Your database containg all the houses loggers you have registered.</Typography>
			</Box>
			<Box sx={{ mt: '2rem' }}>
				<Box sx={{ mb: '1rem', textAlign: 'right' }}>
					{isWritable && (
						<>
							{!isMobile ? (
								<Button variant='contained' type='button' size='medium' onClick={handleClickAddOpen}>
									Add new house logger
								</Button>
							) : (
								<IconButton type='button' size='small' color='primary' onClick={handleClickAddOpen}>
									<AddIcon />
								</IconButton>
							)}
							<AddHouseLoggerDialog
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
									<AddHouseLoggerDialog
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
					rows={houseLoggers}
					columns={columns}
					initialState={{ pagination: { paginationModel } }}
					pageSizeOptions={[15, 30, 45]}
					checkboxSelection={isWritable ? true : false}
					disableRowSelectionOnClick={true}
					sx={{ border: 0, width: '100%' }}
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
