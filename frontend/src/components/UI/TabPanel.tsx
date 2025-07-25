import { Box } from '@mui/material'

interface TabPanelProps {
	children?: React.ReactNode
	index: number
	value: number
}

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

export function tabProps(index: number) {
	return {
		id: `tab-${index}`,
		'aria-controls': `tabpanel-${index}`,
	}
}
