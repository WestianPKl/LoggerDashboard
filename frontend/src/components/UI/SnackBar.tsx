import { Alert, Box } from '@mui/material'
import type { ISnackBarProps } from '../scripts/ComponentsInterface'

export default function SnackBar({ message, severity }: ISnackBarProps) {
	let alertElement

	if (Array.isArray(message) && message.length >= 1) {
		alertElement = (
			<Alert
				variant='filled'
				sx={{ margin: 1, width: '25rem', position: 'fixed', bottom: 0 }}
				className='snack-bar'
				severity={severity}>
				<Box sx={{ display: 'flex', flexDirection: 'column' }}>
					{message.map((e: string, index: number) => (
						<span key={index}>{e}</span>
					))}
				</Box>
			</Alert>
		)
	} else if (typeof message === 'string') {
		alertElement = (
			<Alert
				variant='filled'
				sx={{ margin: 1, width: '20rem', position: 'fixed', bottom: 0 }}
				className='snack-bar'
				severity={severity}>
				{message}
			</Alert>
		)
	}

	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
				alignItems: 'center',
			}}>
			{alertElement}
		</Box>
	)
}
