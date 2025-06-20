import { useState, useEffect, useRef } from 'react'
import { Button, Box } from '@mui/material'
import { CameraAlt } from '@mui/icons-material'
import type { IUserAvatarProps } from '../scripts/IUser'

export default function UserAvatar({ avatarUrl, onAvatarChange }: IUserAvatarProps) {
	const [previewImg, setPreviewImg] = useState<string | null>(
		avatarUrl ? `${import.meta.env.VITE_API_IP}/${avatarUrl}?w=150&h=150&format=webp` : null
	)
	const inputRef = useRef<HTMLInputElement | null>(null)

	useEffect(() => {
		if (avatarUrl) {
			setPreviewImg(`${import.meta.env.VITE_API_IP}/${avatarUrl}?w=150&h=150&format=webp`)
		}
	}, [avatarUrl])

	function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0]
		if (file) {
			const reader = new FileReader()
			reader.onloadend = () => {
				setPreviewImg(reader.result as string)
				onAvatarChange(file)
				if (inputRef.current) inputRef.current.value = ''
			}
			reader.readAsDataURL(file)
		}
	}

	return (
		<Box sx={{ mb: 2 }} display='flex' justifyContent='center' alignItems='center' flexDirection='column'>
			<Box sx={{ width: 150, height: 150, mb: 2, mt: 2 }}>
				<img
					src={previewImg || ''}
					alt='User avatar'
					width={150}
					height={150}
					loading='lazy'
					style={{
						width: '100%',
						height: '100%',
						objectFit: 'cover',
						borderRadius: '50%',
						background: '#eee',
					}}
				/>
				{!previewImg && <span>U</span>}
			</Box>
			<Button variant='contained' component='label' startIcon={<CameraAlt />} sx={{ textTransform: 'none' }}>
				Upload Avatar
				<input type='file' accept='image/*' hidden onChange={handleAvatarChange} ref={inputRef} />
			</Button>
		</Box>
	)
}
