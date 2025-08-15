import { Grid, Typography } from '@mui/material'
import type { IHouseDetailsFloorProps } from '../scripts/IHouseDetails'
import HouseDetailsMobileCard from './HouseDetailsMobileCard'

/**
 * Renders a mobile-friendly view of the loggers assigned to a specific floor.
 *
 * Displays a message if there are no assigned loggers. Otherwise, renders a grid of `HouseDetailsMobileCard`
 * components for each logger associated with the floor.
 *
 * @param floor - The floor object containing logger assignments and metadata.
 * @returns A React element displaying either a message or a grid of logger cards.
 */
export default function HouseDetailsMobile({ floor }: IHouseDetailsFloorProps) {
	if (!floor.loggers || floor.loggers.length === 0) {
		return (
			<Typography variant='body2' color='text.secondary' sx={{ mt: 2, textAlign: 'center' }}>
				No assigned loggers
			</Typography>
		)
	}

	return (
		<Grid
			container
			spacing={{ xs: 2, md: 3 }}
			columns={{ xs: 2, sm: 8, md: 12 }}
			justifyContent='center'
			alignItems='center'
			sx={{
				textAlign: 'center',
			}}>
			{floor.loggers.map(e =>
				e.logger ? (
					<Grid container spacing={{ xs: 2, md: 2 }} columns={{ xs: 2, sm: 4, md: 4 }} key={e.id}>
						<HouseDetailsMobileCard logger={e.logger} floorId={floor.id} houseLoggerId={e.id} />
					</Grid>
				) : null
			)}
		</Grid>
	)
}
