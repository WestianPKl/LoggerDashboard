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
import type { IAddEquipmentProps } from '../scripts/IEquipment'
import EquipmentVendorSelect from '../../../components/EquipmentVendorSelect'
import EquipmentModelSelect from '../../../components/EquipmentModelSelect'
import EquipmentTypeSelect from '../../../components/EquipmentTypeSelect'
import type { EquipmentVendorClass } from '../scripts/EquipmentVendorClass'
import type { EquipmentModelClass } from '../scripts/EquipmentModelClass'
import type { EquipmentTypeClass } from '../scripts/EquipmentTypeClass'
import DataDefinitionSelect from '../../../components/DataDefinitionSelect'
import type { DataDefinitionClass } from '../../Data/scripts/DataDefinitionClass'

/**
 * Displays a dialog for adding or editing equipment items.
 *
 * This component renders a form inside a Material-UI Dialog, allowing users to input or modify equipment details
 * such as serial number, vendor, model, type, and data definitions. It supports both single and multiple edit modes.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {boolean} props.edit - Indicates if the dialog is in edit mode.
 * @param {IEquipmentItem[] | undefined} props.selectedItems - The currently selected equipment items for editing.
 * @param {boolean} props.openAddDialog - Controls whether the dialog is open.
 * @param {() => void} props.handleCloseAdd - Callback to close the dialog.
 * @param {(data: IAddEquipment | IAddEquipment[]) => void} props.addItemHandler - Handler to add or update equipment items.
 *
 * @returns {JSX.Element} The rendered AddEquipmentDialog component.
 */
export default function AddEquipmentDialog({
	edit,
	selectedItems,
	openAddDialog,
	handleCloseAdd,
	addItemHandler,
}: IAddEquipmentProps) {
	const [serialNumber, setSerialNumber] = useState('')
	const [vendor, setVendor] = useState<EquipmentVendorClass | null>(null)
	const [model, setModel] = useState<EquipmentModelClass | null>(null)
	const [type, setType] = useState<EquipmentTypeClass | null>(null)
	const [dataDefinition, setDataDefinition] = useState<DataDefinitionClass[]>([])
	const [itemId, setItemId] = useState<number | undefined>(undefined)
	const [multiple, setMultiple] = useState(false)

	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	useEffect(() => {
		if (edit) {
			if (selectedItems?.length === 1) {
				const item = selectedItems[0]
				setSerialNumber(item.serialNumber || '')
				setVendor(item.vendor ?? null)
				setModel(item.model ?? null)
				setType(item.type ?? null)
				setDataDefinition(item.dataDefinitions ?? [])
				setItemId(item.id)
				setMultiple(false)
			} else {
				setSerialNumber('')
				setVendor(null)
				setModel(null)
				setType(null)
				setDataDefinition([])
				setItemId(undefined)
				setMultiple(true)
			}
		} else {
			setSerialNumber('')
			setVendor(null)
			setModel(null)
			setType(null)
			setDataDefinition([])
			setItemId(undefined)
			setMultiple(false)
		}
	}, [openAddDialog, edit, selectedItems])

	/**
	 * Handles changes to the serial number input field.
	 *
	 * Updates the serial number state with the current value from the input element.
	 *
	 * @param e - The change event triggered by the serial number input field.
	 */
	function onSerialNumberChangeHandler(e: React.ChangeEvent<HTMLInputElement>): void {
		setSerialNumber(e.target.value)
	}

	/**
	 * Handles the change event for the equipment vendor selection.
	 *
	 * Updates the current vendor state with the selected vendor item.
	 *
	 * @param item - The selected equipment vendor, or `null` if no vendor is selected.
	 */
	function onVendorChangeHandler(item: EquipmentVendorClass | null): void {
		setVendor(item)
	}
	/**
	 * Handles changes to the selected equipment model.
	 *
	 * @param item - The newly selected `EquipmentModelClass` instance or `null` if no model is selected.
	 * Updates the component state with the selected model.
	 */
	function onModelChangeHandler(item: EquipmentModelClass | null): void {
		setModel(item)
	}
	/**
	 * Handles the change event for the equipment type selection.
	 *
	 * Updates the selected equipment type state when the user selects a new type.
	 *
	 * @param item - The newly selected equipment type, or `null` if no type is selected.
	 */
	function onTypeChangeHandler(item: EquipmentTypeClass | null): void {
		setType(item)
	}
	/**
	 * Handles updates to the data definition state.
	 *
	 * @param item - An array of `DataDefinitionClass` objects representing the new data definitions to be set.
	 */
	function onDataDefinitionHandler(item: DataDefinitionClass[]): void {
		setDataDefinition(item)
	}

	/**
	 * Closes the Add Equipment dialog by invoking the provided close handler.
	 *
	 * Calls the `handleCloseAdd` function to perform any necessary cleanup and close the dialog UI.
	 */
	function closeDialog(): void {
		handleCloseAdd()
	}

	/**
	 * Handles the form submission for adding or editing equipment.
	 *
	 * - If not in edit mode, creates a new equipment item and passes it to `addItemHandler`.
	 * - If in edit mode with multiple selection, maps selected items to the expected format and passes them to `addItemHandler`.
	 * - If in edit mode with a single item, updates the item and passes it as an array to `addItemHandler`.
	 * - Always closes the dialog after handling the submission.
	 *
	 * @param e - The form event triggered by submitting the form.
	 */
	function onSubmitHandler(e: React.FormEvent): void {
		e.preventDefault()
		if (!edit) {
			addItemHandler({
				serialNumber,
				equVendorId: vendor?.id,
				equModelId: model?.id,
				equTypeId: type?.id,
				dataDefinitions: dataDefinition,
			})
		} else if (edit && multiple) {
			addItemHandler(
				selectedItems?.map(e => ({
					id: e.id,
					serialNumber: e.serialNumber,
					equVendorId: e.vendor?.id,
					equModelId: e.model?.id,
					equTypeId: e.type?.id,
					dataDefinitions: e.dataDefinitions ?? [],
				})) || []
			)
		} else if (edit && !multiple) {
			addItemHandler([
				{
					id: itemId,
					serialNumber,
					equVendorId: vendor?.id,
					equModelId: model?.id,
					equTypeId: type?.id,
					dataDefinitions: dataDefinition,
				},
			])
		}
		closeDialog()
	}

	return (
		<Dialog sx={{ width: '100%' }} open={openAddDialog} onClose={closeDialog} closeAfterTransition={false}>
			<DialogTitle>{edit ? 'Edit equipment' : 'Add equipment'}</DialogTitle>
			<Box sx={{ padding: 0, margin: 0 }} onSubmit={onSubmitHandler} component='form' noValidate autoComplete='off'>
				<DialogContent>
					<Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
						<TextField
							sx={{ mt: 1, width: isMobile ? 200 : 400 }}
							id='serialNumber'
							label='Serial number'
							onChange={onSerialNumberChangeHandler}
							disabled={multiple}
							value={serialNumber}
							required
						/>
						<EquipmentVendorSelect getItem={onVendorChangeHandler} item={vendor} />
						<EquipmentModelSelect getItem={onModelChangeHandler} item={model} />
						<EquipmentTypeSelect getItem={onTypeChangeHandler} item={type} />
						{type?.name === 'Sensor' && (
							<DataDefinitionSelect getItem={onDataDefinitionHandler} item={dataDefinition} />
						)}
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
						disabled={!serialNumber.trim() || !vendor || !model || !type || (edit && multiple)}>
						{edit ? 'Save' : 'Add'}
					</Button>
				</DialogActions>
			</Box>
		</Dialog>
	)
}
