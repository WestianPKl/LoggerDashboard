import { Container, useMediaQuery, useTheme } from '@mui/material'

export default function MainMenuView() {
	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	return (
		<Container
			maxWidth={isMobile ? 'sm' : 'xl'}
			sx={{ display: 'flex', justifyContent: 'center', alignContent: 'center' }}>
			<div>Main page</div>
		</Container>
	)
}
