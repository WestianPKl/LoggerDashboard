import { useEffect, memo } from 'react'
import type { PCBClass } from '../modules/PCB/scripts/PCB'
import { TextField, Autocomplete } from '@mui/material'
import { useGetPCBsQuery } from '../store/api/pcbApi'
import { useAppDispatch } from '../store/hooks'
import { showAlert } from '../store/application-store'

interface ISelectProps {
	getItem: (item: PCBClass | null) => void
	item: PCBClass | null | undefined
}

export default memo(function PCBSelect({ getItem, item }: ISelectProps) {
	const dispatch = useAppDispatch()

	const { data: pcb = [], error: pcbError } = useGetPCBsQuery({})

	useEffect(() => {
		if (pcbError) {
			const message = (pcbError as any)?.data?.message || (pcbError as any)?.message || 'Something went wrong'
			dispatch(showAlert({ message, severity: 'error' }))
		}
	}, [dispatch, pcbError])

	function getOptionLabel(pcb: PCBClass): string {
		return `${pcb.name} / ${pcb.revision}` || ''
	}

	return (
		<Autocomplete
			fullWidth
			size='small'
			sx={{ mt: 1.5 }}
			onChange={(_, value) => getItem(value)}
			disablePortal
			value={item ?? null}
			getOptionLabel={getOptionLabel}
			isOptionEqualToValue={(option, value) => option.id === value.id}
			options={pcb}
			slotProps={{ listbox: { sx: { maxHeight: 200 } } }}
			renderInput={params => <TextField {...params} label='PCB' />}
		/>
	)
})
