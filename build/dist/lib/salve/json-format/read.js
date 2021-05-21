"use strict";
/**
 * This module contains utilities for reading salve's internal schema format.
 *
 * @author Louis-Dominique Dubeau
 * @license MPL 2.0
 * @copyright Mangalam Research Center for Buddhist Languages
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.readTreeFromJSON = void 0;
const tools_1 = require("../tools");
const common_1 = require("./common");
class OldFormatError extends Error {
    constructor() {
        super("your schema file must be recreated with a newer " +
            "version of salve-convert");
        tools_1.fixPrototype(this, OldFormatError);
    }
}
/**
 * A class for walking the JSON object representing a schema.
 */
class V2JSONWalker {
    /**
     *
     * @param options The options object from the file that contains the
     * schema.
     */
    constructor(options) {
        this.options = options;
        // tslint:disable-next-line:no-bitwise
        this.addPath = (this.options & common_1.OPTION_NO_PATHS) !== 0;
    }
    /**
     * Walks a V2 representation of a JavaScript object.
     *
     * @param array The array representing the object.
     *
     * @throws {Error} If the object is malformed.
     *
     * @returns The return value of [[V2JSONWalker._processObject]].
     */
    walkObject(array) {
        const kind = array[0];
        const ctor = common_1.codeToConstructor[kind];
        if (ctor === undefined) {
            if (array.length < 1) {
                throw new Error("array too small to contain object");
            }
            throw new Error(`undefined type: ${kind}`);
        }
        if (ctor === Array) {
            throw new Error("trying to build array with walkObject");
        }
        // This can happen for Empty, Text, notAllowed when the JSON was generated
        // without path information.
        if (array.length === 1) {
            return this._processObject(kind, ctor, [""]);
        }
        const args = array.slice(1);
        this._transformArray(args);
        return this._processObject(kind, ctor, this.addPath ? ["", ...args] :
            args);
    }
    /**
     * Processes an object. Derived classes will want to override this method to
     * perform their work.
     *
     * @param kind The object "kind". A numeric code.
     *
     * @param ctor The object's constructor.
     *
     * @param args The arguments that should be passed to the constructor.
     *
     * @returns If the ``V2JSONWalker`` instance is meant to convert the JSON
     * data, then this method should return an Object. If the ``V2JSONWalker``
     * instance is meant to check the JSON data, then it should return
     * ``undefined``.
     */
    _processObject(kind, ctor, args) {
        return undefined; // Do nothing
    }
    _transformArray(arr) {
        const limit = arr.length;
        for (let elIx = 0; elIx < limit; elIx++) {
            let el = arr[elIx];
            if (el instanceof Array) {
                if (el[0] !== 0) {
                    arr[elIx] = this.walkObject(el);
                }
                else {
                    arr[elIx] = el = el.slice(1);
                    this._transformArray(el);
                }
            }
        }
    }
}
function namedOnePatternFilter(args) {
    // Same thing as for OneOrMore, but for these elements the array of patterns
    // is at index 2 rather than index 1 because index 1 contains a name.
    if (args[2].length !== 1) {
        throw new Error("PatternOnePattern with an array of patterns that " +
            "contains other than 1 pattern");
    }
    return [args[0], args[1], args[2][0]];
}
function twoPatternFilter(args) {
    if (args[1].length !== 2) {
        throw new Error("PatternTwoPatterns with an array of patterns that " +
            "contains other than 2 pattern");
    }
    return [args[0], args[1][0], args[1][1]];
}
const kindToArgFilter = [
    undefined,
    undefined,
    // Data
    (args) => {
        if (args.length >= 4) {
            // Parameters are represented as an array of strings in the file.
            // Transform this array of strings into an array of objects.
            const params = args[3];
            if (params.length % 2 !== 0) {
                throw new Error("parameter array length not a multiple of 2");
            }
            // tslint:disable-next-line: prefer-array-literal
            const newParams = new Array(params.length / 2);
            const limit = params.length;
            for (let i = 0; i < limit; i += 2) {
                newParams[i / 2] = { name: params[i], value: params[i + 1] };
            }
            args[3] = newParams;
        }
        return args;
    },
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    // OneOrMore
    (args) => {
        //
        // In the file we have two arguments: the XML path, an array of length 1
        // that contains the one subpattern.
        //
        // Here we ditch the array and replace it with its lone subpattern.
        //
        if (args[1].length !== 1) {
            throw new Error("OneOrMore with an array of patterns that " +
                "contains other than 1 pattern");
        }
        return [args[0], args[1][0]];
    },
    twoPatternFilter,
    twoPatternFilter,
    namedOnePatternFilter,
    namedOnePatternFilter,
    namedOnePatternFilter,
    undefined,
    undefined,
    twoPatternFilter,
    //
    // The name pattern filters all drop the path information.
    //
    // Name,
    (args) => args.slice(1),
    // NameChoice,
    (args) => {
        if (args[1].length !== 2) {
            throw new Error("NameChoice with an array of patterns that " +
                "contains other than 2 pattern");
        }
        return args[1];
    },
    // NsName,
    (args) => args.slice(1),
    // AnyName,
    (args) => args.slice(1),
];
/**
 * A JSON walker that constructs a pattern tree as it walks the JSON object.
 *
 * @private
 */
class V2Constructor extends V2JSONWalker {
    _processObject(kind, ctor, args) {
        const filter = kindToArgFilter[kind];
        return new ctor(...(filter === undefined ? args : filter(args)));
    }
}
/**
 * Constructs a tree of patterns from the data structure produced by running
 * ``salve-convert`` on an RNG file.
 *
 * @param code The JSON representation (a string) or the deserialized JSON.
 *
 * @throws {Error} When the version of the data is not supported.
 *
 * @returns The tree.
 */
function readTreeFromJSON(code) {
    const parsed = (typeof code === "string" ? JSON.parse(code) : code);
    if (typeof parsed === "object" && parsed.v === undefined) {
        throw new OldFormatError(); // version 0
    }
    const { v: version, o: options, d: data } = parsed;
    if (version === 3) {
        return new V2Constructor(options).walkObject(data);
    }
    throw new Error(`unknown version: ${version}`);
}
exports.readTreeFromJSON = readTreeFromJSON;
//  LocalWords:  deserialized PatternTwoPatterns PatternOnePattern OneOrMore js
//  LocalWords:  codeToConstructor nameToConstructor RNG subpattern JSON xsl
//  LocalWords:  rng MPL
//# sourceMappingURL=read.js.map