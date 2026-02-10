import { Box } from '@mui/material'
import type { IPropsComponentsWrapper } from '../scripts/ComponentsInterface'

export default function Wrapper(props: IPropsComponentsWrapper) {
	return (
		<Box
			component={'main'}
			sx={{
				marginTop: '2rem',
				display: 'flex',
				flexDirection: 'column',
				flexWrap: 'nowrap',
				width: '100%',
			}}>
			{props.children}
		</Box>
	)
}
