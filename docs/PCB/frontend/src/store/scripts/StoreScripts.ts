export interface IApplicationState {
	message: string[] | string
	severity: 'success' | 'info' | 'warning' | 'error'
	isActive: boolean
	timeout: number
}
