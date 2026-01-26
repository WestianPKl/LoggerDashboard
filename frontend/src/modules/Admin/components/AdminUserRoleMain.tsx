import { useState, useEffect, lazy, Suspense } from 'react'
const AdminRoleUserTable = lazy(() => import('./AdminRoleUserTable'))
import { Container, useMediaQuery, useTheme } from '@mui/material'
import { useGetAdminRolesQuery } from '../../../store/api/adminApi'
import { AdminRoleClass } from '../scripts/AdminRoleClass'
import { useAppDispatch } from '../../../store/hooks'
import { showAlert } from '../../../store/application-store'
import LoadingCircle from '../../../components/UI/LoadingCircle'

export default function AdminUserRoleMain({ isAdmin, roleId }: { isAdmin?: boolean; roleId?: number }) {
	const [rolesData, setRolesData] = useState<AdminRoleClass>(new AdminRoleClass())

	const dispatch = useAppDispatch()

	const { data, error } = useGetAdminRolesQuery({ id: roleId })

	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	useEffect(() => {
		if (data) {
			setRolesData(data[0])
		}
		if (error) {
			const message = (error as any)?.data?.message || (error as any)?.message || 'Something went wrong'
			dispatch(showAlert({ message, severity: 'error' }))
		}
	}, [dispatch, data, error])

	return (
		<Container maxWidth={isMobile ? 'sm' : 'xl'}>
			<Suspense fallback={<LoadingCircle />}>
				<AdminRoleUserTable usersData={rolesData.users} roleId={roleId} isAdmin={isAdmin} />
			</Suspense>
		</Container>
	)
}
