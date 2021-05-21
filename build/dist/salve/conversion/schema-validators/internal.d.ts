import { SchemaValidationResult, SchemaValidator, SimplifyingSchemaValidatorOptions } from "../schema-validation";
export declare class InternalValidator implements SchemaValidator {
    readonly options: SimplifyingSchemaValidatorOptions;
    constructor(options: SimplifyingSchemaValidatorOptions);
    validate(schemaPath: URL): Promise<SchemaValidationResult>;
}
