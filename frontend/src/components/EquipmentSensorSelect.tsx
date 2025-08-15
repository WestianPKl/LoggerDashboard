import { useEffect } from 'react'
import type { EquipmentClass } from '../modules/Equipment/scripts/EquipmentClass'
import { TextField, Autocomplete, useMediaQuery, useTheme } from '@mui/material'
import { useGetEquipmentsQuery, useGetEquipmentTypesQuery } from '../store/api/equipmentApi'
import { useAppDispatch } from '../store/hooks'
import { showAlert } from '../store/application-store'

/**
 * Props for a selection component that handles equipment class selection.
 *
 * @property getItem - Callback function invoked when an equipment class is selected or cleared.
 * @property item - The currently selected equipment class, or null/undefined if none is selected.
 */
interface ISelectProps {
	getItem: (item: EquipmentClass | null) => void
	item: EquipmentClass | null | undefined
}

/**
 * EquipmentSensorSelect is a React component that renders an Autocomplete dropdown for selecting equipment of type "Sensor".
 *
 * It fetches equipment types filtered by the name "Sensor" and then retrieves the corresponding equipment list.
 * The component displays each equipment option with its ID, vendor name, and model name.
 *
 * If there is an error during data fetching, it dispatches an alert with the error message.
 * The component is responsive and adjusts its width based on the screen size.
 *
 * @param getItem - Callback function invoked when an equipment item is selected.
 * @param item - The currently selected equipment item.
 *
 * @returns A Material-UI Autocomplete component for selecting sensor equipment.
 */
export default function EquipmentSensorSelect({ getItem, item }: ISelectProps) {
	const dispatch = useAppDispatch()

	const { data: equipmentType = [], error: equipmentTypeError } = useGetEquipmentTypesQuery({ name: 'Sensor' })
	const sensorTypeIds = equipmentType[0]
	const skip = !sensorTypeIds
	const { data: equipment = [], error: equipmentsError } = useGetEquipmentsQuery({ equTypeId: sensorTypeIds }, { skip })

	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	useEffect(() => {
		if (equipmentTypeError || equipmentsError) {
			const err = equipmentTypeError || equipmentsError
			const message = (err as any)?.data?.message || (err as any)?.message || 'Something went wrong'
			dispatch(showAlert({ message, severity: 'error' }))
		}
	}, [equipmentTypeError, equipmentsError, dispatch])

	/**
	 * Returns a formatted string label for a given equipment object.
	 *
	 * The label includes the equipment's ID, vendor name, and model name, if available.
	 *
	 * @param equipment - The equipment object for which to generate the label.
	 * @returns A string in the format "ID{equipment.id} {vendor.name} {model.name}", or an empty string if equipment is undefined.
	 */
	function getOptionLabel(equipment: EquipmentClass): string {
		let value: string = ''
		if (equipment) {
			value = `ID${equipment.id} ${equipment.vendor?.name} ${equipment.model?.name} `
		}
		return value
	}

	return (
		<Autocomplete
			sx={{ width: isMobile ? 200 : 400 }}
			onChange={(_, value) => getItem(value)}
			disablePortal
			value={item}
			getOptionLabel={getOptionLabel}
			slotProps={{ listbox: { sx: { maxHeight: '100px' } } }}
			options={equipment}
			renderInput={params => <TextField {...params} label='Equipment' />}
		/>
	)
}
