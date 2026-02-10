import { useEffect, memo } from 'react'
import type { InventoryShopClass } from '../modules/Inventory/scripts/InventoryShop'
import { TextField, Autocomplete, useMediaQuery, useTheme } from '@mui/material'
import { useGetInventoryShopsQuery } from '../store/api/inventoryApi'
import { useAppDispatch } from '../store/hooks'
import { showAlert } from '../store/application-store'

interface ISelectProps {
	getItem: (item: InventoryShopClass | null) => void
	item: InventoryShopClass | null | undefined
}

export default memo(function InventoryShopSelect({ getItem, item }: ISelectProps) {
	const dispatch = useAppDispatch()

	const { data: inventoryShop = [], error: inventoryShopError } = useGetInventoryShopsQuery({})

	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	useEffect(() => {
		if (inventoryShopError) {
			const message =
				(inventoryShopError as any)?.data?.message || (inventoryShopError as any)?.message || 'Something went wrong'
			dispatch(showAlert({ message, severity: 'error' }))
		}
	}, [dispatch, inventoryShopError])

	function getOptionLabel(Shop: InventoryShopClass): string {
		return Shop.name || ''
	}

	return (
		<Autocomplete
			sx={{ mt: '1rem', width: isMobile ? 200 : 400 }}
			onChange={(_, value) => getItem(value)}
			disablePortal
			value={item ?? null}
			getOptionLabel={getOptionLabel}
			isOptionEqualToValue={(option, value) => option.id === value.id}
			options={inventoryShop}
			slotProps={{ listbox: { sx: { maxHeight: '100px' } } }}
			renderInput={params => <TextField {...params} label='Shop' />}
		/>
	)
})
