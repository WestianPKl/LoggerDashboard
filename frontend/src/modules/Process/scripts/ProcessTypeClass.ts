/**
 * Represents the input data required for a process type.
 *
 * @property {number} [id] - The unique identifier of the process type (optional).
 * @property {string} [name] - The name of the process type (optional).
 */
export interface ProcessTypeInput {
	id?: number | undefined
	name?: string | undefined
}
/**
 * Represents a process type with an optional ID and name.
 * Implements the {@link ProcessTypeInput} interface.
 *
 * @example
 * ```typescript
 * const processType = new ProcessTypeClass({ id: 1, name: "Example" });
 * ```
 *
 * @property id - The unique identifier of the process type.
 * @property name - The name of the process type.
 *
 * @constructor
 * Creates a new instance of ProcessTypeClass.
 * @param model - An optional object conforming to ProcessTypeInput to initialize the instance properties.
 */
export class ProcessTypeClass implements ProcessTypeInput {
	id: number | undefined
	name: string | undefined

	constructor(model: ProcessTypeInput = {}) {
		if (model) {
			Object.assign(this, model)
		}
	}
}
