/**
 * Represents an authentication token and its associated permission token for a user session.
 *
 * @property token - The main authentication token used for user identification.
 * @property permissionToken - A token specifying the user's permissions or access rights.
 */
export interface IToken {
	token: string
	permissionToken: string
}

/**
 * Represents the data required for a user login operation.
 *
 * @property username - The user's unique identifier or login name.
 * @property password - The user's password for authentication.
 */
export interface ILoginData {
	username: string
	password: string
}

/**
 * Represents the data required for user registration.
 *
 * @property username - The desired username of the user.
 * @property email - The email address of the user.
 * @property password - The password chosen by the user.
 * @property confirmPassword - The confirmation of the chosen password.
 */
export interface IRegisterData {
	username: string
	email: string
	password: string
	confirmPassword: string
}

/**
 * Props for the login form component.
 *
 * @property logIn - A function that handles the login process, accepting login data as its argument.
 */
export interface ILoginFormProps {
	logIn: (loginData: ILoginData) => void
}

/**
 * Props for a component that handles password reset link requests.
 *
 * @property getPasswordResetLink - A function that triggers the process of obtaining a password reset link for the provided email address.
 *   The email parameter can be a string or undefined.
 */
export interface IPasswordResetLinkFormProps {
	getPasswordResetLink: (email: string | undefined) => void
}

/**
 * Props for the password reset form component.
 *
 * @property getPasswordReset - Callback function invoked when the user submits the password reset form.
 * Receives the new password and its confirmation as arguments.
 *
 * @param password - The new password entered by the user, or undefined if not provided.
 * @param confirmPassword - The confirmation of the new password, or undefined if not provided.
 */
export interface IPasswordResetFormProps {
	getPasswordReset: (password: string | undefined, confirmPassword: string | undefined) => void
}

/**
 * Props for the Register Form component.
 *
 * @property createNewAccount - Callback function to create a new account using the provided registration data.
 */
export interface IRegisterFormProps {
	createNewAccount: (registerData: IRegisterData) => void
}
