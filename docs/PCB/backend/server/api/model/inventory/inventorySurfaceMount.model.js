import { Sequelize } from 'sequelize'
import sequelize from '../../../util/database.js'

const InventorySurfaceMount = sequelize.define(
	'inventory_surface_mount',
	{
		id: {
			type: Sequelize.INTEGER,
			autoIncrement: true,
			allowNull: false,
			primaryKey: true,
		},
		name: {
			type: Sequelize.STRING,
			allowNull: false,
			field: 'name',
		},
	},
	{
		timestamps: false,
		tableName: 'inventory_surface_mount',
	}
)

export default InventorySurfaceMount
