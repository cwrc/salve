"use strict";
/**
 * Class for XML Expanded Names.
 * @author Louis-Dominique Dubeau
 * @license MPL 2.0
 * @copyright Mangalam Research Center for Buddhist Languages
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EName = void 0;
/**
 * Immutable objects modeling XML Expanded Names.
 */
class EName {
    /**
     * @param ns The namespace URI.
     *
     * @param name The local name of the entity.
     */
    constructor(ns, name) {
        this.ns = ns;
        this.name = name;
    }
    /**
     * @returns A string representing the expanded name.
     */
    toString() {
        return `{${this.ns}}${this.name}`;
    }
    /**
     * Compares two expanded names.
     *
     * @param other The other object to compare this object with.
     *
     * @returns  ``true`` if this object equals the other.
     */
    equal(other) {
        return this.ns === other.ns && this.name === other.name;
    }
}
exports.EName = EName;
//  LocalWords:  MPL ns
//# sourceMappingURL=ename.js.map