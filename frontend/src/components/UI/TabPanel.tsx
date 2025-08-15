import { Box } from '@mui/material'

/**
 * Props for the TabPanel component.
 *
 * @remarks
 * Used to control the visibility and content of a tab panel in a tabbed interface.
 *
 * @property children - The content to display within the tab panel.
 * @property index - The index of this tab panel.
 * @property value - The currently selected tab index; the panel is shown when this matches `index`.
 */
interface TabPanelProps {
	children?: React.ReactNode
	index: number
	value: number
}

/**
 * A React component that renders the content of a tab panel.
 *
 * Displays its children only when the `value` prop matches the `index` prop,
 * making it suitable for use with tabbed interfaces.
 *
 * @param props - The props for the TabPanel component.
 * @param props.children - The content to display within the tab panel.
 * @param props.value - The currently selected tab index.
 * @param props.index - The index of this tab panel.
 * @returns The rendered tab panel content if active, otherwise null.
 */
export default function TabPanel(props: TabPanelProps) {
	const { children, value, index, ...other } = props

	return (
		<div role='tabpanel' hidden={value !== index} id={`tabpanel-${index}`} aria-labelledby={`tab-${index}`} {...other}>
			{value === index && (
				<Box component='div' sx={{ p: 3 }}>
					{children}
				</Box>
			)}
		</div>
	)
}

/**
 * Generates accessibility properties for a tab element.
 *
 * @param index - The index of the tab.
 * @returns An object containing the `id` and `aria-controls` attributes for the tab.
 */
export function tabProps(index: number): { id: string; 'aria-controls': string } {
	return {
		id: `tab-${index}`,
		'aria-controls': `tabpanel-${index}`,
	}
}
