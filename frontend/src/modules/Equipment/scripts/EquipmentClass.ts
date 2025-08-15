import { UserClass } from '../../User/scripts/UserClass'
import { EquipmentModelClass } from './EquipmentModelClass'
import { EquipmentTypeClass } from './EquipmentTypeClass'
import { EquipmentVendorClass } from './EquipmentVendorClass'
import { DataLastValueClass } from '../../Data/scripts/DataLastValueClass'
import type { DataDefinitionClass } from '../../Data/scripts/DataDefinitionClass'

/**
 * Represents the input data structure for an equipment entity.
 *
 * @property {number} [id] - The unique identifier of the equipment.
 * @property {string} [serialNumber] - The serial number of the equipment.
 * @property {number} [equVendorId] - The identifier of the equipment vendor.
 * @property {number} [equModelId] - The identifier of the equipment model.
 * @property {number} [equTypeId] - The identifier of the equipment type.
 * @property {number} [createdById] - The identifier of the user who created the equipment entry.
 * @property {number} [updatedById] - The identifier of the user who last updated the equipment entry.
 * @property {string} [createdAt] - The ISO date string representing when the equipment was created.
 * @property {string} [updatedAt] - The ISO date string representing when the equipment was last updated.
 * @property {EquipmentVendorClass} [vendor] - The vendor details associated with the equipment.
 * @property {EquipmentModelClass} [model] - The model details associated with the equipment.
 * @property {EquipmentTypeClass} [type] - The type details associated with the equipment.
 * @property {DataDefinitionClass[]} [dataDefinitions] - The list of data definitions related to the equipment.
 * @property {DataLastValueClass} [lastValue] - The last recorded value for the equipment.
 * @property {UserClass} [createdBy] - The user who created the equipment entry.
 * @property {UserClass} [updatedBy] - The user who last updated the equipment entry.
 */
export interface EquipmentInput {
	id?: number | undefined
	serialNumber?: string | undefined
	equVendorId?: number | undefined
	equModelId?: number | undefined
	equTypeId?: number | undefined
	createdById?: number | undefined
	updatedById?: number | undefined
	createdAt?: string | undefined
	updatedAt?: string | undefined
	vendor?: EquipmentVendorClass | undefined
	model?: EquipmentModelClass | undefined
	type?: EquipmentTypeClass | undefined
	dataDefinitions?: DataDefinitionClass[]
	lastValue?: DataLastValueClass | undefined
	createdBy?: UserClass | undefined
	updatedBy?: UserClass | undefined
}

/**
 * Represents an equipment entity with its associated properties and relationships.
 * 
 * @implements {EquipmentInput}
 * 
 * @property {number | undefined} id - Unique identifier for the equipment.
 * @property {string | undefined} serialNumber - Serial number of the equipment.
 * @property {number | undefined} equVendorId - Identifier for the equipment vendor.
 * @property {number | undefined} equModelId - Identifier for the equipment model.
 * @property {number | undefined} equTypeId - Identifier for the equipment type.
 * @property {number | undefined} createdById - Identifier for the user who created the equipment record.
 * @property {number | undefined} updatedById - Identifier for the user who last updated the equipment record.
 * @property {string | undefined} createdAt - Timestamp when the equipment was created.
 * @property {string | undefined} updatedAt - Timestamp when the equipment was last updated.
 * @property {EquipmentVendorClass | undefined} vendor - Vendor details associated with the equipment.
 * @property {EquipmentModelClass | undefined} model - Model details associated with the equipment.
 * @property {EquipmentTypeClass | undefined} type - Type details associated with the equipment.
 * @property {DataDefinitionClass[]} dataDefinitions - List of data definitions related to the equipment.
 * @property {DataLastValueClass | undefined} lastValue - Last recorded value for the equipment.
 * @property {UserClass | undefined} createdBy - User who created the equipment record.
 * @property {UserClass | undefined} updatedBy - User who last updated the equipment record.
 * 
 * @constructor
 * @param {EquipmentInput} [model={}] - Optional initial values to populate the equipment instance.
 */
export class EquipmentClass implements EquipmentInput {
	id: number | undefined
	serialNumber: string | undefined
	equVendorId: number | undefined
	equModelId: number | undefined
	equTypeId: number | undefined
	createdById: number | undefined
	updatedById: number | undefined
	createdAt: string | undefined
	updatedAt: string | undefined
	vendor: EquipmentVendorClass | undefined
	model: EquipmentModelClass | undefined
	type: EquipmentTypeClass | undefined
	dataDefinitions: DataDefinitionClass[] = []
	lastValue: DataLastValueClass | undefined
	createdBy: UserClass | undefined
	updatedBy: UserClass | undefined

	constructor(model: EquipmentInput = {}) {
		if (model) {
			Object.assign(this, model)
			if (model.vendor) {
				this.vendor = new EquipmentVendorClass(model.vendor)
			}
			if (model.model) {
				this.model = new EquipmentModelClass(model.model)
			}
			if (model.type) {
				this.type = new EquipmentTypeClass(model.type)
			}
			if (model.lastValue) {
				this.lastValue = new DataLastValueClass(model.lastValue)
			}
			if (model.createdBy) {
				this.createdBy = new UserClass(model.createdBy)
			}
			if (model.updatedBy) {
				this.updatedBy = new UserClass(model.updatedBy)
			}
		}
	}
}
