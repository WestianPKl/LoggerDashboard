/**
 * Represents the definition of an access level within the system.
 *
 * @property id - The unique identifier for the access level definition.
 * @property name - The display name of the access level.
 * @property accessLevel - The numeric value representing the access level.
 */
export interface AccessLevelDefinition {
	id: number | undefined
	name: string | undefined
	accessLevel: number | undefined
}

/**
 * Represents an access level definition with an ID, name, and access level value.
 * Implements the {@link AccessLevelDefinition} interface.
 *
 * @example
 * ```typescript
 * const accessLevel = new AccessLevelDefinitionClass({ id: 1, name: 'Admin', accessLevel: 10 });
 * ```
 *
 * @property id - The unique identifier for the access level.
 * @property name - The name of the access level.
 * @property accessLevel - The numeric value representing the access level.
 *
 * @constructor
 * Creates a new instance of AccessLevelDefinitionClass.
 * @param model - A partial object containing properties to initialize the instance.
 */
export class AccessLevelDefinitionClass implements AccessLevelDefinition {
	id: number | undefined
	name: string | undefined
	accessLevel: number | undefined

	constructor(model: Partial<AccessLevelDefinition> = {}) {
		if (model) {
			Object.assign(this, model)
		}
	}
}
