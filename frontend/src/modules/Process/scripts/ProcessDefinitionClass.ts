import { UserClass } from '../../User/scripts/UserClass'
import { ProcessTypeClass } from './ProcessTypeClass'

/**
 * Represents the input data required to define a process.
 *
 * @property {number} [id] - The unique identifier of the process definition.
 * @property {number} [processTypeId] - The identifier for the associated process type.
 * @property {string} [name] - The name of the process definition.
 * @property {number} [createdById] - The user ID of the creator.
 * @property {number} [updatedById] - The user ID of the last updater.
 * @property {string} [createdAt] - The ISO date string when the process was created.
 * @property {string} [updatedAt] - The ISO date string when the process was last updated.
 * @property {ProcessTypeClass} [type] - The process type object associated with this definition.
 * @property {UserClass} [createdBy] - The user object representing the creator.
 * @property {UserClass} [updatedBy] - The user object representing the last updater.
 */
export interface ProcessDefinitionInput {
	id?: number | undefined
	processTypeId?: number | undefined
	name?: string | undefined
	createdById?: number | undefined
	updatedById?: number | undefined
	createdAt?: string | undefined
	updatedAt?: string | undefined
	type?: ProcessTypeClass | undefined
	createdBy?: UserClass | undefined
	updatedBy?: UserClass | undefined
}

/**
 * Represents a process definition with associated metadata and relationships.
 *
 * Implements the {@link ProcessDefinitionInput} interface and provides
 * initialization logic for nested objects such as `type`, `createdBy`, and `updatedBy`.
 *
 * @property {number | undefined} id - Unique identifier of the process definition.
 * @property {number | undefined} processTypeId - Identifier for the process type.
 * @property {string | undefined} name - Name of the process definition.
 * @property {number | undefined} createdById - User ID of the creator.
 * @property {number | undefined} updatedById - User ID of the last updater.
 * @property {string | undefined} createdAt - ISO string of creation date.
 * @property {string | undefined} updatedAt - ISO string of last update date.
 * @property {ProcessTypeClass | undefined} type - Associated process type object.
 * @property {UserClass | undefined} createdBy - User object representing the creator.
 * @property {UserClass | undefined} updatedBy - User object representing the last updater.
 *
 * @constructor
 * Initializes a new instance of the {@link ProcessDefinitionClass} class.
 * Accepts a partial or complete {@link ProcessDefinitionInput} object and
 * constructs nested objects where applicable.
 *
 * @param {ProcessDefinitionInput} [model={}] - The input model to initialize the instance.
 */
export class ProcessDefinitionClass implements ProcessDefinitionInput {
	id: number | undefined
	processTypeId: number | undefined
	name: string | undefined
	createdById: number | undefined
	updatedById: number | undefined
	createdAt: string | undefined
	updatedAt: string | undefined
	type: ProcessTypeClass | undefined
	createdBy: UserClass | undefined
	updatedBy: UserClass | undefined

	constructor(model: ProcessDefinitionInput = {}) {
		if (model) {
			Object.assign(this, model)
			if (model.type) {
				this.type = new ProcessTypeClass(model.type)
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
