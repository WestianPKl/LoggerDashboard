/**
 * Represents detailed information about an error that occurred within the application.
 *
 * @property location - The location in the code or data where the error was detected.
 * @property msg - A descriptive message explaining the error.
 * @property path - The path or key associated with the error, typically used for nested data structures.
 * @property type - The type or category of the error (e.g., validation, runtime).
 * @property value - The value that caused the error, if applicable.
 */
export interface IErrorData {
	location: string
	msg: string
	path: string
	type: string
	value: string
}
/**
 * Props for the application drawer list component.
 *
 * @property toggleDrawer - A function to open or close the drawer. Pass `true` to open, `false` to close.
 */
export interface IAppDrawerListProps {
	toggleDrawer: (state: boolean) => void
}
/**
 * Represents the properties for an item in the application drawer.
 *
 * @property text - The display text for the drawer item.
 * @property icon - The icon element to be shown alongside the text.
 * @property link - The navigation link associated with the drawer item.
 */
export interface IAppDrawerItemProps {
	text: string
	icon: React.ReactElement<unknown>
	link: string
}

/**
 * Represents the properties for an application navigation item.
 *
 * @property text - The display text for the navigation item.
 * @property link - The URL or route the navigation item points to.
 */
export interface IAppNavigationItemProps {
	text: string
	link: string
}

/**
 * Represents an item in the application's drawer navigation array.
 *
 * @property id - Unique identifier for the drawer item.
 * @property text - Display text for the drawer item.
 * @property link - Navigation link associated with the drawer item.
 * @property icon - React element representing the icon for the drawer item.
 */
export interface IAppDrawerArray {
	id: number
	text: string
	link: string
	icon: React.ReactElement<unknown>
}

/**
 * Represents a single navigation item in the application's navigation array.
 *
 * @property id - A unique identifier for the navigation item.
 * @property text - The display text for the navigation item.
 * @property link - The URL or route associated with the navigation item.
 */
export interface IAppNavigationArray {
	id: number
	text: string
	link: string
}
