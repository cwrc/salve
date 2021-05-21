"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.builtin = void 0;
/**
 * Implementation of the builtin Relax NG datatype library.
 * @author Louis-Dominique Dubeau
 * @license MPL 2.0
 * @copyright Mangalam Research Center for Buddhist Languages
 */
const errors_1 = require("./errors");
/**
 * Strips leading and trailing space. Normalize all internal spaces to a single
 * space.
 *
 * @private
 *
 * @param value The value whose space we want to normalize.
 *
 * @returns The normalized value.
 */
function normalizeSpace(value) {
    // It is generally faster to trim first.
    return value.trim().replace(/\s+/g, " ");
}
//
// TypeScript does not automatically treat unimplemented interface bits as
// abstract. :-(
//
// See https://github.com/Microsoft/TypeScript/issues/4670
//
class Base {
    parseParams(location, params) {
        if (params !== undefined && params.length > 0) {
            throw new errors_1.ParameterParsingError(location, [new errors_1.ParamError("this type does not accept parameters")]);
        }
        return Object.create(null);
    }
}
class StringT extends Base {
    constructor() {
        super(...arguments);
        this.regexp = /^[^]*$/;
        this.needsContext = false;
    }
    parseValue(location, value) {
        // The builtins do not disallow anything so we don't call disallows to check
        // whether the value is disallowed.
        return { value };
    }
    equal(value, schemaValue) {
        return value === schemaValue.value;
    }
    disallows(value) {
        return false;
    }
}
const stringT = new StringT();
class Token extends Base {
    constructor() {
        super(...arguments);
        this.name = "token";
        this.needsContext = false;
        this.regexp = /^[^]*$/;
    }
    parseValue(location, value) {
        // The builtins do not disallow anything so we don't call disallows to check
        // whether the value is disallowed.
        return { value: normalizeSpace(value) };
    }
    equal(value, schemaValue) {
        return normalizeSpace(value) === schemaValue.value;
    }
    disallows(value) {
        // Yep, token allows anything, just like string.
        return false;
    }
}
const token = new Token();
/**
 * The builtin datatype library.
 */
exports.builtin = {
    uri: "",
    types: {
        string: stringT,
        token,
    },
};
//  LocalWords:  NG MPL unparsed
//# sourceMappingURL=builtin.js.map