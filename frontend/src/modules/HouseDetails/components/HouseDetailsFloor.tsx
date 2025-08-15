import { Container, Button, Box } from '@mui/material'
import { ReactFlowProvider } from '@xyflow/react'
import type { IHouseDetailsFloorProps } from '../scripts/IHouseDetails'
import HouseDetailsFloorTree from './HouseDetailsFloorTree'
import { canWrite } from '../../../store/auth-actions'
import { useAppSelector } from '../../../store/hooks'
import { useState } from 'react'
import EditIcon from '@mui/icons-material/Edit'
import CloseIcon from '@mui/icons-material/Close'
import HouseDetailsEditFloor from './HouseDetailsEditFloor'

/**
 * Renders the details and editable tree view of a specific house floor.
 *
 * @param floor - The floor object containing details and layout information.
 * @param houseId - The unique identifier of the house to which the floor belongs.
 *
 * Displays an edit button if the user has write permissions, allowing toggling between view and edit modes.
 * In edit mode, renders the `HouseDetailsEditFloor` component for editing floor details.
 * Always renders the `HouseDetailsFloorTree` component to visualize the floor's structure.
 *
 * @returns A container with controls and a visual representation of the house floor.
 */
export default function HouseDetailsFloor({ floor, houseId }: IHouseDetailsFloorProps) {
	const [editMode, setEditMode] = useState<boolean>(false)
	const isWritable = useAppSelector(state => canWrite('house', 'houseFloor')(state))

	return (
		<Container sx={{ height: 500 }}>
			<Box sx={{ margin: 0, padding: 0, display: 'flex', justifyContent: 'end' }}>
				{editMode && <HouseDetailsEditFloor floor={floor} houseId={houseId} />}
				{isWritable && (
					<Button
						startIcon={editMode ? <CloseIcon /> : <EditIcon />}
						variant='contained'
						onClick={() => {
							setEditMode(prevMode => !prevMode)
						}}>
						{editMode ? 'Leave' : 'Edit'}
					</Button>
				)}
			</Box>
			<ReactFlowProvider>
				<HouseDetailsFloorTree
					floor={floor}
					floorId={floor.id}
					floorViewport={{ x: floor.x, y: floor.y, zoom: floor.zoom }}
					editMode={editMode}
				/>
			</ReactFlowProvider>
		</Container>
	)
}
