import { useEffect, useState, useRef } from 'react'
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
import type { IAddHouseData, IAddHouseProps } from '../scripts/IHouse'
import classes from './AddHouseDialog.module.css'

export default function AddHouseDialog({
	edit,
	selectedItems,
	openAddDialog,
	handleCloseAdd,
	addItemHandler,
}: IAddHouseProps) {
	const [name, setName] = useState('')
	const [postalCode, setPostalCode] = useState('')
	const [city, setCity] = useState('')
	const [street, setStreet] = useState('')
	const [houseNumber, setHouseNumber] = useState('')
	const [enteredImg, setEnteredImg] = useState<File | string | undefined>(undefined)
	const [previewImg, setPreviewImg] = useState<string | undefined>(undefined)
	const [multiple, setMultiple] = useState(false)
	const [itemId, setItemId] = useState<number | undefined>(undefined)

	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
	const imgPickerRef = useRef<HTMLInputElement | null>(null)

	useEffect(() => {
		if (edit) {
			if (selectedItems?.length === 1) {
				const item = selectedItems[0]
				setName(item.name || '')
				setPostalCode(item.postalCode || '')
				setCity(item.city || '')
				setStreet(item.street || '')
				setHouseNumber(item.houseNumber || '')
				setItemId(item.id)
				setEnteredImg(item.pictureLink)
				setMultiple(false)
			} else {
				setName('')
				setPostalCode('')
				setCity('')
				setStreet('')
				setHouseNumber('')
				setItemId(undefined)
				setEnteredImg(undefined)
				setMultiple(true)
			}
		} else {
			setName('')
			setPostalCode('')
			setCity('')
			setStreet('')
			setHouseNumber('')
			setItemId(undefined)
			setEnteredImg(undefined)
			setMultiple(false)
		}
		setPreviewImg(undefined)
	}, [openAddDialog, edit, selectedItems])

	useEffect(() => {
		if (!enteredImg) {
			setPreviewImg(undefined)
			return
		}
		if (enteredImg instanceof File) {
			const fileReader = new FileReader()
			fileReader.onload = () => setPreviewImg(fileReader.result as string)
			fileReader.readAsDataURL(enteredImg)
		} else if (typeof enteredImg === 'string' && enteredImg.length > 0) {
			setPreviewImg(`${import.meta.env.VITE_API_IP}/${enteredImg}?w=100&h=100&format=webp`)
		}
	}, [enteredImg])

	function pickImg() {
		imgPickerRef.current?.click()
	}

	function imgHandler(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0]
		if (file) setEnteredImg(file)
	}

	function closeDialog() {
		handleCloseAdd()
	}

	function onSubmitHandler(e: React.FormEvent) {
		e.preventDefault()
		if (!edit) {
			const data: IAddHouseData = {
				name,
				postalCode,
				city,
				street,
				houseNumber,
				pictureLink: enteredImg,
			}
			addItemHandler(data)
		} else if (edit && multiple) {
			const items: IAddHouseData[] =
				selectedItems?.map(item => ({
					id: item.id,
					name: item.name,
					postalCode: item.postalCode,
					city: item.city,
					street: item.street,
					houseNumber: item.houseNumber,
					pictureLink: item.pictureLink,
				})) || []
			addItemHandler(items)
		} else if (edit && !multiple) {
			const data: IAddHouseData = {
				id: itemId,
				name,
				postalCode,
				city,
				street,
				houseNumber,
				pictureLink: enteredImg,
			}
			addItemHandler([data])
		}
		closeDialog()
	}

	return (
		<Dialog sx={{ width: '100%' }} open={openAddDialog} onClose={closeDialog} closeAfterTransition={false}>
			<DialogTitle>{edit ? 'Edit house' : 'Add house'}</DialogTitle>
			<Box sx={{ padding: 0, margin: 0 }} onSubmit={onSubmitHandler} component='form' noValidate autoComplete='off'>
				<DialogContent>
					<Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
						<TextField
							sx={{ mt: 1, width: isMobile ? 200 : 400 }}
							id='name'
							label='Name'
							autoComplete='off'
							onChange={e => setName(e.target.value)}
							disabled={multiple}
							value={name}
						/>
						<TextField
							sx={{ mt: 1, width: isMobile ? 200 : 400 }}
							id='postalCode'
							label='Postal code'
							autoComplete='off'
							onChange={e => setPostalCode(e.target.value)}
							disabled={multiple}
							value={postalCode}
						/>
						<TextField
							sx={{ mt: 1, width: isMobile ? 200 : 400 }}
							id='city'
							label='City'
							onChange={e => setCity(e.target.value)}
							disabled={multiple}
							value={city}
						/>
						<TextField
							sx={{ mt: 1, width: isMobile ? 200 : 400 }}
							id='street'
							label='Street'
							onChange={e => setStreet(e.target.value)}
							disabled={multiple}
							value={street}
						/>
						<TextField
							sx={{ mt: 1, width: isMobile ? 200 : 400 }}
							id='houseNumber'
							label='House number'
							onChange={e => setHouseNumber(e.target.value)}
							disabled={multiple}
							value={houseNumber}
						/>
						<input
							type='file'
							id='img'
							ref={imgPickerRef}
							style={{ display: 'none' }}
							accept='.jpg,.png,.jpeg'
							onChange={imgHandler}
						/>
						<div className={classes.imgHolder}>
							{previewImg && (
								<div className={classes.img}>
									<img src={previewImg} alt='Preview' className={classes.img} />
								</div>
							)}
							<div className={classes.img_action}>
								<Button type='button' size={isMobile ? 'small' : 'medium'} onClick={pickImg}>
									Choose picture!
								</Button>
							</div>
						</div>
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
