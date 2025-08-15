import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'

/**
 * A simple loading indicator component that displays a centered circular progress spinner.
 *
 * @returns {JSX.Element} A React element containing a Material-UI CircularProgress centered within a Box.
 */
export default function LoadingCircle() {
	return (
		<Box
			sx={{ marginTop: '3rem', display: 'flex', textAlign: 'center', justifyContent: 'center', alignItems: 'center' }}>
			<CircularProgress />
		</Box>
	)
}
