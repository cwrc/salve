"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Choice = void 0;
/**
 * Pattern and walker for RNG's ``choice`` elements.
 * @author Louis-Dominique Dubeau
 * @license MPL 2.0
 * @copyright Mangalam Research Center for Buddhist Languages
 */
const errors_1 = require("../errors");
const set_1 = require("../set");
const base_1 = require("./base");
const empty_1 = require("./empty");
/**
 * A pattern for ``<choice>``.
 */
class Choice extends base_1.TwoSubpatterns {
    constructor(xmlPath, patA, patB) {
        super(xmlPath, patA, patB);
        this.optional = patA instanceof empty_1.Empty;
    }
    _computeHasEmptyPattern() {
        return this.patA.hasEmptyPattern() || this.patB.hasEmptyPattern();
    }
    newWalker() {
        const hasAttrs = this.hasAttrs();
        const walkerB = this.patB.newWalker();
        if (this.optional) {
            // tslint:disable-next-line:no-use-before-declare
            return new OptionalChoiceWalker(this, walkerB, hasAttrs, false, true, true);
        }
        else {
            const walkerA = this.patA.newWalker();
            // tslint:disable-next-line:no-use-before-declare
            return new ChoiceWalker(this, walkerA, walkerB, hasAttrs, false, false, !hasAttrs || walkerA.canEndAttribute ||
                walkerB.canEndAttribute, walkerA.canEnd || walkerB.canEnd);
        }
    }
}
exports.Choice = Choice;
/**
 * Walker for [[Choice]].
 */
class ChoiceWalker {
    constructor(el, walkerA, walkerB, hasAttrs, deactivateA, deactivateB, canEndAttribute, canEnd) {
        this.el = el;
        this.walkerA = walkerA;
        this.walkerB = walkerB;
        this.hasAttrs = hasAttrs;
        this.deactivateA = deactivateA;
        this.deactivateB = deactivateB;
        this.canEndAttribute = canEndAttribute;
        this.canEnd = canEnd;
    }
    clone() {
        return new ChoiceWalker(this.el, this.walkerA.clone(), this.walkerB.clone(), this.hasAttrs, this.deactivateA, this.deactivateB, this.canEndAttribute, this.canEnd);
    }
    possible() {
        const walkerA = this.walkerA;
        let ret = this.deactivateA ? undefined : walkerA.possible();
        const walkerB = this.walkerB;
        if (!this.deactivateB) {
            const possibleB = walkerB.possible();
            if (ret === undefined) {
                ret = possibleB;
            }
            else {
                set_1.union(ret, possibleB);
            }
        }
        else if (ret === undefined) {
            ret = new Set();
        }
        return ret;
    }
    possibleAttributes() {
        const walkerA = this.walkerA;
        let ret = this.deactivateA ? undefined : walkerA.possibleAttributes();
        const walkerB = this.walkerB;
        if (!this.deactivateB) {
            const possibleB = walkerB.possibleAttributes();
            if (ret === undefined) {
                ret = possibleB;
            }
            else {
                set_1.union(ret, possibleB);
            }
        }
        else if (ret === undefined) {
            ret = new Set();
        }
        return ret;
    }
    fireEvent(name, params, nameResolver) {
        //
        // It cannot happen that fireEvent be called when deactivateA and
        // deactivateB are true at the same time.
        //
        // if (this.deactivateA && this.deactivateB) {
        //   return new InternalFireEventResult(false);
        // }
        if (!this.hasAttrs && base_1.isAttributeEvent(name)) {
            return new base_1.InternalFireEventResult(false);
        }
        const { walkerA, walkerB } = this;
        const retA = this.deactivateA ? new base_1.InternalFireEventResult(false) :
            walkerA.fireEvent(name, params, nameResolver);
        const retB = this.deactivateB ? new base_1.InternalFireEventResult(false) :
            walkerB.fireEvent(name, params, nameResolver);
        if (retA.matched) {
            if (!retB.matched) {
                this.deactivateB = true;
                this.canEndAttribute = walkerA.canEndAttribute;
                this.canEnd = walkerA.canEnd;
            }
            else {
                this.canEndAttribute = walkerA.canEndAttribute ||
                    walkerB.canEndAttribute;
                this.canEnd = walkerA.canEnd || walkerB.canEnd;
            }
            return retA.combine(retB);
        }
        if (retB.matched) {
            this.deactivateA = true;
            this.canEndAttribute = walkerB.canEndAttribute;
            this.canEnd = walkerB.canEnd;
        }
        return retB.combine(retA);
    }
    end() {
        if (this.canEnd) {
            // Instead of an ended flag, we set both flags.
            this.deactivateA = true;
            this.deactivateB = true;
            return false;
        }
        const retA = this.deactivateA ? false : this.walkerA.end();
        const retB = this.deactivateB ? false : this.walkerB.end();
        if (!retA) {
            return retB;
        }
        if (!retB) {
            return retA;
        }
        // If we are here both walkers exist and returned an error. We combine the
        // errors no matter which walker may have been deactivated.
        const combined = this.combineChoices();
        return combined.length !== 0 ? combined : retA;
    }
    endAttributes() {
        if (this.canEndAttribute) {
            return false;
        }
        const retA = this.deactivateA ? false : this.walkerA.endAttributes();
        const retB = this.deactivateB ? false : this.walkerB.endAttributes();
        if (!retA) {
            return retB;
        }
        if (!retB) {
            return retA;
        }
        // If we are here both walkers exist and returned an error. We combine the
        // errors no matter which walker may have been deactivated.
        const combined = this.combineChoices();
        return combined.length !== 0 ? combined : retA;
    }
    combineChoices() {
        const namesA = [];
        const values = [];
        for (const ev of this.walkerA.possible()) {
            switch (ev.name) {
                case "enterStartTag":
                case "attributeName":
                    namesA.push(ev.param);
                    break;
                case "attributeValue":
                case "text":
                    values.push(ev.param);
                    break;
                default:
                    return []; // We cannot make a good combination.
            }
        }
        const namesB = [];
        for (const ev of this.walkerB.possible()) {
            switch (ev.name) {
                case "enterStartTag":
                case "attributeName":
                    namesB.push(ev.param);
                    break;
                case "attributeValue":
                case "text":
                    values.push(ev.param);
                    break;
                default:
                    return []; // We cannot make a good combination.
            }
        }
        return [
            values.length !== 0 ?
                new errors_1.ValidationError(`one value required from the following: ${values.join(", ")}`) :
                new errors_1.ChoiceError(namesA, namesB),
        ];
    }
}
/**
 * Walker for [[Choice]].
 */
