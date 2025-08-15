import { Box } from '@mui/material'
import type { IPropsComponentsWrapper } from '../scripts/ComponentsInterface'

/**
 * A layout component that wraps its children in a styled Material-UI `Box` element.
 *
 * @param props - The properties for the Wrapper component.
 * @param props.children - The React nodes to be rendered inside the wrapper.
 *
 * @remarks
 * This component applies a top margin, flex column layout, and full width to its content.
 */
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
