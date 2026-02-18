import { useEffect, useState } from 'react'
import { Box, TextField, Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material'
import type { IAddInventoryPackageProps } from '../scripts/inventories'

export default function AddInventoryPackageDialog({
	edit,
	selectedItems,
	openAddDialog,
	handleCloseAdd,
	addItemHandler,
}: IAddInventoryPackageProps) {
	const [name, setName] = useState('')
	const [multiple, setMultiple] = useState(false)
	const [itemId, setItemId] = useState<number | undefined>(undefined)

	useEffect(() => {
		if (edit) {
			if (selectedItems?.length === 1) {
				setName(selectedItems[0].name || '')
				setItemId(selectedItems[0].id)
				setMultiple(false)
			} else {
				setName('')
				setItemId(undefined)
				setMultiple(true)
			}
		} else {
			setName('')
			setItemId(undefined)
			setMultiple(false)
		}
	}, [openAddDialog, edit, selectedItems])

	function onNameChangeHandler(e: React.ChangeEvent<HTMLInputElement>): void {
		setName(e.target.value)
	}

	function closeDialog(): void {
		handleCloseAdd()
	}

	function onSubmitHandler(e: React.FormEvent): void {
		e.preventDefault()
		if (!edit) {
			addItemHandler({ name })
		} else if (edit && multiple) {
			addItemHandler(
				selectedItems?.map(e => ({
					id: e.id,
					name: e.name,
				})) || [],
			)
		} else if (edit && !multiple) {
			addItemHandler([{ id: itemId, name }])
		}
		closeDialog()
	}

	return (
		<Dialog open={openAddDialog} onClose={closeDialog} closeAfterTransition={false} maxWidth='xs' fullWidth>
			<DialogTitle sx={{ fontWeight: 600 }}>{edit ? 'Edytuj obudowę' : 'Dodaj obudowę'}</DialogTitle>
			<Box sx={{ padding: 0, margin: 0 }} onSubmit={onSubmitHandler} component='form' noValidate autoComplete='off'>
				<DialogContent>
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
						<TextField
							fullWidth
							size='small'
							id='name'
							label='Nazwa'
							onChange={onNameChangeHandler}
							disabled={multiple}
							value={name}
							autoFocus
						/>
					</Box>
				</DialogContent>
				<DialogActions sx={{ px: 3, pb: 2 }}>
					<Button size='small' onClick={closeDialog}>
						Anuluj
					</Button>
					<Button variant='contained' size='small' type='submit' disabled={!name.trim() || (edit && multiple)}>
						{edit ? 'Zapisz' : 'Dodaj'}
					</Button>
				</DialogActions>
			</Box>
		</Dialog>
	)
}
