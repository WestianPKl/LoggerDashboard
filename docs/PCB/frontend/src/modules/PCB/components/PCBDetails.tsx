import { useState, useEffect, useRef } from 'react'
import { Button, Box, TextField, Typography, Paper, useMediaQuery, useTheme } from '@mui/material'
import classes from './PCBDetails.module.css'
import formatLocalDateTime from '../../../components/scripts/ComponentsInterface'
import type { PCBClass } from '../scripts/PCB'
import type { IAddPCBData } from '../scripts/PCBs'
import DeveloperBoardIcon from '@mui/icons-material/DeveloperBoardOutlined'
import SaveIcon from '@mui/icons-material/Save'
import ImageIcon from '@mui/icons-material/Image'

export default function PCBDetails({
	pcb,
	editPCBHandler,
}: {
	pcb: PCBClass
	editPCBHandler: (data: IAddPCBData) => void
}) {
	const [name, setName] = useState<string>('')
	const [revision, setRevision] = useState<string | undefined>('')
	const [comment, setComment] = useState<string | undefined>('')
	const [enteredTopImg, setEnteredTopImg] = useState<any>(undefined)
	const [previewTopImg, setPreviewTopImg] = useState<any>(undefined)
	const [enteredBottomImg, setEnteredBottomImg] = useState<any>(undefined)
	const [previewBottomImg, setPreviewBottomImg] = useState<any>(undefined)
	const imgPickerTopRef = useRef<any>(null)
	const imgPickerBottomRef = useRef<any>(null)

	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	useEffect(() => {
		setName(pcb.name || '')
		setRevision(pcb.revision)
		setComment(pcb.comment)
		setEnteredTopImg(pcb.topUrl)
		setEnteredBottomImg(pcb.bottomUrl)
	}, [pcb])

	useEffect(() => {
		if (!enteredTopImg) {
			setPreviewTopImg(undefined)
			return
		}
		if (typeof enteredTopImg === 'string') {
			setPreviewTopImg(`${import.meta.env.VITE_API_IP}/${enteredTopImg}?w=50&h=50&format=webp`)
			return
		}
		const fileReader = new FileReader()
		fileReader.onload = () => {
			setPreviewTopImg(fileReader.result)
		}
		fileReader.readAsDataURL(enteredTopImg)
	}, [enteredTopImg])

	useEffect(() => {
		if (!enteredBottomImg) {
			setPreviewBottomImg(undefined)
			return
		}
		if (typeof enteredBottomImg === 'string') {
			setPreviewBottomImg(`${import.meta.env.VITE_API_IP}/${enteredBottomImg}?w=50&h=50&format=webp`)
			return
		}
		const fileReader = new FileReader()
		fileReader.onload = () => {
			setPreviewBottomImg(fileReader.result)
		}
		fileReader.readAsDataURL(enteredBottomImg)
	}, [enteredBottomImg])

	function onNameChangeHandler(e: React.ChangeEvent<HTMLInputElement>): void {
		setName(e.target.value)
	}
	function onRevisionChangeHandler(e: React.ChangeEvent<HTMLInputElement>): void {
		setRevision(e.target.value)
	}
	function onCommentChangeHandler(e: React.ChangeEvent<HTMLInputElement>): void {
		setComment(e.target.value)
	}

	function pickTopImg(): void {
		imgPickerTopRef.current.click()
	}

	function pickBottomImg(): void {
		imgPickerBottomRef.current.click()
	}

	function imgTopHandler(e: React.ChangeEvent<HTMLInputElement>): void {
		if (e.target.files && e.target.files[0]) {
			setEnteredTopImg(e.target.files[0])
		}
	}

	function imgBottomHandler(e: React.ChangeEvent<HTMLInputElement>): void {
		if (e.target.files && e.target.files[0]) {
			setEnteredBottomImg(e.target.files[0])
		}
	}

	function onSubmitHandler(e: React.FormEvent): void {
		e.preventDefault()
		const data = {
			id: pcb.id,
			name,
			revision,
			comment,
			topImage: enteredTopImg,
			bottomImage: enteredBottomImg,
		}
		editPCBHandler(data)
	}

	return (
		<Paper
			elevation={0}
			sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: { xs: 2, md: 4 }, mb: 4 }}>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
				<Box
					sx={{
						width: 44,
						height: 44,
						borderRadius: 2,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						backgroundColor: '#dcfce7',
						color: '#16a34a',
					}}>
					<DeveloperBoardIcon />
				</Box>
				<Box>
					<Typography variant='h5' sx={{ fontWeight: 700, lineHeight: 1.2 }}>
						{pcb.name || 'PCB'}
					</Typography>
					<Typography variant='body2' color='text.secondary'>
						Szczegóły płytki drukowanej
					</Typography>
				</Box>
			</Box>

			<Box onSubmit={onSubmitHandler} component='form' noValidate autoComplete='off'>
				<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
					<TextField
						size='small'
						sx={{ flex: '1 1 200px' }}
						id='name'
						label='Nazwa'
						onChange={onNameChangeHandler}
						value={name}
					/>
					<TextField
						size='small'
						sx={{ flex: '1 1 200px' }}
						id='revision'
						label='Rewizja'
						onChange={onRevisionChangeHandler}
						value={revision}
					/>
					<TextField
						size='small'
						sx={{ flex: '1 1 200px' }}
						id='comment'
						label='Komentarz'
						onChange={onCommentChangeHandler}
						value={comment}
					/>
				</Box>

				<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'center', mb: 3 }}>
					<Box sx={{ textAlign: 'center' }}>
						<Typography variant='subtitle2' color='text.secondary' sx={{ mb: 1 }}>
							Góra PCB
						</Typography>
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
									<img src={previewTopImg} alt='Preview' className={classes.img} style={{ borderRadius: 8 }} />
								</div>
							)}
							<div className={classes.img_action}>
								<Button variant='outlined' type='button' size='small' startIcon={<ImageIcon />} onClick={pickTopImg}>
									Wybierz zdjęcie
								</Button>
							</div>
						</div>
					</Box>

					<Box sx={{ textAlign: 'center' }}>
						<Typography variant='subtitle2' color='text.secondary' sx={{ mb: 1 }}>
							Dół PCB
						</Typography>
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
									<img src={previewBottomImg} alt='Preview' className={classes.img} style={{ borderRadius: 8 }} />
								</div>
							)}
							<div className={classes.img_action}>
								<Button variant='outlined' type='button' size='small' startIcon={<ImageIcon />} onClick={pickBottomImg}>
									Wybierz zdjęcie
								</Button>
							</div>
						</div>
					</Box>
				</Box>

				<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
					<TextField
						size='small'
						sx={{ flex: '1 1 200px' }}
						label='Utworzono'
						disabled
						value={pcb.createdAt ? formatLocalDateTime(pcb.createdAt) : '-'}
					/>
					<TextField
						size='small'
						sx={{ flex: '1 1 200px' }}
						label='Zaktualizowano'
						disabled
						value={pcb.updatedAt ? formatLocalDateTime(pcb.updatedAt) : '-'}
					/>
				</Box>

				<Box sx={{ textAlign: 'right' }}>
					<Button
						variant='contained'
						color='primary'
						size={isMobile ? 'small' : 'medium'}
						type='submit'
						startIcon={<SaveIcon />}
						disabled={!name.trim()}>
						Zapisz zmiany
					</Button>
				</Box>
			</Box>
		</Paper>
	)
}
