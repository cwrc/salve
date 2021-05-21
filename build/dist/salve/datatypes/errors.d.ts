/**
 * Errors that can be raised during parsing of types.
 * @author Louis-Dominique Dubeau
 * @license MPL 2.0
 * @copyright Mangalam Research Center for Buddhist Languages
 */
/**
 * Records an error due to an incorrect parameter (``<param>``) value. This is
 * an error in the **schema** used to validate a document. Note that these
 * errors are *returned* by salve's internal code. They are not *thrown*.
 */
export declare class ParamError {
    readonly message: string;
    /**
     *
     * @param message The actual error description.
     */
    constructor(message: string);
    toString(): string;
}
/**
 * Records an error due to an incorrect value (``<value>``).  This is an error
 * in the **schema** used to validate a document. Note that these errors are
 * *returned* by salve's internal code. They are not *thrown*.
 */
export declare class ValueError {
    readonly message: string;
    /**
     * @param message The actual error description.
     */
    constructor(message: string);
    toString(): string;
}
/**
 * Records the failure of parsing a parameter (``<param>``) value. Whereas
 * [[ParamError]] records each individual issue with a parameter's parsing, this
 * object is used to throw a single failure that collects all the individual
 * issues that were encountered.
 */
export declare class ParameterParsingError extends Error {
    readonly errors: ParamError[];
    readonly name: string;
    readonly stack: string | undefined;
    readonly message: string;
    /**
     *
     * @param location The location of the ``<param>`` in the schema.
     *
     * @param errors The errors encountered.
     */
    constructor(location: string, errors: ParamError[]);
}
/**
 * Records the failure of parsing a value (``<value>``). Whereas [[ValueError]]
 * records each individual issue with a value's parsing, this object is used to
 * throw a single failure that collects all the individual issues that were
 * encountered.
 */
export declare class ValueValidationError extends Error {
    readonly errors: ValueError[];
    readonly name: string;
    readonly stack: string | undefined;
    readonly message: string;
    /**
     * @param location The location of the ``<value>`` in the schema.
     *
     * @param errors The errors encountered.
     */
    constructor(location: string, errors: ValueError[]);
}
