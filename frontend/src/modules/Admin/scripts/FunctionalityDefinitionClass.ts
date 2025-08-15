/**
 * Represents the input structure for defining a functionality.
 *
 * @property id - (Optional) The unique identifier of the functionality.
 * @property name - (Optional) The name of the functionality.
 * @property description - (Optional) A brief description of the functionality.
 */
export interface FunctionalityDefinitionInput {
	id?: number | undefined
	name?: string | undefined
	description?: string | undefined
}

/**
 * Represents a functionality definition with an optional ID, name, and description.
 * Implements the {@link FunctionalityDefinitionInput} interface.
 *
 * @example
 * ```typescript
 * const funcDef = new FunctionalityDefinitionClass({
 *   id: 1,
 *   name: "Export",
 *   description: "Allows exporting data"
 * });
 * ```
 *
 * @property id - The unique identifier of the functionality (optional).
 * @property name - The name of the functionality (optional).
 * @property description - A description of the functionality (optional).
 *
 * @constructor
 * Creates a new instance of FunctionalityDefinitionClass, optionally initializing properties from a given model.
 * @param model - An object conforming to FunctionalityDefinitionInput to initialize the instance.
 */
export class FunctionalityDefinitionClass implements FunctionalityDefinitionInput {
	id: number | undefined
	name: string | undefined
	description: string | undefined

	constructor(model: FunctionalityDefinitionInput = {}) {
		if (model) {
			Object.assign(this, model)
		}
	}
}
