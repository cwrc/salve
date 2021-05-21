"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OneOrMore = void 0;
const set_1 = require("../set");
const base_1 = require("./base");
/**
 * A pattern for ``<oneOrMore>``.
 */
class OneOrMore extends base_1.OneSubpattern {
    newWalker() {
        const hasAttrs = this.hasAttrs();
        const currentIteration = this.pat.newWalker();
        // tslint:disable-next-line:no-use-before-declare
        return new OneOrMoreWalker(this, currentIteration, undefined, hasAttrs, this.pat, !hasAttrs || currentIteration.canEndAttribute, currentIteration.canEnd);
    }
}
exports.OneOrMore = OneOrMore;
/**
 * Walker for [[OneOrMore]]
 */
class OneOrMoreWalker {
    constructor(el, currentIteration, nextIteration, hasAttrs, subPat, canEndAttribute, canEnd) {
        this.el = el;
        this.currentIteration = currentIteration;
        this.nextIteration = nextIteration;
        this.hasAttrs = hasAttrs;
        this.subPat = subPat;
        this.canEndAttribute = canEndAttribute;
        this.canEnd = canEnd;
    }
    clone() {
        return new OneOrMoreWalker(this.el, this.currentIteration.clone(), this.nextIteration !== undefined ?
            this.nextIteration.clone() : undefined, this.hasAttrs, this.subPat, this.canEndAttribute, this.canEnd);
    }
    possible() {
        const ret = this.currentIteration.possible();
        if (this.currentIteration.canEnd) {
            if (this.nextIteration === undefined) {
                this.nextIteration = this.subPat.newWalker();
            }
            set_1.union(ret, this.nextIteration.possible());
        }
        return ret;
    }
    possibleAttributes() {
        const ret = this.currentIteration.possibleAttributes();
        if (this.currentIteration.canEnd) {
            if (this.nextIteration === undefined) {
                this.nextIteration = this.subPat.newWalker();
            }
            set_1.union(ret, this.nextIteration.possibleAttributes());
        }
        return ret;
    }
    fireEvent(name, params, nameResolver) {
        if (!this.hasAttrs && base_1.isAttributeEvent(name)) {
            return new base_1.InternalFireEventResult(false);
        }
        const currentIteration = this.currentIteration;
        const ret = currentIteration.fireEvent(name, params, nameResolver);
        if (ret.matched) {
            this.canEndAttribute = currentIteration.canEndAttribute;
            this.canEnd = currentIteration.canEnd;
            return ret;
        }
        if (currentIteration.canEnd) {
            let next = this.nextIteration;
            if (next === undefined) {
                next = this.nextIteration = this.subPat.newWalker();
            }
            const nextRet = next.fireEvent(name, params, nameResolver);
            if (nextRet.matched) {
                if (currentIteration.end()) {
                    throw new Error("internal error; canEnd returns true but end() fails");
                }
                this.currentIteration = next;
                this.nextIteration = undefined;
                this.canEndAttribute = next.canEndAttribute;
                this.canEnd = next.canEnd;
            }
            return nextRet;
        }
        return ret;
    }
    end() {
        return this.canEnd ? false : this.currentIteration.end();
    }
    endAttributes() {
        return this.canEndAttribute ? false : this.currentIteration.endAttributes();
    }
}
//  LocalWords:  RNG's MPL currentIteration nextIteration canEnd oneOrMore rng
//  LocalWords:  anyName suppressAttributes instantiateCurrentIteration
//# sourceMappingURL=one_or_more.js.map