"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Empty = void 0;
/**
 * Pattern and walker for RNG's ``empty`` elements.
 * @author Louis-Dominique Dubeau
 * @license MPL 2.0
 * @copyright Mangalam Research Center for Buddhist Languages
 */
const base_1 = require("./base");
/**
 * Pattern for ``<empty/>``.
 */
class Empty extends base_1.Pattern {
    hasEmptyPattern() {
        return true;
    }
    newWalker() {
        // tslint:disable-next-line:no-use-before-declare
        return singleton;
    }
}
exports.Empty = Empty;
/**
 * Walker for [[Empty]].
 *
 * @param el The pattern for which this walker was created.
 *
 * @param resolver Ignored by this walker.
 */
class EmptyWalker {
    constructor(el) {
        this.el = el;
        this.canEnd = true;
        this.canEndAttribute = true;
    }
    // Since the Empty walker is a singleton, the cloning operation just
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
    fireEvent(name, params) {
        return new base_1.InternalFireEventResult((name === "text") &&
            !/\S/.test(params[0]));
    }
    end() {
        return false;
    }
    endAttributes() {
        return false;
    }
}
const singleton = new EmptyWalker(new Empty("FAKE ELEMENT"));
//  LocalWords:  RNG's MPL possibleCached
//# sourceMappingURL=empty.js.map