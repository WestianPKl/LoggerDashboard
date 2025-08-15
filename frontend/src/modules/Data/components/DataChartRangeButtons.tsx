import { Button, Stack, useMediaQuery, useTheme } from '@mui/material'
import type { IDataChartRangeButtonsProps } from '../scripts/IData'

/**
 * Renders a set of range selection buttons for a data chart, allowing users to select a time range
 * (e.g., last hour, day, week, month, or all data) and reset the selection.
 *
 * @param range - The currently selected range label (e.g., '1h', '1d', '1w', '1m', 'all').
 * @param handleRangeChange - Callback function invoked when a range button is clicked, receiving the selected range label.
 * @param handleReset - Callback function invoked when the "Reset" button is clicked.
 *
 * The component is responsive and adjusts its layout for mobile devices.
 */
export default function DataChartRangeButtons({ range, handleRangeChange, handleReset }: IDataChartRangeButtonsProps) {
	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	return (
		<Stack
			direction={isMobile ? 'column' : 'row'}
			spacing={isMobile ? 0 : 2}
			flexWrap='wrap'
			alignItems='center'
			mb={2}>
			{[
				{ label: '1h', name: 'Last hour' },
				{ label: '1d', name: 'Last day' },
				{ label: '1w', name: 'Last week' },
				{ label: '1m', name: 'Last month' },
				{ label: 'all', name: 'All data' },
			].map((r: any) => (
				<Button
					sx={{ mb: isMobile ? 1 : 0 }}
					size={isMobile ? 'small' : 'medium'}
					key={r.label}
					variant={range === r.label ? 'contained' : 'outlined'}
					onClick={() => handleRangeChange(r.label)}>
					{r.name}
				</Button>
			))}
			<Button
				sx={{ mb: isMobile ? 1 : 0 }}
				size={isMobile ? 'small' : 'medium'}
				variant='outlined'
				color='error'
				onClick={handleReset}>
				Reset
			</Button>
		</Stack>
	)
}
