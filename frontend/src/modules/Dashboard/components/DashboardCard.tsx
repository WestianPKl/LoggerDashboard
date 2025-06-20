import { useNavigate } from 'react-router'
import {
	Card,
	CardContent,
	Typography,
	CardActionArea,
	CardMedia,
	Box,
	Grid,
	useMediaQuery,
	useTheme,
} from '@mui/material'
import type { IDashboardCardProps } from '../scripts/IDashboard'

const fallbackImage = '/img/house-placeholder.webp'

export default function DashboardCard({ data }: IDashboardCardProps) {
	const navigate = useNavigate()
	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	function houseClickHandler(id?: number) {
		if (id) {
			navigate(`/house-details/${id}`)
		}
	}

	const imageUrl = data.pictureLink
		? `${import.meta.env.VITE_API_IP}/${data.pictureLink}?w=200&h=200&format=webp`
		: fallbackImage

	return (
		<Grid size={{ xs: 2, sm: 4, md: 6 }} key={data.id}>
			<Card sx={{ margin: '1rem', minWidth: isMobile ? 200 : 300, maxWidth: 400, height: 350 }}>
				<CardActionArea sx={{ width: '100%', height: '100%' }} onClick={() => houseClickHandler(data.id)}>
					<CardMedia
						component='img'
						height='200'
						loading='lazy'
						image={imageUrl}
						alt={`House ${data.name || ''} picture`}
					/>
					<CardContent>
						<Typography gutterBottom variant='h5' component='div'>
							{data.name || 'Unknown'}
						</Typography>
						<Box sx={{ height: 50 }}>
							<Typography variant='body2' sx={{ color: 'text.secondary' }}>
								{`${data.postalCode || ''} ${data.city || ''}`}
							</Typography>
							<Typography variant='body2' sx={{ color: 'text.secondary' }}>
								{`${data.street || ''} ${data.houseNumber || ''}`}
							</Typography>
						</Box>
					</CardContent>
				</CardActionArea>
			</Card>
		</Grid>
	)
}
