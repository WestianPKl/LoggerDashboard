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
import type { IAddFunctionalityDefinitionProps, IAddFunctionalityDefinitionData } from '../scripts/IAdmin'

export default function AdminAddFunctionalityDefinitionDialog({
	edit,
	selectedItems,
	openAddDialog,
	handleCloseAdd,
	addItemHandler,
}: IAddFunctionalityDefinitionProps) {
	const [name, setName] = useState<string | undefined>('')
	const [description, setDescription] = useState<string | undefined>('')
	const [multiple, setMultiple] = useState<boolean>(false)
	const [itemId, setItemId] = useState<number | undefined>(undefined)

	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	useEffect(() => {
		if (edit) {
			if (selectedItems?.length == 1) {
				setName(selectedItems[0].name)
				setDescription(selectedItems[0].description)
				setItemId(selectedItems[0].id)
				setMultiple(false)
				return
			} else {
				setName('')
				setDescription('')
				setMultiple(true)
				return
			}
		}
	}, [setMultiple, setName, setDescription, openAddDialog, selectedItems, edit])

	function onNameChangeHandler(e: React.ChangeEvent<HTMLInputElement>) {
		setName(e.target.value)
	}

	function onDescriptionChangeHandler(e: React.ChangeEvent<HTMLInputElement>) {
		setDescription(e.target.value)
	}

	function onSubmitHandler(e: React.FormEvent) {
		e.preventDefault()
		if (!edit) {
			const data = {
				name: name,
				description: description,
			}
			closeDialog()
			addItemHandler(data)
		} else if (edit && multiple) {
			let items: IAddFunctionalityDefinitionData[] = []
			selectedItems?.forEach(e => {
				if (e) {
					items.push({
						id: e.id,
						name: e.name,
						description: e.description,
					})
				}
			})
			closeDialog()
			addItemHandler(items)
		} else if (edit && !multiple) {
			const data = {
				id: itemId,
				name: name,
				description: description,
			}
			closeDialog()
			addItemHandler([data])
		}
	}

	function closeDialog() {
		setName('')
		setDescription('')
		handleCloseAdd()
	}

	return (
		<Dialog sx={{ width: '100%' }} open={openAddDialog} onClose={closeDialog} closeAfterTransition={false}>
			<DialogTitle>{edit ? 'Edit functionality definition' : 'Add functionality definition'}</DialogTitle>
			<Box sx={{ padding: 0, margin: 0 }} onSubmit={onSubmitHandler} component='form' noValidate autoComplete='off'>
				<DialogContent>
					<Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
						<TextField
							sx={{ mt: '1rem', width: isMobile ? 200 : 400 }}
							id='name'
							label='Name'
							onChange={onNameChangeHandler}
							disabled={multiple}
							value={name}
						/>
						<TextField
							sx={{ mt: '1rem', width: isMobile ? 200 : 400 }}
							id='description'
							label='Description'
							onChange={onDescriptionChangeHandler}
							disabled={multiple}
							value={description}
						/>
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
