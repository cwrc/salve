import { SchemaValidationResult, SchemaValidator, SchemaValidatorOptions } from "../schema-validation";
export declare class XMLLintValidator implements SchemaValidator {
    readonly options: SchemaValidatorOptions;
    constructor(options: SchemaValidatorOptions);
    validate(schemaURL: URL): Promise<SchemaValidationResult>;
}
