import { ListItemText, Typography, useMediaQuery, useTheme, ListItemAvatar, Tooltip } from '@mui/material'
import WaterDropIcon from '@mui/icons-material/WaterDrop'
import SpeedIcon from '@mui/icons-material/Speed'
import ThermostatIcon from '@mui/icons-material/Thermostat'
import type { IHouseDetailsLoggerNodeListProps } from '../scripts/IHouseDetails'

/**
 * Renders a list item displaying the latest value from a logger node, including an icon,
 * parameter label, value with unit, and additional details in a tooltip for non-mobile devices.
 *
 * @param {IHouseDetailsLoggerNodeListProps} props - The props for the component.
 * @param {object} props.lastValue - The latest value object containing sensor data.
 * @param {string} props.lastValue.parameter - The type of parameter (e.g., 'temperature', 'humidity', 'atmPressure').
 * @param {number|string} props.lastValue.value - The value of the parameter.
 * @param {string} [props.lastValue.unit] - The unit of the parameter value.
 * @param {string|number} props.lastValue.equSensorId - The ID of the equipment sensor.
 * @param {string} props.lastValue.time - The timestamp of the value.
 *
 * @returns {JSX.Element | null} The rendered list item with icon, label, and value, or null if no value is provided.
 */
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
