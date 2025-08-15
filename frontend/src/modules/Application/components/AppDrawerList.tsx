import { Box, List, Divider, useMediaQuery, useTheme } from '@mui/material'
import AppDrawerItem from './AppDrawerItem'
import type { IAppDrawerListProps, IAppDrawerArray } from '../scripts/AppInterface'
import HomeIcon from '@mui/icons-material/Home'
import HouseIcon from '@mui/icons-material/House'
import DeviceThermostatIcon from '@mui/icons-material/DeviceThermostat'
import StorageIcon from '@mui/icons-material/Storage'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import AccountBoxIcon from '@mui/icons-material/AccountBox'
import LogoutIcon from '@mui/icons-material/Logout'
import { useAppSelector } from '../../../store/hooks'
import { canRead } from '../../../store/auth-actions'
import { useMemo } from 'react'

/**
 * Renders the application drawer list with navigation items based on user permissions and device type.
 *
 * @param {IAppDrawerListProps} props - The props for the AppDrawerList component.
 * @param {Function} props.toggleDrawer - Callback to toggle the drawer open or closed.
 *
 * @returns {JSX.Element} The rendered drawer list containing navigation and additional items.
 *
 * @remarks
 * - Uses user permissions from the Redux store to determine which navigation items to display.
 * - Adjusts item labels and drawer width based on whether the device is mobile.
 * - Includes main navigation items and additional items such as Admin panel, Profile, and Logout.
 */
export default function AppDrawerList({ toggleDrawer }: IAppDrawerListProps) {
	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	const canReadHouse = useAppSelector(state => canRead('house', null)(state))
	const canReadEquipment = useAppSelector(state => canRead('equ', null)(state))
	const canReadData = useAppSelector(state => canRead('data', null)(state))
	const canReadAdmin = useAppSelector(state => canRead('adm', null)(state))

	/**
	 * Memoized array of navigation items for the application drawer.
	 *
	 * The list is dynamically constructed based on the user's permissions and device type:
	 * - Always includes a "Main" or "Main page" item (label depends on `isMobile`).
	 * - Adds "Houses" if `canReadHouse` is true.
	 * - Adds "Equipment" if `canReadEquipment` is true.
	 * - Adds "Data" if `canReadData` is true.
	 *
	 * Dependencies:
	 * - `canReadHouse`: Determines if the "Houses" item is included.
	 * - `canReadEquipment`: Determines if the "Equipment" item is included.
	 * - `canReadData`: Determines if the "Data" item is included.
	 * - `isMobile`: Affects the label of the main navigation item.
	 *
	 * @returns {IAppDrawerArray[]} Array of navigation items for the drawer.
	 */
	const listItems: IAppDrawerArray[] = useMemo(() => {
		const items: IAppDrawerArray[] = [{ id: 1, text: isMobile ? 'Main' : 'Main page', icon: <HomeIcon />, link: '/' }]
		if (canReadHouse) items.push({ id: 2, text: 'Houses', icon: <HouseIcon />, link: '/house' })
		if (canReadEquipment) items.push({ id: 3, text: 'Equipment', icon: <DeviceThermostatIcon />, link: '/equipment' })
		if (canReadData) items.push({ id: 4, text: 'Data', icon: <StorageIcon />, link: '/data' })
		return items
	}, [canReadHouse, canReadEquipment, canReadData, isMobile])

	/**
	 * Memoized array of additional drawer items for the application sidebar.
	 *
	 * The array is dynamically constructed based on the user's permissions and device type.
	 * - If the user has admin read access (`canReadAdmin`), an "Admin" or "Administration panel" item is added,
	 *   with the label depending on whether the device is mobile.
	 * - Always includes "Profile" and "Logout" items.
	 *
	 * Dependencies:
	 * - `canReadAdmin`: Determines if the admin panel item should be included.
	 * - `isMobile`: Controls the label for the admin panel item.
	 *
	 * @returns {IAppDrawerArray[]} Array of drawer item objects to be rendered in the sidebar.
	 */
	const additionalItems: IAppDrawerArray[] = useMemo(() => {
		const items: IAppDrawerArray[] = []
		if (canReadAdmin) {
			items.push({
				id: 10,
				text: isMobile ? 'Admin' : 'Administration panel',
				icon: <AdminPanelSettingsIcon />,
				link: '/admin-panel',
			})
		}
		items.push({ id: 11, text: 'Profile', icon: <AccountBoxIcon />, link: '/profile' })
		items.push({ id: 12, text: 'Logout', icon: <LogoutIcon />, link: '' })
		return items
	}, [canReadAdmin, isMobile])

	return (
		<Box sx={{ width: isMobile ? 180 : 250 }} role='presentation'>
			<List onClick={() => toggleDrawer(false)}>
				{listItems.map(ele => (
					<AppDrawerItem key={ele.id} text={ele.text} icon={ele.icon} link={ele.link} />
				))}
			</List>
			<Divider />
			<List onClick={() => toggleDrawer(false)}>
				{additionalItems.map(ele => (
					<AppDrawerItem key={ele.id} text={ele.text} icon={ele.icon} link={ele.link} />
				))}
			</List>
		</Box>
	)
}
