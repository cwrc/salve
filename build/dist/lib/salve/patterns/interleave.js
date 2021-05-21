"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Interleave = void 0;
const set_1 = require("../set");
const base_1 = require("./base");
/**
 * A pattern for ``<interleave>``.
 */
class Interleave extends base_1.TwoSubpatterns {
    _computeHasEmptyPattern() {
        return this.patA.hasEmptyPattern() && this.patB.hasEmptyPattern();
    }
    newWalker() {
        const hasAttrs = this.hasAttrs();
        const walkerA = this.patA.newWalker();
        const walkerB = this.patB.newWalker();
        // tslint:disable-next-line:no-use-before-declare
        return new InterleaveWalker(this, walkerA, walkerB, hasAttrs, false, !hasAttrs || (walkerA.canEndAttribute &&
            walkerB.canEndAttribute), walkerA.canEnd && walkerB.canEnd);
    }
}
exports.Interleave = Interleave;
/**
 * Walker for [[Interleave]].
 */
class InterleaveWalker {
    constructor(el, walkerA, walkerB, hasAttrs, ended, canEndAttribute, canEnd) {
        this.el = el;
        this.walkerA = walkerA;
        this.walkerB = walkerB;
        this.hasAttrs = hasAttrs;
        this.ended = ended;
        this.canEndAttribute = canEndAttribute;
        this.canEnd = canEnd;
    }
    clone() {
        return new InterleaveWalker(this.el, this.walkerA.clone(), this.walkerB.clone(), this.hasAttrs, this.ended, this.canEndAttribute, this.canEnd);
    }
    possible() {
        if (this.ended) {
            return new Set();
        }
        const ret = this.walkerA.possible();
        set_1.union(ret, this.walkerB.possible());
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
    //
    // Interleave is very unusual among the patterns due to the fact that it
    // ignores subpattern order. For instance
    //
    // <interleave>A<interleave>B C</interleave></interleave>
    //
    // can match any permutation of the patterns A B and C. In particular, the
    // sequence B A C needs to be handled by the inner interleave, then by the
    // pattern for A and then by the inner interleave again.
    //
    // Moreover, while validating, it may match subpatterns only partially.
    // For instance:
    //
    // <interleave><group>A B</group>C</interleave>
    //
    // will match all permutations of A B C where A appears before B (so A B C, A
    // C B and C A B). The sequence A C B is particularly problematic as it means
    // matching the inner group, then matching C, then going back to the inner
    // group!
    //
    // When an interleave subpattern starts to match, we may not switch to
    // another subpattern until that subpattern is done. However, "done" here is
    // not synonymous with ``canEnd === true``. Looking again at the B A C
    // scenario above, we can switch to A when B is done but the inner level
    // interleave is itself not "done" because C has not matched yet.
    //
    // We work around the issue by counting the number of start tags and end tags
    // seen by a pattern. When they are equal we can switch away from from the
    // pattern to another one.
    //
    fireEvent(name, params, nameResolver) {
        if (!this.hasAttrs && base_1.isAttributeEvent(name)) {
            return new base_1.InternalFireEventResult(false);
        }
        //
        // fireEvent is not called after ended is true
        // if (this.ended) {
        //   return new InternalFireEventResult(false);
        // }
        //
        const { walkerA, walkerB } = this;
        const retA = walkerA.fireEvent(name, params, nameResolver);
        if (retA.matched) {
            this.canEndAttribute = walkerA.canEndAttribute && walkerB.canEndAttribute;
            this.canEnd = walkerA.canEnd && walkerB.canEnd;
            // The constraints on interleave do not allow for two child patterns of
            // interleave to match. So if the first walker matched, the second
            // cannot. So we don't have to fireEvent on the second walker if the
            // first matched.
            return retA;
        }
        const retB = walkerB.fireEvent(name, params, nameResolver);
        if (retB.matched) {
            this.canEndAttribute =
                walkerA.canEndAttribute && walkerB.canEndAttribute;
            this.canEnd = walkerA.canEnd && walkerB.canEnd;
            return retB;
        }
        return new base_1.InternalFireEventResult(false);
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
        const retB = this.walkerB.end();
        if (retA) {
            return !retB ? retA : retA.concat(retB);
        }
        return retB;
    }
    endAttributes() {
        if (this.canEndAttribute) {
            return false;
        }
        const retA = this.walkerA.endAttributes();
        const retB = this.walkerB.endAttributes();
        if (retA) {
            return retB ? retA.concat(retB) : retA;
        }
        return retB;
    }
}
//  LocalWords:  RNG's MPL NG inA inB instantiateWalkers fireEvent retA retB
//# sourceMappingURL=interleave.js.map