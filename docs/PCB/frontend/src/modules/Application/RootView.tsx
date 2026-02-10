import { Outlet } from 'react-router'
import AppBarView from './AppBarView'
import Wrapper from '../../components/UI/Wrapper'
import { Box } from '@mui/material'

export default function RootView() {
	return (
		<Box component={'section'}>
			<AppBarView />
			<Wrapper>
				<Outlet />
			</Wrapper>
		</Box>
	)
}
