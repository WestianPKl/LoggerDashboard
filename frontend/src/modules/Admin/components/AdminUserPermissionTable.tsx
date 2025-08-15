import { useState, useEffect, lazy, Suspense, useMemo } from 'react'
const UserPermissionTable = lazy(() => import('../../User/components/UserPermissionTable'))
import { Container, useMediaQuery, useTheme } from '@mui/material'
import { useGetPermissionsQuery } from '../../../store/api/adminApi'
import type { PermissionClass } from '../scripts/PermissionClass'
import { useAppDispatch } from '../../../store/hooks'
import { showAlert } from '../../../store/application-store'
import LoadingCircle from '../../../components/UI/LoadingCircle'

/**
 * Renders a table displaying user or role permissions in the admin panel.
 *
 * Fetches permission data based on either a `userId` or `roleId` and displays it
 * using the `UserPermissionTable` component. Handles loading and error states,
 * and adapts layout for mobile devices.
 *
 * @param userId - Optional ID of the user whose permissions are to be displayed.
 * @param isAdmin - Optional flag indicating if the current user is an admin.
 * @param roleId - Optional ID of the role whose permissions are to be displayed.
 *
 * @returns A React component that displays the permissions table within a responsive container.
 */
export default function AdminUserPermissionTable({
	userId,
	isAdmin,
	roleId,
}: {
	userId?: number
	isAdmin?: boolean
	roleId?: number
}) {
	const [permissionData, setPermissionData] = useState<PermissionClass[]>([])

	const dispatch = useAppDispatch()

	const params = useMemo(() => {
		if (userId) return { userId }
		if (roleId) return { roleId }
		return undefined
	}, [userId, roleId])

	const skip = !params

	const { data, error } = useGetPermissionsQuery(params, { skip })

	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	useEffect(() => {
		if (data) {
			setPermissionData(data)
		}
		if (error) {
			const message = (error as any)?.data?.message || (error as any)?.message || 'Something went wrong'
			dispatch(showAlert({ message, severity: 'error' }))
		}
	}, [dispatch, error])

	return (
		<Container maxWidth={isMobile ? 'sm' : 'xl'}>
			<Suspense fallback={<LoadingCircle />}>
				<UserPermissionTable permissionData={permissionData} isAdmin={isAdmin} userId={userId} roleId={roleId} />
			</Suspense>
		</Container>
	)
}
