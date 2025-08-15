import { useState, lazy } from 'react'
import type { IUserProfileProps, IUserProfileData } from '../scripts/IUser'
const UserAvatar = lazy(() => import('./UserAvatar'))
import UserForm from './UserForm'
import { useAppDispatch } from '../../../store/hooks'
import { showAlert } from '../../../store/application-store'
import { useUpdateUserMutation } from '../../../store/api/userApi'

/**
 * Displays and manages the user's profile information, including avatar and personal details.
 *
 * @component
 * @param {IUserProfileProps} props - The props for the UserProfile component.
 * @param {User} props.user - The user object containing profile data.
 *
 * Allows the user to update their username, email, password, and avatar.
 * Handles avatar changes and form submissions, dispatching alerts on success or error.
 *
 * @example
 * <UserProfile user={currentUser} />
 */
export default function UserProfile({ user }: IUserProfileProps) {
	const [avatar, setAvatar] = useState<File | null>(null)
	const dispatch = useAppDispatch()
	const [updateUser] = useUpdateUserMutation()

	/**
	 * Handles the change event for the user's avatar.
	 * Updates the avatar state with the newly selected file.
	 *
	 * @param newAvatar - The new avatar file selected by the user.
	 */
	function handleAvatarChange(newAvatar: File): void {
		setAvatar(newAvatar)
	}

	/**
	 * Handles saving changes to the user's profile.
	 *
	 * This asynchronous function collects the updated user profile data,
	 * constructs a FormData object, and sends it to the server to update
	 * the user's information. If the update is successful, a success alert
	 * is dispatched and the avatar state is reset. If an error occurs,
	 * an error alert is dispatched with the relevant message.
	 *
	 * @param data - The updated user profile data.
	 * @returns A promise that resolves when the save operation is complete.
	 */
	async function handleSaveChanges(data: IUserProfileData): Promise<void> {
		const formData = new FormData()
		if (data.username) formData.append('username', data.username)
		if (data.email) formData.append('email', data.email)
		if (data.password) formData.append('password', data.password)
		if (avatar) formData.append('avatar', avatar)
		if (user.id) {
			try {
				await updateUser({ body: formData, id: user.id }).unwrap()
				dispatch(showAlert({ message: 'Profile data saved successfully', severity: 'success' }))
				setAvatar(null)
			} catch (err: any) {
				const message = err?.data?.message || err?.message || 'Something went wrong'
				dispatch(showAlert({ message, severity: 'error' }))
			}
		}
	}

	return (
		<>
			<UserAvatar avatarUrl={user.avatar} onAvatarChange={handleAvatarChange} />
			<UserForm user={user} onSave={handleSaveChanges} />
		</>
	)
}
