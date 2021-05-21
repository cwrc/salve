"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.List = void 0;
/**
 * Pattern and walker for RNG's ``list`` elements.
 * @author Louis-Dominique Dubeau
 * @license MPL 2.0
 * @copyright Mangalam Research Center for Buddhist Languages
 */
const errors_1 = require("../errors");
const base_1 = require("./base");
/**
 * List pattern.
 */
class List extends base_1.OneSubpattern {
    // We override these because lists cannot contain attributes so there's
    // no point in caching _hasAttrs's result.
    _prepare(definitions, namespaces) {
        this.pat._prepare(definitions, namespaces);
        this._cachedHasEmptyPattern = this.pat.hasEmptyPattern();
    }
    hasAttrs() {
        return false;
    }
    newWalker() {
        const hasEmptyPattern = this.hasEmptyPattern();
        // tslint:disable-next-line:no-use-before-declare
        return new ListWalker(this, this.pat.newWalker(), hasEmptyPattern, hasEmptyPattern);
    }
}
exports.List = List;
/**
 * Walker for [[List]].
 *
 */
class ListWalker {
    constructor(el, subwalker, canEndAttribute, canEnd) {
        this.el = el;
        this.subwalker = subwalker;
        this.canEndAttribute = canEndAttribute;
        this.canEnd = canEnd;
    }
    clone() {
        return new ListWalker(this.el, this.subwalker.clone(), this.canEndAttribute, this.canEnd);
    }
    possible() {
        return this.subwalker.possible();
    }
    possibleAttributes() {
        return new Set();
    }
    fireEvent(name, params, nameResolver) {
        // Only this can match.
        if (name !== "text") {
            return new base_1.InternalFireEventResult(false);
        }
        const trimmed = params[0].trim();
        // The list walker cannot send empty strings to its children because it
        // validates a list of **tokens**.
        if (trimmed === "") {
            return new base_1.InternalFireEventResult(true);
        }
        // ret is necessarily set by the loop because we deal with the empty case
        // above.
        let ret;
        for (const token of trimmed.split(/\s+/)) {
            ret = this.subwalker.fireEvent("text", [token], nameResolver);
            if (!ret.matched) {
                this.canEndAttribute = this.canEnd = false;
                return ret;
            }
        }
        this.canEndAttribute = this.canEnd = this.subwalker.canEnd;
        // It is not possible for ret to be undefined here.
        return ret;
    }
    end() {
        if (this.canEnd) {
            return false;
        }
        const ret = this.subwalker.end();
        return ret !== false ? ret : [new errors_1.ValidationError("unfulfilled list")];
    }
    endAttributes() {
        return false;
    }
}
//  LocalWords:  RNG's MPL nd
//# sourceMappingURL=list.js.map