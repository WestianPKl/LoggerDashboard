import { useEffect } from 'react'
import type { HouseClass } from '../modules/House/scripts/HouseClass'
import { TextField, Autocomplete, useMediaQuery, useTheme } from '@mui/material'
import { useGetHousesQuery } from '../store/api/houseApi'
import { useAppDispatch } from '../store/hooks'
import { showAlert } from '../store/application-store'

/**
 * Props for the House selection component.
 *
 * @property getItem - Callback function invoked when a house is selected or deselected. Receives the selected `HouseClass` instance or `null`.
 * @property item - The currently selected house, or `null` if none is selected. Can be `undefined` if not set.
 * @property disabled - Optional flag to disable the select component.
 */
interface ISelectProps {
	getItem: (item: HouseClass | null) => void
	item: HouseClass | null | undefined
	disabled?: boolean
}

/**
 * HouseSelect is a React functional component that renders an autocomplete dropdown for selecting a house.
 * It fetches house data using the `useGetHousesQuery` hook and displays the options using Material-UI's Autocomplete component.
 *
 * @param getItem - Callback function invoked when a house is selected from the dropdown.
 * @param item - The currently selected house item.
 * @param disabled - Boolean flag to disable the dropdown.
 *
 * The component handles error reporting by dispatching an alert if fetching houses fails.
 * It also adapts its width based on the screen size for mobile responsiveness.
 */
export default function HouseSelect({ getItem, item, disabled }: ISelectProps) {
	const dispatch = useAppDispatch()

	const { data: house = [], error: houseError } = useGetHousesQuery({})

	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	useEffect(() => {
		if (houseError) {
			const message = (houseError as any)?.data?.message || (houseError as any)?.message || 'Something went wrong'
			dispatch(showAlert({ message, severity: 'error' }))
		}
	}, [dispatch, houseError])

	/**
	 * Returns a display label for a given house object.
	 *
	 * If the house has a `name`, it returns the name.
	 * If the house has `name`, `postalCode`, and `city`, it returns a string combining these properties.
	 * If none of these properties are present, returns an empty string.
	 *
	 * @param house - The house object to generate a label for.
	 * @returns The label string for the house.
	 */
	function getOptionLabel(house: HouseClass): string {
		let value: string = ''
		if (house.name) {
			value = house.name
		} else if (house.name && house.postalCode && house.city) {
			value = `${house.name} ${house.postalCode} ${house.city}`
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
			options={house}
			disabled={disabled}
			slotProps={{ listbox: { sx: { maxHeight: '100px' } } }}
			renderInput={params => <TextField {...params} label='House' />}
		/>
	)
}
