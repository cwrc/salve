/**
 * Facilities for validating a schema before conversion.
 * @author Louis-Dominique Dubeau
 * @license MPL 2.0
 * @copyright Mangalam Research Center for Buddhist Languages
 */
import { Element } from "./parser";
import { ResourceLoader } from "./resource-loader";
import { SchemaSimplifierOptions } from "./schema-simplification";
/** Results of a schema validation. */
export interface SchemaValidationResult {
    /**
     * A simplified version of the schema. Some validators perform simplification
     * *as part* of validating the schema, and may provide the simplified schema
     * as a result of validation.
     */
    simplified?: Element;
    warnings?: string[];
}
export declare class SchemaValidationError extends Error {
    constructor(message: string);
}
export interface SchemaValidatorOptions {
    /** True if the validator should run verbosely. */
    verbose: boolean;
    /** The resource loader to use if resources are needed. */
    resourceLoader: ResourceLoader;
}
export interface SimplifyingSchemaValidatorOptions extends SchemaValidatorOptions, SchemaSimplifierOptions {
}
/** The interface that all validators must follow. */
export interface SchemaValidator {
    /**
     * Validate the schema located at ``path``.
     *
     * @param schemaPath The path of the file to simplify. See [[ResourceLoader]]
     * regarding limitations.
     *
     * @returns The result of validation. The promise resolving at all indicates
     * that the schema is valid. A failure is reported through a rejection.
     */
    validate(schemaPath: URL): Promise<SchemaValidationResult>;
}
export declare type SchemaValidatorCtor = new (options: SimplifyingSchemaValidatorOptions) => SchemaValidator;
export declare function getAvailableValidators(): string[];
export declare function isValidatorAvailable(name: string): boolean;
export declare function registerValidator(name: string, ctor: SchemaValidatorCtor): void;
export declare function makeValidator(name: string, options: SimplifyingSchemaValidatorOptions): SchemaValidator;
