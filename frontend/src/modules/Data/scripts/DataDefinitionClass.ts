/**
 * Represents the input structure for a data definition entity.
 *
 * @property {number} [id] - The unique identifier of the data definition.
 * @property {string} [name] - The name of the data definition.
 * @property {string} [unit] - The unit associated with the data definition.
 * @property {string} [description] - A description of the data definition.
 * @property {string} [createdAt] - The ISO date string when the data definition was created.
 * @property {string} [updatedAt] - The ISO date string when the data definition was last updated.
 */
export interface DataDefinitionInput {
	id?: number | undefined
	name?: string | undefined
	unit?: string | undefined
	description?: string | undefined
	createdAt?: string | undefined
	updatedAt?: string | undefined
}

/**
 * Represents a data definition entity with properties such as id, name, unit, description, and timestamps.
 * Implements the {@link DataDefinitionInput} interface.
 *
 * @remarks
 * This class is used to encapsulate the structure and initialization logic for data definitions.
 *
 * @property id - The unique identifier of the data definition.
 * @property name - The name of the data definition.
 * @property unit - The unit associated with the data definition.
 * @property description - A textual description of the data definition.
 * @property createdAt - The ISO string representing when the data definition was created.
 * @property updatedAt - The ISO string representing when the data definition was last updated.
 *
 * @constructor
 * Creates a new instance of {@link DataDefinitionClass} using the provided model.
 * If a model is provided, its properties are assigned to the instance.
 *
 * @param model - An optional object conforming to {@link DataDefinitionInput} to initialize the instance.
 */
export class DataDefinitionClass implements DataDefinitionInput {
	id: number | undefined
	name: string | undefined
	unit: string | undefined
	description: string | undefined
	createdAt: string | undefined
	updatedAt: string | undefined

	constructor(model: DataDefinitionInput = {}) {
		if (model) {
			Object.assign(this, model)
		}
	}
}
