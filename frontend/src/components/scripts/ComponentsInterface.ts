/**
 * Props for configuring a SnackBar component.
 *
 * @property message - The message or array of messages to display in the SnackBar.
 * @property severity - The severity level of the SnackBar, which determines its color and icon.
 *   Can be one of: 'success', 'info', 'warning', or 'error'.
 */
export interface ISnackBarProps {
	message: string[] | string
	severity: 'success' | 'info' | 'warning' | 'error'
}

/**
 * Props for the ComponentsWrapper component.
 *
 * @property children - The React node(s) to be rendered inside the wrapper.
 */
export interface IPropsComponentsWrapper {
	children: React.ReactNode
}
