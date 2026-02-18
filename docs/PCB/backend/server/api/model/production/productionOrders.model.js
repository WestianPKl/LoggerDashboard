import { Sequelize } from 'sequelize'
import sequelize from '../../../util/database.js'
import PCB from '../pcb/pcb.model.js'

const ProductionOrders = sequelize.define(
	'production_orders',
	{
		id: {
			type: Sequelize.INTEGER,
			autoIncrement: true,
			allowNull: false,
			primaryKey: true,
		},
		pcbId: {
			type: Sequelize.INTEGER,
			allowNull: false,
			field: 'pcb_id',
		},
		quantity: {
			type: Sequelize.INTEGER,
			allowNull: false,
			field: 'quantity',
		},
		status: {
			type: Sequelize.ENUM(
				'planned',
				'ready',
				'reserved',
				'in_assembly',
				'produced',
				'cancelled'
			),
			allowNull: false,
			defaultValue: 'planned',
			field: 'status',
		},
		createdAt: {
			type: Sequelize.DATE,
			allowNull: true,
			field: 'created_at',
		},
		updatedAt: {
			type: Sequelize.DATE,
			allowNull: true,
			field: 'updated_at',
		},
	},
	{
		timestamps: true,
		underscored: true,
		tableName: 'production_orders',
	}
)

ProductionOrders.belongsTo(PCB, {
	as: 'pcb',
	targetKey: 'id',
	foreignKey: 'pcbId',
})

PCB.hasMany(ProductionOrders, {
	as: 'productionOrders',
	sourceKey: 'id',
	foreignKey: 'pcbId',
})

export default ProductionOrders