class OptionalChoiceWalker {
    constructor(el, walkerB, hasAttrs, ended, canEndAttribute, canEnd) {
        this.el = el;
        this.walkerB = walkerB;
        this.hasAttrs = hasAttrs;
        this.ended = ended;
        this.canEndAttribute = canEndAttribute;
        this.canEnd = canEnd;
    }
    clone() {
        return new OptionalChoiceWalker(this.el, this.walkerB.clone(), this.hasAttrs, this.ended, this.canEndAttribute, this.canEnd);
    }
    possible() {
        return this.ended ? new Set() : this.walkerB.possible();
    }
    possibleAttributes() {
        return this.ended ? new Set() : this.walkerB.possibleAttributes();
    }
    fireEvent(name, params, nameResolver) {
        //
        // It cannot happen that fireEvent is called with ended true.
        //
        // if (this.ended) {
        //   return new InternalFireEventResult(false);
        // }
        //
        if (!this.hasAttrs && base_1.isAttributeEvent(name)) {
            return new base_1.InternalFireEventResult(false);
        }
        if (name === "text" && !/\S/.test(params[0])) {
            return new base_1.InternalFireEventResult(true);
        }
        const { walkerB } = this;
        const retB = walkerB.fireEvent(name, params, nameResolver);
        if (retB.matched) {
            this.canEndAttribute = walkerB.canEndAttribute;
            this.canEnd = walkerB.canEnd;
        }
        return retB;
    }
    end() {
        if (this.canEnd) {
            this.ended = true;
            return false;
        }
        return this.walkerB.end();
    }
    endAttributes() {
        return this.canEndAttribute ? false : this.walkerB.endAttributes();
    }
}
//  LocalWords:  RNG's MPL retA ChoiceWalker enterStartTag notAChoiceError
//  LocalWords:  tslint ChoiceError
//# sourceMappingURL=choice.js.map