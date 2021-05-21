"use strict";
/**
 * Errors that can be raised during parsing of types.
 * @author Louis-Dominique Dubeau
 * @license MPL 2.0
 * @copyright Mangalam Research Center for Buddhist Languages
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValueValidationError = exports.ParameterParsingError = exports.ValueError = exports.ParamError = void 0;
const tools_1 = require("../tools");
/**
 * Records an error due to an incorrect parameter (``<param>``) value. This is
 * an error in the **schema** used to validate a document. Note that these
 * errors are *returned* by salve's internal code. They are not *thrown*.
 */
class ParamError {
    /**
     *
     * @param message The actual error description.
     */
    constructor(message) {
        this.message = message;
    }
    toString() {
        return this.message;
    }
}
exports.ParamError = ParamError;
/**
 * Records an error due to an incorrect value (``<value>``).  This is an error
 * in the **schema** used to validate a document. Note that these errors are
 * *returned* by salve's internal code. They are not *thrown*.
 */
class ValueError {
    /**
     * @param message The actual error description.
     */
    constructor(message) {
        this.message = message;
    }
    toString() {
        return this.message;
    }
}
exports.ValueError = ValueError;
/**
 * Records the failure of parsing a parameter (``<param>``) value. Whereas
 * [[ParamError]] records each individual issue with a parameter's parsing, this
 * object is used to throw a single failure that collects all the individual
 * issues that were encountered.
 */
class ParameterParsingError extends Error {
    /**
     *
     * @param location The location of the ``<param>`` in the schema.
     *
     * @param errors The errors encountered.
     */
    constructor(location, errors) {
        super();
        this.errors = errors;
        // This is crap to work around the fact that Error is a terribly badly
        // designed class or prototype or whatever. Unfortunately the stack trace is
        // off...
        const msg = `${location}: ${errors.map((x) => x.toString()).join("\n")}`;
        const err = new Error(msg);
        this.name = "ParameterParsingError";
        this.stack = err.stack;
        this.message = err.message;
        tools_1.fixPrototype(this, ParameterParsingError);
    }
}
exports.ParameterParsingError = ParameterParsingError;
/**
 * Records the failure of parsing a value (``<value>``). Whereas [[ValueError]]
 * records each individual issue with a value's parsing, this object is used to
 * throw a single failure that collects all the individual issues that were
 * encountered.
 */
class ValueValidationError extends Error {
    /**
     * @param location The location of the ``<value>`` in the schema.
     *
     * @param errors The errors encountered.
     */
    constructor(location, errors) {
        super();
        this.errors = errors;
        // This is crap to work around the fact that Error is a terribly badly
        // designed class or prototype or whatever. Unfortunately the stack trace is
        // off...
        const msg = `${location}: ${errors.map((x) => x.toString()).join("\n")}`;
        const err = new Error(msg);
        this.name = "ValueValidationError";
        this.stack = err.stack;
        this.message = err.message;
        tools_1.fixPrototype(this, ValueValidationError);
    }
}
exports.ValueValidationError = ValueValidationError;
//  LocalWords:  MPL ParamError ParameterParsingError ValueValidationError
//# sourceMappingURL=errors.js.map