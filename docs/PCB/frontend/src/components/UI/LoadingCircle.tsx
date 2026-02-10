import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'

export default function LoadingCircle() {
	return (
		<Box
			sx={{ marginTop: '3rem', display: 'flex', textAlign: 'center', justifyContent: 'center', alignItems: 'center' }}>
			<CircularProgress />
		</Box>
	)
}
