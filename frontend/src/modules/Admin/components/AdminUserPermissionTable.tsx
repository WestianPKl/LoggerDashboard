import { useState, useEffect, lazy, Suspense, useMemo } from 'react'
const UserPermissionTable = lazy(() => import('../../User/components/UserPermissionTable'))
import { Container, useMediaQuery, useTheme } from '@mui/material'
import { useGetPermissionsQuery } from '../../../store/api/adminApi'
import type { PermissionClass } from '../scripts/PermissionClass'
import { useAppDispatch } from '../../../store/hooks'
import { showAlert } from '../../../store/application-store'
import LoadingCircle from '../../../components/UI/LoadingCircle'

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
