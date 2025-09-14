import { FunctionalityDefinitionClass } from './FunctionalityDefinitionClass'
import { ObjectDefinitionClass } from './ObjectDefinitionClass'
import { AccessLevelDefinitionClass } from './AccessLevelDefinitionClass'

/**
 * Represents the input structure for assigning permissions to a user or role.
 *
 * @property {number} [id] - The unique identifier for the permission entry.
 * @property {number} [userId] - The identifier of the user to whom the permission applies.
 * @property {number} [roleId] - The identifier of the role to which the permission applies.
 * @property {number} [admFunctionalityDefinitionId] - The identifier for the associated functionality definition.
 * @property {number} [admObjectDefinitionId] - The identifier for the associated object definition.
 * @property {number} [admAccessLevelDefinitionId] - The identifier for the associated access level definition.
 * @property {FunctionalityDefinitionClass} [functionalityDefinition] - The functionality definition object.
 * @property {ObjectDefinitionClass} [objectDefinition] - The object definition object.
 * @property {AccessLevelDefinitionClass} [accessLevelDefinition] - The access level definition object.
 */
export interface PermissionInput {
	id?: number | undefined
	userId?: number | undefined
	roleId?: number | undefined
	admFunctionalityDefinitionId?: number | undefined
	admObjectDefinitionId?: number | undefined
	admAccessLevelDefinitionId?: number | undefined
	functionalityDefinition?: FunctionalityDefinitionClass | undefined
	objectDefinition?: ObjectDefinitionClass | undefined
	accessLevelDefinition?: AccessLevelDefinitionClass | undefined
}

/**
 * Represents a permission entity with related definitions for functionality, object, and access level.
 *
 * @implements {PermissionInput}
 *
 * @property {number | undefined} id - The unique identifier of the permission.
 * @property {number | undefined} userId - The identifier of the user associated with the permission.
 * @property {number | undefined} roleId - The identifier of the role associated with the permission.
 * @property {number | undefined} admFunctionalityDefinitionId - The identifier for the functionality definition.
 * @property {number | undefined} admObjectDefinitionId - The identifier for the object definition.
 * @property {number | undefined} admAccessLevelDefinitionId - The identifier for the access level definition.
 * @property {FunctionalityDefinitionClass | undefined} functionalityDefinition - The functionality definition object.
 * @property {ObjectDefinitionClass | undefined} objectDefinition - The object definition object.
 * @property {AccessLevelDefinitionClass | undefined} accessLevelDefinition - The access level definition object.
 *
 * @constructor
 * @param {PermissionInput} [model={}] - Optional initial values to populate the permission instance.
 *
 * @remarks
 * If the provided model contains nested definition objects, they will be instantiated as their respective classes.
 */
export class PermissionClass implements PermissionInput {
	id: number | undefined
	userId: number | undefined
	roleId: number | undefined
	admFunctionalityDefinitionId: number | undefined
	admObjectDefinitionId: number | undefined
	admAccessLevelDefinitionId: number | undefined
	functionalityDefinition: FunctionalityDefinitionClass | undefined
	objectDefinition: ObjectDefinitionClass | undefined
	accessLevelDefinition: AccessLevelDefinitionClass | undefined

	constructor(model: PermissionInput = {}) {
		if (model) {
			Object.assign(this, model)
			if (model.functionalityDefinition) {
				this.functionalityDefinition = new FunctionalityDefinitionClass(model.functionalityDefinition)
			}
			if (model.objectDefinition) {
				this.objectDefinition = new ObjectDefinitionClass(model.objectDefinition)
			}
			if (model.accessLevelDefinition) {
				this.accessLevelDefinition = new AccessLevelDefinitionClass(model.accessLevelDefinition)
			}
		}
	}
}
