import { useEffect } from 'react'
import type { HouseFloorClass } from '../modules/House/scripts/HouseFloorClass'
import { TextField, Autocomplete, useMediaQuery, useTheme } from '@mui/material'
import { useGetHouseFloorsQuery } from '../store/api/houseApi'
import { useAppDispatch } from '../store/hooks'
import { showAlert } from '../store/application-store'

/**
 * Props for a select component that handles selection of a HouseFloorClass item.
 *
 * @property getItem - Callback function invoked when an item is selected or cleared. Receives the selected `HouseFloorClass` or `null`.
 * @property item - The currently selected `HouseFloorClass`, `null` if none is selected, or `undefined` if not set.
 */
interface ISelectProps {
	getItem: (item: HouseFloorClass | null) => void
	item: HouseFloorClass | null | undefined
}

/**
 * HouseFloorSelect is a React component that renders an autocomplete dropdown for selecting a house floor.
 * It fetches the list of available house floors using the `useGetHouseFloorsQuery` hook and displays them as options.
 * The component handles errors by dispatching an alert if the fetch fails.
 *
 * @param getItem - Callback function to handle the selected house floor item.
 * @param item - The currently selected house floor item.
 *
 * @remarks
 * - Uses Material-UI's `Autocomplete` and `TextField` components for UI.
 * - Adapts its width based on the screen size (responsive design).
 * - Displays an error alert if fetching house floors fails.
 *
 * @example
 * ```tsx
 * <HouseFloorSelect getItem={handleSelect} item={selectedFloor} />
 * ```
 */
export default function HouseFloorSelect({ getItem, item }: ISelectProps) {
	const dispatch = useAppDispatch()

	const { data: houseFloor = [], error: houseFloorError } = useGetHouseFloorsQuery({})

	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	useEffect(() => {
		if (houseFloorError) {
			const message =
				(houseFloorError as any)?.data?.message || (houseFloorError as any)?.message || 'Something went wrong'
			dispatch(showAlert({ message, severity: 'error' }))
		}
	}, [dispatch, houseFloorError])

	/**
	 * Returns the display label for a given `HouseFloorClass` option.
	 *
	 * @param houseFloor - The house floor object for which to retrieve the label.
	 * @returns The name of the house floor if available, otherwise an empty string.
	 */
	function getOptionLabel(houseFloor: HouseFloorClass): string {
		let value: string = ''
		if (houseFloor.name) {
			value = houseFloor.name
		}
		return value
	}

	return (
		<Autocomplete
			sx={{ mt: '1rem', width: isMobile ? 200 : 400 }}
			onChange={(_, value) => getItem(value)}
			disablePortal
			value={item}
			getOptionLabel={getOptionLabel}
			options={houseFloor}
			slotProps={{ listbox: { sx: { maxHeight: '100px' } } }}
			renderInput={params => <TextField {...params} label='Floor' />}
		/>
	)
}
