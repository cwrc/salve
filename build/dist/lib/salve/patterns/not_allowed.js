"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotAllowedWalker = exports.NotAllowed = void 0;
/**
 * Pattern and walker for RNG's ``notAllowed`` elements.
 * @author Louis-Dominique Dubeau
 * @license MPL 2.0
 * @copyright Mangalam Research Center for Buddhist Languages
 */
const base_1 = require("./base");
/**
 * Pattern for ``<notAllowed/>``.
 */
class NotAllowed extends base_1.Pattern {
    newWalker() {
        // tslint:disable-next-line:no-use-before-declare
        return singleton;
    }
}
exports.NotAllowed = NotAllowed;
/**
 * Walker for [[NotAllowed]];
 */
class NotAllowedWalker {
    /**
     * @param el The pattern for which this walker was created.
     */
    constructor(el) {
        this.el = el;
        this.canEnd = true;
        this.canEndAttribute = true;
    }
    // Since NotAllowedWalker is a singleton, the cloning operation just
    // returns the original walker.
    clone() {
        return this;
    }
    possible() {
        return new Set();
    }
    possibleAttributes() {
        return new Set();
    }
    fireEvent() {
        return new base_1.InternalFireEventResult(false); // we never match!
    }
    end() {
        return false;
    }
    endAttributes() {
        return false;
    }
}
exports.NotAllowedWalker = NotAllowedWalker;
const singleton = new NotAllowedWalker(new NotAllowed("FAKE ELEMENT"));
//  LocalWords:  RNG's MPL possibleCached
//# sourceMappingURL=not_allowed.js.map