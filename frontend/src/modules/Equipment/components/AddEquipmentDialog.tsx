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
import type { IAddEquipment, IAddEquipmentProps } from '../scripts/IEquipment'
import EquipmentVendorSelect from '../../../components/EquipmentVendorSelect'
import EquipmentModelSelect from '../../../components/EquipmentModelSelect'
import EquipmentTypeSelect from '../../../components/EquipmentTypeSelect'
import type { EquipmentVendorClass } from '../scripts/EquipmentVendorClass'
import type { EquipmentModelClass } from '../scripts/EquipmentModelClass'
import type { EquipmentTypeClass } from '../scripts/EquipmentTypeClass'
import DataDefinitionSelect from '../../../components/DataDefinitionSelect'
import type { DataDefinitionClass } from '../../Data/scripts/DataDefinitionClass'

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

	function onSerialNumberChangeHandler(e: React.ChangeEvent<HTMLInputElement>) {
		setSerialNumber(e.target.value)
	}

	function onVendorChangeHandler(item: EquipmentVendorClass | null) {
		setVendor(item)
	}
	function onModelChangeHandler(item: EquipmentModelClass | null) {
		setModel(item)
	}
	function onTypeChangeHandler(item: EquipmentTypeClass | null) {
		setType(item)
	}
	function onDataDefinitionHandler(item: DataDefinitionClass[]) {
		setDataDefinition(item)
	}

	function closeDialog() {
		handleCloseAdd()
	}

	function onSubmitHandler(e: React.FormEvent) {
		e.preventDefault()
		if (!edit) {
			const data: IAddEquipment = {
				serialNumber,
				equVendorId: vendor?.id,
				equModelId: model?.id,
				equTypeId: type?.id,
				dataDefinitions: dataDefinition,
			}
			addItemHandler(data)
		} else if (edit && multiple) {
			const items: IAddEquipment[] =
				selectedItems?.map(e => ({
					id: e.id,
					serialNumber: e.serialNumber,
					equVendorId: e.vendor?.id,
					equModelId: e.model?.id,
					equTypeId: e.type?.id,
					dataDefinitions: e.dataDefinitions ?? [],
				})) || []
			addItemHandler(items)
		} else if (edit && !multiple) {
			const data: IAddEquipment = {
				id: itemId,
				serialNumber,
				equVendorId: vendor?.id,
				equModelId: model?.id,
				equTypeId: type?.id,
				dataDefinitions: dataDefinition,
			}
			addItemHandler([data])
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
					<Button variant='outlined' size={isMobile ? 'small' : 'medium'} type='submit'>
						{edit ? 'Save' : 'Add'}
					</Button>
				</DialogActions>
			</Box>
		</Dialog>
	)
}
