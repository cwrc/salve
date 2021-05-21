"use strict";
/**
 * Classes that model datatypes used in RNG schemas.
 * @author Louis-Dominique Dubeau
 * @license MPL 2.0
 * @copyright Mangalam Research Center for Buddhist Languages
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValueError = exports.ValueValidationError = exports.ParameterParsingError = exports.registry = exports.Registry = void 0;
const builtin_1 = require("./datatypes/builtin");
const xmlschema_1 = require("./datatypes/xmlschema");
/**
 * The registry of types.
 */
class Registry {
    constructor() {
        this.libraries = Object.create(null);
    }
    /**
     * Adds a library to the registry.
     *
     * @param library The library to add to the registry.
     *
     * @throws {Error} If the URI is already registered.
     */
    add(library) {
        const uri = library.uri;
        if (uri in this.libraries) {
            throw new Error(`URI clash: ${uri}`);
        }
        this.libraries[uri] = library;
    }
    /**
     * Searches for a URI in the library.
     *
     * @param uri The URI to search for.
     *
     * @returns The library that corresponds to the URI or ``undefined`` if no
     * such library exists.
     */
    find(uri) {
        return this.libraries[uri];
    }
    /**
     * Gets the library corresponding to a URI.
     *
     * @param uri The URI.
     *
     * @returns The library that corresponds to the URI.
     *
     * @throws {Error} If the library does not exist.
     */
    // tslint:disable-next-line: no-reserved-keywords
    get(uri) {
        const ret = this.find(uri);
        if (ret === undefined) {
            throw new Error(`can't get library with URI: ${uri}`);
        }
        return ret;
    }
}
exports.Registry = Registry;
exports.registry = new Registry();
exports.registry.add(builtin_1.builtin);
exports.registry.add(xmlschema_1.xmlschema);
var errors_1 = require("./datatypes/errors");
Object.defineProperty(exports, "ParameterParsingError", { enumerable: true, get: function () { return errors_1.ParameterParsingError; } });
Object.defineProperty(exports, "ValueValidationError", { enumerable: true, get: function () { return errors_1.ValueValidationError; } });
Object.defineProperty(exports, "ValueError", { enumerable: true, get: function () { return errors_1.ValueError; } });
//  LocalWords:  datatypes RNG MPL uri
//# sourceMappingURL=datatypes.js.map