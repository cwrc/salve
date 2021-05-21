"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Group = void 0;
/**
 * Pattern and walker for RNG's ``group`` elements.
 * @author Louis-Dominique Dubeau
 * @license MPL 2.0
 * @copyright Mangalam Research Center for Buddhist Languages
 */
const errors_1 = require("../errors");
const set_1 = require("../set");
const base_1 = require("./base");
/**
 * A pattern for ``<group>``.
 */
class Group extends base_1.TwoSubpatterns {
    _computeHasEmptyPattern() {
        return this.patA.hasEmptyPattern() && this.patB.hasEmptyPattern();
    }
    newWalker() {
        const hasAttrs = this.hasAttrs();
        const walkerA = this.patA.newWalker();
        const walkerB = this.patB.newWalker();
        // tslint:disable-next-line:no-use-before-declare
        return new GroupWalker(this, walkerA, walkerB, hasAttrs, false, false, !hasAttrs ||
            (walkerA.canEndAttribute && walkerB.canEndAttribute), walkerA.canEnd && walkerB.canEnd);
    }
}
exports.Group = Group;
/**
 * Walker for [[Group]].
 */
class GroupWalker {
    constructor(el, walkerA, walkerB, hasAttrs, ended, endedA, canEndAttribute, canEnd) {
        this.el = el;
        this.walkerA = walkerA;
        this.walkerB = walkerB;
        this.hasAttrs = hasAttrs;
        this.ended = ended;
        this.endedA = endedA;
        this.canEndAttribute = canEndAttribute;
        this.canEnd = canEnd;
    }
    clone() {
        return new GroupWalker(this.el, this.walkerA.clone(), this.walkerB.clone(), this.hasAttrs, this.ended, this.endedA, this.canEndAttribute, this.canEnd);
    }
    possible() {
        if (this.ended) {
            return new Set();
        }
        const ret = this.walkerA.possible();
        if (this.walkerA.canEnd) {
            set_1.union(ret, this.walkerB.possible());
        }
        return ret;
    }
    possibleAttributes() {
        if (this.ended) {
            return new Set();
        }
        const ret = this.walkerA.possibleAttributes();
        set_1.union(ret, this.walkerB.possibleAttributes());
        return ret;
    }
    fireEvent(name, params, nameResolver) {
        const evIsAttributeEvent = base_1.isAttributeEvent(name);
        if (evIsAttributeEvent && !this.hasAttrs) {
            return new base_1.InternalFireEventResult(false);
        }
        //
        // fireEvent is not called after ended becomes true
        //
        // if (this.ended) {
        //   return new InternalFireEventResult(false);
        // }
        const { walkerA, walkerB } = this;
        if (!this.endedA) {
            const retA = walkerA.fireEvent(name, params, nameResolver);
            if (retA.matched || retA.errors !== undefined) {
                this.canEndAttribute = walkerA.canEndAttribute &&
                    walkerB.canEndAttribute;
                this.canEnd = walkerA.canEnd && walkerB.canEnd;
                return retA;
            }
            // We must return right away if walkerA cannot yet end. Only attribute
            // events are allowed to move forward.
            if (!evIsAttributeEvent && !walkerA.canEnd) {
                return retA;
            }
        }
        const retB = walkerB.fireEvent(name, params, nameResolver);
        this.canEndAttribute = walkerA.canEndAttribute && walkerB.canEndAttribute;
        this.canEnd = walkerA.canEnd && walkerB.canEnd;
        // Non-attribute event: if walker b matched the event then we must end
        // walkerA, if we've not already done so.
        if (!evIsAttributeEvent && retB.matched) {
            this.endedA = true;
            // Having an end that errors here is not possible.
            if (walkerA.end() !== false) {
                throw new Error("walkerA can end but does not end cleanly!");
            }
        }
        return retB;
    }
    end() {
        if (this.ended) {
            return false;
        }
        if (this.canEnd) {
            this.ended = true;
            return false;
        }
        const retA = this.walkerA.end();
        // If we get here and the only errors we get are attribute errors, we must
        // move on to check the second walker too.
        if (retA) {
            for (const err of retA) {
                if (!(err instanceof errors_1.AttributeValueError ||
                    err instanceof errors_1.AttributeNameError)) {
                    // We ran into a non-attribute error. We can stop here.
                    return retA;
                }
            }
        }
        const retB = this.walkerB.end();
        if (retB) {
            return retA ? retA.concat(retB) : retB;
        }
        return retA;
    }
    endAttributes() {
        if (this.canEndAttribute) {
            return false;
        }
        const endA = this.walkerA.endAttributes();
        const endB = this.walkerB.endAttributes();
        if (endB) {
            return endA ? endA.concat(endB) : endB;
        }
        return endA;
    }
}
//  LocalWords:  RNG's MPL instantiateWalkers walkerA retB canEnd endedA
//# sourceMappingURL=group.js.map