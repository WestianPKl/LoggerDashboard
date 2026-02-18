import { useEffect, useState, useCallback } from 'react'
import { Box, TextField, Button, Dialog, DialogActions, DialogContent, DialogTitle, Autocomplete } from '@mui/material'
import type { IAddProductionOrderProps } from '../scripts/Production'
import type { PCBClass } from '../../PCB/scripts/PCB'
import PCBSelect from '../../../components/PCBSelect'

export default function AddProductionOrderDialog({
	edit,
	selectedItems,
	openAddDialog,
	handleCloseAdd,
	addItemHandler,
}: IAddProductionOrderProps) {
	const [quantity, setQuantity] = useState(0)
	const [status, setStatus] = useState<
		'planned' | 'ready' | 'reserved' | 'in_assembly' | 'produced' | 'cancelled' | undefined
	>(undefined)
	const [pcb, setPCB] = useState<PCBClass | undefined>(undefined)
	const [multiple, setMultiple] = useState(false)
	const [itemId, setItemId] = useState<number | undefined>(undefined)

	useEffect(() => {
		if (edit) {
			if (selectedItems?.length === 1) {
				setQuantity(selectedItems[0].quantity || 0)
				setStatus(selectedItems[0].status || undefined)
				setPCB(selectedItems[0].pcb || undefined)
				setItemId(selectedItems[0].id)
				setMultiple(false)
			} else {
				setMultiple(true)
			}
		} else {
			setMultiple(false)
		}
	}, [openAddDialog, edit, selectedItems])

	function onQuantityChangeHandler(e: React.ChangeEvent<HTMLInputElement>): void {
		setQuantity(Number(e.target.value))
	}

	function onStatusChangeHandler(_event: React.SyntheticEvent, value: string | null): void {
		setStatus(value as 'planned' | 'ready' | 'reserved' | 'in_assembly' | 'produced' | 'cancelled' | undefined)
	}

	const onPCBChangeHandler = useCallback((item: PCBClass | null): void => {
		setPCB(item || undefined)
	}, [])

	function closeDialog(): void {
		handleCloseAdd()
	}

	function onSubmitHandler(e: React.FormEvent): void {
		e.preventDefault()
		if (!edit) {
			addItemHandler({
				quantity,
				status,
				pcbId: pcb?.id,
			})
		} else if (edit && multiple) {
			addItemHandler(
				selectedItems?.map(e => ({
					id: e.id,
					quantity: e.quantity,
					status: e.status,
					pcbId: e.pcbId,
				})) || [],
			)
		} else if (edit && !multiple) {
			addItemHandler([
				{
					id: itemId,
					quantity,
					status,
					pcbId: pcb?.id,
				},
			])
		}
		setQuantity(0)
		setStatus(undefined)
		setPCB(undefined)
		setItemId(undefined)
		closeDialog()
	}

	return (
		<Dialog open={openAddDialog} onClose={closeDialog} closeAfterTransition={false} maxWidth='sm' fullWidth>
			<DialogTitle sx={{ fontWeight: 600 }}>
				{edit ? 'Edytuj zlecenie produkcyjne' : 'Dodaj zlecenie produkcyjne'}
			</DialogTitle>
			<Box sx={{ padding: 0, margin: 0 }} onSubmit={onSubmitHandler} component='form' noValidate autoComplete='off'>
				<DialogContent>
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
						<PCBSelect getItem={onPCBChangeHandler} item={pcb} />
						<Autocomplete
							fullWidth
							size='small'
							sx={{ mt: 1 }}
							onChange={onStatusChangeHandler}
							disablePortal
							value={status ?? null}
							options={['planned', 'ready', 'reserved', 'in_assembly', 'produced', 'cancelled']}
							renderInput={params => <TextField {...params} label='Status' />}
						/>
						<TextField
							fullWidth
							size='small'
							id='quantity'
							type='number'
							label='Ilość'
							onChange={onQuantityChangeHandler}
							disabled={multiple}
							value={quantity}
							autoFocus
						/>
					</Box>
				</DialogContent>
				<DialogActions sx={{ px: 3, pb: 2 }}>
					<Button size='small' onClick={closeDialog}>
						Anuluj
					</Button>
					<Button variant='contained' size='small' type='submit' disabled={edit && multiple}>
						{edit ? 'Zapisz' : 'Dodaj'}
					</Button>
				</DialogActions>
			</Box>
		</Dialog>
	)
}
