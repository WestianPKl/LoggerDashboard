import {
	Box,
	Card,
	CardActionArea,
	CardContent,
	Chip,
	Container,
	Typography,
	useMediaQuery,
	useTheme,
} from '@mui/material'
import { useNavigate } from 'react-router'
import InventoryIcon from '@mui/icons-material/Inventory2Outlined'
import DeveloperBoardIcon from '@mui/icons-material/DeveloperBoardOutlined'
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturingOutlined'

interface MenuTile {
	title: string
	description: string
	icon: React.ReactNode
	path: string
	color: string
	disabled?: boolean
}

const menuTiles: MenuTile[] = [
	{
		title: 'Inventory',
		description: 'Zarządzaj komponentami, typami, obudowami i dostawcami.',
		icon: <InventoryIcon sx={{ fontSize: 56 }} />,
		path: '/inventory',
		color: '#5066c3',
	},
	{
		title: 'PCB',
		description: 'Projektuj i przeglądaj płytki PCB oraz listy BOM.',
		icon: <DeveloperBoardIcon sx={{ fontSize: 56 }} />,
		path: '/pcb',
		color: '#43a047',
	},
	{
		title: 'Production',
		description: 'Zlecenia produkcyjne i śledzenie postępów.',
		icon: <PrecisionManufacturingIcon sx={{ fontSize: 56 }} />,
		path: '/production',
		color: '#f57c00',
	},
]

export default function MainMenuView() {
	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
	const navigate = useNavigate()

	return (
		<Container maxWidth={isMobile ? 'sm' : 'md'} sx={{ py: 4 }}>
			<Box sx={{ textAlign: 'center', mb: 6 }}>
				<Typography
					variant='h3'
					component='h1'
					sx={{
						fontWeight: 700,
						background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
						backgroundClip: 'text',
						WebkitBackgroundClip: 'text',
						WebkitTextFillColor: 'transparent',
						mb: 1,
					}}>
					PCB Manager
				</Typography>
				<Typography variant='subtitle1' color='text.secondary'>
					Centrum zarządzania komponentami i produkcją
				</Typography>
			</Box>

			<Box
				sx={{
					display: 'grid',
					gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
					gap: 3,
				}}>
				{menuTiles.map(tile => (
					<Card
						key={tile.title}
						elevation={0}
						sx={{
							position: 'relative',
							border: '1px solid',
							borderColor: 'divider',
							borderRadius: 3,
							overflow: 'hidden',
							opacity: tile.disabled ? 0.6 : 1,
							transition: 'all 0.25s ease',
							'&:hover': tile.disabled
								? {}
								: {
										transform: 'translateY(-4px)',
										boxShadow: `0 8px 24px ${tile.color}30`,
										borderColor: tile.color,
									},
						}}>
						<CardActionArea disabled={tile.disabled} onClick={() => navigate(tile.path)} sx={{ p: 3, height: '100%' }}>
							<CardContent sx={{ textAlign: 'center', p: 0 }}>
								<Box
									sx={{
										width: 88,
										height: 88,
										borderRadius: '50%',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										mx: 'auto',
										mb: 2,
										backgroundColor: `${tile.color}14`,
										color: tile.color,
									}}>
									{tile.icon}
								</Box>
								<Typography variant='h6' sx={{ fontWeight: 600, mb: 1 }}>
									{tile.title}
								</Typography>
								<Typography variant='body2' color='text.secondary' sx={{ lineHeight: 1.6 }}>
									{tile.description}
								</Typography>
								{tile.disabled && (
									<Chip
										label='Wkrótce'
										size='small'
										sx={{
											mt: 2,
											backgroundColor: `${tile.color}20`,
											color: tile.color,
											fontWeight: 600,
										}}
									/>
								)}
							</CardContent>
						</CardActionArea>
					</Card>
				))}
			</Box>
		</Container>
	)
}
