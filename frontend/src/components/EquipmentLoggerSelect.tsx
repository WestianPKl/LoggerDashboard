import { useEffect } from 'react'
import type { EquipmentClass } from '../modules/Equipment/scripts/EquipmentClass'
import { TextField, Autocomplete, useMediaQuery, useTheme } from '@mui/material'
import { useGetEquipmentsQuery, useGetEquipmentUnusedLoggersQuery } from '../store/api/equipmentApi'
import { useAppDispatch } from '../store/hooks'
import { showAlert } from '../store/application-store'
import type { EquipmentUnusedLoggerClass } from '../modules/Equipment/scripts/EquipmentUnusedLoggerClass'

/**
 * Props for the EquipmentLoggerSelect component.
 *
 * @property getItem - Callback function invoked when an item is selected or cleared. Receives the selected `EquipmentClass` or `null`.
 * @property item - The currently selected `EquipmentClass`, or `null`/`undefined` if none is selected.
 * @property disabled - Optional flag to disable the select input.
 */
interface ISelectProps {
	getItem: (item: EquipmentClass | null) => void
	item: EquipmentClass | null | undefined
	disabled?: boolean
}

/**
 * EquipmentLoggerSelect is a React component that renders an Autocomplete dropdown for selecting equipment loggers.
 *
 * It fetches a list of unused equipment loggers and their corresponding equipment details, displaying them as selectable options.
 * The component handles loading, error reporting, and adapts its width for mobile screens.
 *
 * @param getItem - Callback function invoked when an equipment item is selected.
 * @param item - The currently selected equipment item.
 * @param disabled - Boolean flag to disable the select input.
 *
 * @remarks
 * - Displays an error alert if fetching loggers or equipment fails.
 * - Uses Material-UI's Autocomplete and TextField components.
 * - Option labels are formatted as: "ID{equipment.id} {vendor.name} {model.name}".
 */
export default function EquipmentLoggerSelect({ getItem, item, disabled }: ISelectProps) {
	const dispatch = useAppDispatch()

	const { data: unusedLoggers = [], error: unusedLoggersError } = useGetEquipmentUnusedLoggersQuery({})
	const loggersIds = unusedLoggers
		.map((e: EquipmentUnusedLoggerClass) => e.equLoggerId)
		.filter((id): id is number => typeof id === 'number')
	const skip = loggersIds.length === 0
	const { data: equipment = [], error: equipmentsError } = useGetEquipmentsQuery(loggersIds, { skip })

	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	useEffect(() => {
		if (unusedLoggersError || equipmentsError) {
			const err = unusedLoggersError || equipmentsError
			const message = (err as any)?.data?.message || (err as any)?.message || 'Something went wrong'
			dispatch(showAlert({ message, severity: 'error' }))
		}
	}, [unusedLoggersError, equipmentsError, dispatch])

	/**
	 * Returns a formatted string label for a given equipment object.
	 *
	 * The label includes the equipment's ID, vendor name, and model name,
	 * formatted as: "ID{equipment.id} {vendor.name} {model.name}".
	 * If the equipment object is undefined or null, returns an empty string.
	 *
	 * @param equipment - The equipment object to generate a label for.
	 * @returns The formatted label string for the equipment.
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
			options={equipment}
			disabled={disabled}
			slotProps={{ listbox: { sx: { maxHeight: '100px' } } }}
			renderInput={params => <TextField {...params} label='Logger' />}
		/>
	)
}
