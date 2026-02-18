import { Sequelize } from 'sequelize'
import sequelize from '../../../util/database.js'
import PCB from './pcb.model.js'
import Inventory from '../inventory/inventory.model.js'

const PCBBomItems = sequelize.define(
	'pcb_bom_items',
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
		inventoryId: {
			type: Sequelize.INTEGER,
			allowNull: false,
			field: 'inventory_id',
		},
		qtyPerBoard: {
			type: Sequelize.INTEGER,
			allowNull: false,
			field: 'qty_per_board',
		},
		designators: {
			type: Sequelize.STRING,
			allowNull: true,
			field: 'designators',
		},
		valueSpec: {
			type: Sequelize.STRING,
			allowNull: true,
			field: 'value_spec',
		},
		allowSubstitute: {
			type: Sequelize.BOOLEAN,
			allowNull: false,
			defaultValue: false,
			field: 'allow_substitute',
		},
		comment: {
			type: Sequelize.STRING,
			allowNull: true,
			field: 'comment',
		},
	},
	{
		timestamps: false,
		tableName: 'pcb_bom_items',
	}
)

PCBBomItems.belongsTo(PCB, {
	as: 'pcb',
	targetKey: 'id',
	foreignKey: 'pcbId',
})

PCBBomItems.belongsTo(Inventory, {
	as: 'inventory',
	targetKey: 'id',
	foreignKey: 'inventoryId',
})

PCB.hasMany(PCBBomItems, {
	as: 'bomItems',
	sourceKey: 'id',
	foreignKey: 'pcbId',
})

export default PCBBomItems
