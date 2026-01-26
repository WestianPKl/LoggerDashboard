import { ListItemText, Typography, useMediaQuery, useTheme, ListItemAvatar, Tooltip } from '@mui/material'
import WaterDropIcon from '@mui/icons-material/WaterDrop'
import SpeedIcon from '@mui/icons-material/Speed'
import ThermostatIcon from '@mui/icons-material/Thermostat'
import type { IHouseDetailsLoggerNodeListProps } from '../scripts/IHouseDetails'

export default function HouseDetailsLoggerNodeList({ lastValue }: IHouseDetailsLoggerNodeListProps) {
	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	if (!lastValue) return null

	let IconComponent = null
	switch (lastValue.parameter) {
		case 'temperature':
			IconComponent = <ThermostatIcon />
			break
		case 'humidity':
			IconComponent = <WaterDropIcon />
			break
		case 'atmPressure':
			IconComponent = <SpeedIcon />
			break
		default:
			IconComponent = null
	}

	return (
		<>
			<ListItemAvatar>{IconComponent}</ListItemAvatar>
			<ListItemText>
				{!isMobile ? (
					<Tooltip title={`Sensor: ID${lastValue.equSensorId} • Time: ${lastValue.time}`}>
						<Typography variant='body2'>
							{lastValue.parameter && typeof lastValue.parameter === 'string'
								? `${lastValue.parameter.charAt(0).toUpperCase()}${lastValue.parameter.slice(1)}`
								: '-'}
							: {`${lastValue.value ?? '-'}${lastValue.unit ? ` ${lastValue.unit}` : ''}`}
						</Typography>
					</Tooltip>
				) : (
					<Typography variant='body2'>{`${lastValue.value ?? '-'}${
						lastValue.unit ? ` ${lastValue.unit}` : ''
					}`}</Typography>
				)}
			</ListItemText>
		</>
	)
}
