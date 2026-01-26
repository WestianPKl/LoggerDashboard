export interface ISnackBarProps {
	message: string[] | string
	severity: 'success' | 'info' | 'warning' | 'error'
}

export interface IPropsComponentsWrapper {
	children: React.ReactNode
}
