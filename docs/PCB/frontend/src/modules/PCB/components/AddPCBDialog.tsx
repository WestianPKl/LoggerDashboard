import { useEffect, useRef, useState } from 'react'
import { Box, TextField, Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material'
import type { IAddPCBProps } from '../scripts/PCBs'
import classes from './AddPCBDialog.module.css'

export default function AddPCBDialog({
	edit,
	selectedItems,
	openAddDialog,
	handleCloseAdd,
	addItemHandler,
}: IAddPCBProps) {
	const [name, setName] = useState('')
	const [revision, setRevision] = useState('')
	const [comment, setComment] = useState('')
	const [enteredTopImg, setEnteredTopImg] = useState<File | string | undefined>(undefined)
	const [previewTopImg, setPreviewTopImg] = useState<string | undefined>(undefined)
	const [enteredBottomImg, setEnteredBottomImg] = useState<File | string | undefined>(undefined)
	const [previewBottomImg, setPreviewBottomImg] = useState<string | undefined>(undefined)

	const [multiple, setMultiple] = useState(false)
	const [itemId, setItemId] = useState<number | undefined>(undefined)

	const imgPickerTopRef = useRef<HTMLInputElement | null>(null)
	const imgPickerBottomRef = useRef<HTMLInputElement | null>(null)

	useEffect(() => {
		if (edit) {
			if (selectedItems?.length === 1) {
				setName(selectedItems[0].name || '')
				setRevision(selectedItems[0].revision || '')
				setComment(selectedItems[0].comment || '')
				setItemId(selectedItems[0].id)
				setEnteredTopImg(selectedItems[0].topUrl)
				setEnteredBottomImg(selectedItems[0].bottomUrl)
				setMultiple(false)
			} else {
				setMultiple(true)
			}
		} else {
			setMultiple(false)
		}
	}, [openAddDialog, edit, selectedItems])

	function onNameChangeHandler(e: React.ChangeEvent<HTMLInputElement>): void {
		setName(e.target.value)
	}

	function onRevisionChangeHandler(e: React.ChangeEvent<HTMLInputElement>): void {
		setRevision(e.target.value)
	}

	function onCommentChangeHandler(e: React.ChangeEvent<HTMLInputElement>): void {
		setComment(e.target.value)
	}

	function closeDialog(): void {
		handleCloseAdd()
	}

	useEffect(() => {
		if (!enteredTopImg) {
			setPreviewTopImg(undefined)
			return
		}
		if (enteredTopImg instanceof File) {
			const fileReader = new FileReader()
			fileReader.onload = () => setPreviewTopImg(fileReader.result as string)
			fileReader.readAsDataURL(enteredTopImg)
		} else if (typeof enteredTopImg === 'string' && enteredTopImg.length > 0) {
			setPreviewTopImg(`${import.meta.env.VITE_API_IP}/${enteredTopImg}?w=100&h=100&format=webp`)
		}
	}, [enteredTopImg])

	function pickTopImg(): void {
		imgPickerTopRef.current?.click()
	}

	useEffect(() => {
		if (!enteredBottomImg) {
			setPreviewBottomImg(undefined)
			return
		}
		if (enteredBottomImg instanceof File) {
			const fileReader = new FileReader()
			fileReader.onload = () => setPreviewBottomImg(fileReader.result as string)
			fileReader.readAsDataURL(enteredBottomImg)
		} else if (typeof enteredBottomImg === 'string' && enteredBottomImg.length > 0) {
			setPreviewBottomImg(`${import.meta.env.VITE_API_IP}/${enteredBottomImg}?w=100&h=100&format=webp`)
		}
	}, [enteredBottomImg])

	function pickBottomImg(): void {
		imgPickerBottomRef.current?.click()
	}

	function onSubmitHandler(e: React.FormEvent): void {
		e.preventDefault()
		if (!edit) {
			addItemHandler({
				name,
				revision,
				comment,
				topUrl: enteredTopImg,
				bottomUrl: enteredBottomImg,
			})
		} else if (edit && multiple) {
			addItemHandler(
				selectedItems?.map(e => ({
					id: e.id,
					name: e.name,
					revision: e.revision,
					comment: e.comment,
					topUrl: e.topUrl,
					bottomUrl: e.bottomUrl,
				})) || [],
			)
		} else if (edit && !multiple) {
			addItemHandler([
				{
					id: itemId,
					name,
					revision,
					comment,
					topUrl: enteredTopImg,
					bottomUrl: enteredBottomImg,
				},
			])
		}
		setName('')
		setRevision('')
		setComment('')
		setEnteredTopImg(undefined)
		setEnteredBottomImg(undefined)
		setPreviewTopImg(undefined)
		setPreviewBottomImg(undefined)
		setItemId(undefined)
		closeDialog()
	}

	function imgTopHandler(e: React.ChangeEvent<HTMLInputElement>): void {
		const file = e.target.files?.[0]
		if (file) setEnteredTopImg(file)
	}

	function imgBottomHandler(e: React.ChangeEvent<HTMLInputElement>): void {
		const file = e.target.files?.[0]
		if (file) setEnteredBottomImg(file)
	}

	return (
		<Dialog open={openAddDialog} onClose={closeDialog} closeAfterTransition={false} maxWidth='sm' fullWidth>
			<DialogTitle sx={{ fontWeight: 600 }}>{edit ? 'Edytuj PCB' : 'Dodaj PCB'}</DialogTitle>
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
						<TextField
							fullWidth
							size='small'
							id='revision'
							label='Rewizja'
							onChange={onRevisionChangeHandler}
							disabled={multiple}
							value={revision}
						/>
						<TextField
							fullWidth
							size='small'
							id='comment'
							label='Komentarz'
							onChange={onCommentChangeHandler}
							disabled={multiple}
							value={comment}
						/>
						<input
							type='file'
							id='imgTop'
							ref={imgPickerTopRef}
							style={{ display: 'none' }}
							accept='.jpg,.png,.jpeg'
							onChange={imgTopHandler}
						/>
						<div className={classes.imgHolder}>
							{previewTopImg && (
								<div className={classes.img}>
									<img src={previewTopImg} alt='Preview' className={classes.img} />
								</div>
							)}
							<div className={classes.img_action}>
								<Button type='button' size='small' onClick={pickTopImg}>
									Wybierz obraz (góra)
								</Button>
							</div>
						</div>
						<input
							type='file'
							id='imgBottom'
							ref={imgPickerBottomRef}
							style={{ display: 'none' }}
							accept='.jpg,.png,.jpeg'
							onChange={imgBottomHandler}
						/>
						<div className={classes.imgHolder}>
							{previewBottomImg && (
								<div className={classes.img}>
									<img src={previewBottomImg} alt='Preview' className={classes.img} />
								</div>
							)}
							<div className={classes.img_action}>
								<Button type='button' size='small' onClick={pickBottomImg}>
									Wybierz obraz (dół)
								</Button>
							</div>
						</div>
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
