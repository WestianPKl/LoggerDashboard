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
import type { IAddAccessLevelDefinitionProps, IAddAccessLevelDefinitionData } from '../scripts/IAdmin'

export default function AdminAddAccessLevelDefinitionDialog({
	edit,
	selectedItems,
	openAddDialog,
	handleCloseAdd,
	addItemHandler,
}: IAddAccessLevelDefinitionProps) {
	const [name, setName] = useState<string>('')
	const [accessLevel, setAccessLevel] = useState<number>(0)
	const [multiple, setMultiple] = useState<boolean>(false)
	const [itemId, setItemId] = useState<number | undefined>(undefined)

	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	useEffect(() => {
		if (edit) {
			if (selectedItems?.length === 1) {
				setName(selectedItems[0].name || '')
				setAccessLevel(selectedItems[0].accessLevel ?? 0)
				setItemId(selectedItems[0].id)
				setMultiple(false)
			} else {
				setName('')
				setAccessLevel(0)
				setItemId(undefined)
				setMultiple(true)
			}
		} else {
			setName('')
			setAccessLevel(0)
			setItemId(undefined)
			setMultiple(false)
		}
	}, [openAddDialog, selectedItems, edit])

	function onNameChangeHandler(e: React.ChangeEvent<HTMLInputElement>) {
		setName(e.target.value)
	}

	function onAccessLevelChangeHandler(e: React.ChangeEvent<HTMLInputElement>) {
		setAccessLevel(Number(e.target.value))
	}

	function onSubmitHandler(e: React.FormEvent) {
		e.preventDefault()
		if (!edit) {
			const data = {
				name: name.trim(),
				accessLevel: accessLevel,
			}
			closeDialog()
			addItemHandler(data)
		} else if (edit && multiple) {
			const items: IAddAccessLevelDefinitionData[] =
				selectedItems?.map(e => ({
					id: e.id,
					name: e.name,
					accessLevel: e.accessLevel,
				})) || []
			closeDialog()
			addItemHandler(items)
		} else if (edit && !multiple) {
			const data = {
				id: itemId,
				name: name.trim(),
				accessLevel: accessLevel,
			}
			closeDialog()
			addItemHandler([data])
		}
	}

	function closeDialog() {
		setName('')
		setAccessLevel(0)
		setItemId(undefined)
		handleCloseAdd()
	}

	const isSubmitDisabled = !name.trim() || (edit && multiple)

	return (
		<Dialog sx={{ width: '100%' }} open={openAddDialog} onClose={closeDialog} closeAfterTransition={false}>
			<DialogTitle>{edit ? 'Edit access level' : 'Add access level'}</DialogTitle>
			<Box sx={{ padding: 0, margin: 0 }} onSubmit={onSubmitHandler} component='form' noValidate autoComplete='off'>
				<DialogContent>
					<Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
						<TextField
							autoFocus
							sx={{ mt: '1rem', width: isMobile ? 200 : 400 }}
							id='name'
							label='Name'
							onChange={onNameChangeHandler}
							disabled={multiple}
							value={name}
							required
						/>
						<TextField
							sx={{ mt: '1rem', width: isMobile ? 200 : 400 }}
							id='accessLevel'
							label='Access level'
							onChange={onAccessLevelChangeHandler}
							disabled={multiple}
							value={accessLevel}
							type='number'
							inputProps={{ min: 0 }}
						/>
					</Box>
				</DialogContent>
				<DialogActions>
					<Button variant='outlined' size={isMobile ? 'small' : 'medium'} onClick={closeDialog}>
						Cancel
					</Button>
					<Button variant='outlined' size={isMobile ? 'small' : 'medium'} type='submit' disabled={isSubmitDisabled}>
						{edit ? 'Save' : 'Add'}
					</Button>
				</DialogActions>
			</Box>
		</Dialog>
	)
}
