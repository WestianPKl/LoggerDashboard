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

/**
 * Renders a card component displaying information about a house or dashboard item.
 *
 * @param {IDashboardCardProps} props - The properties object.
 * @param {object} props.data - The data object containing house details.
 * @param {number} props.data.id - The unique identifier for the house.
 * @param {string} [props.data.pictureLink] - The relative path to the house's image.
 * @param {string} [props.data.name] - The name of the house.
 * @param {string} [props.data.postalCode] - The postal code of the house.
 * @param {string} [props.data.city] - The city where the house is located.
 * @param {string} [props.data.street] - The street address of the house.
 * @param {string|number} [props.data.houseNumber] - The house number.
 *
 * Navigates to the house details page when the card is clicked.
 * Displays a fallback image if no picture link is provided.
 * Adjusts card width responsively based on screen size.
 */
export default function DashboardCard({ data }: IDashboardCardProps) {
	const navigate = useNavigate()
	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	/**
	 * Handles the click event for a house item.
	 * Navigates to the house details page if a valid house ID is provided.
	 *
	 * @param id - The optional ID of the house to navigate to. If not provided, no navigation occurs.
	 */
	function houseClickHandler(id?: number): void {
		if (id) {
			navigate(`/house-details/${id}`)
		}
	}

	return (
		<Grid size={{ xs: 2, sm: 4, md: 6 }} key={data.id}>
			<Card sx={{ margin: '1rem', minWidth: isMobile ? 200 : 300, maxWidth: 400, height: 350 }}>
				<CardActionArea sx={{ width: '100%', height: '100%' }} onClick={() => houseClickHandler(data.id)}>
					<CardMedia
						component='img'
						height='200'
						loading='lazy'
						image={
							data.pictureLink
								? `${import.meta.env.VITE_API_IP}/${data.pictureLink}?w=200&h=200&format=webp`
								: fallbackImage
						}
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
