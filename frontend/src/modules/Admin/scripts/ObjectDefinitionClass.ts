/**
 * Represents the input structure for defining an object.
 *
 * @property id - (Optional) The unique identifier of the object.
 * @property name - (Optional) The name of the object.
 * @property description - (Optional) A brief description of the object.
 */
export interface ObjectDefinitionInput {
	id?: number | undefined
	name?: string | undefined
	description?: string | undefined
}

/**
 * Represents the definition of an object, including its identifier, name, and description.
 * Implements the {@link ObjectDefinitionInput} interface.
 *
 * @remarks
 * This class is typically used to encapsulate the properties of an object definition
 * and provides a constructor for initializing its fields from a given model.
 *
 * @example
 * ```typescript
 * const objDef = new ObjectDefinitionClass({ id: 1, name: "User", description: "A user object" });
 * ```
 *
 * @property id - The unique identifier of the object definition.
 * @property name - The name of the object definition.
 * @property description - A brief description of the object definition.
 *
 * @param model - An optional object conforming to {@link ObjectDefinitionInput} to initialize the instance.
 */
export class ObjectDefinitionClass implements ObjectDefinitionInput {
	id: number | undefined
	name: string | undefined
	description: string | undefined

	constructor(model: ObjectDefinitionInput = {}) {
		if (model) {
			Object.assign(this, model)
		}
	}
}
