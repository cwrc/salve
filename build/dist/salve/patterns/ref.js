"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefWalker = exports.Ref = void 0;
const errors_1 = require("../errors");
const events_1 = require("../events");
const base_1 = require("./base");
/**
 * A pattern for RNG references.
 */
class Ref extends base_1.Pattern {
    /**
     *
     * @param xmlPath This is a string which uniquely identifies the
     * element from the simplified RNG tree. Used in debugging.
     *
     * @param name The reference name.
     */
    constructor(xmlPath, name) {
        super(xmlPath);
        this.name = name;
    }
    _prepare(definitions) {
        this.resolvesTo = definitions.get(this.name);
        if (this.resolvesTo === undefined) {
            throw new Error("${this.name} cannot be resolved");
        }
    }
    hasEmptyPattern() {
        // Refs always contain an element at the top level.
        return false;
    }
    get element() {
        const resolvesTo = this.resolvesTo;
        if (resolvesTo === undefined) {
            throw new Error("trying to get an element on a ref hat has not been \
resolved");
        }
        return resolvesTo.pat;
    }
    newWalker() {
        const element = this.element;
        return element.notAllowed ?
            element.pat.newWalker() :
            // tslint:disable-next-line:no-use-before-declare
            new RefWalker(this, element, element.name, new events_1.EnterStartTagEvent(element.name), true, false);
    }
}
exports.Ref = Ref;
class RefWalker {
    /**
     * @param el The pattern for which this walker was constructed.
     */
    constructor(el, element, startName, startTagEvent, canEndAttribute, canEnd) {
        this.el = el;
        this.element = element;
        this.startName = startName;
        this.startTagEvent = startTagEvent;
        this.canEndAttribute = canEndAttribute;
        this.canEnd = canEnd;
    }
    clone() {
        return new RefWalker(this.el, this.element, this.startName, this.startTagEvent, this.canEndAttribute, this.canEnd);
    }
    possible() {
        return new Set(this.canEnd ? undefined : [this.startTagEvent]);
    }
    possibleAttributes() {
        return new Set();
    }
    fireEvent(name, params) {
        if (!this.canEnd &&
            (name === "enterStartTag" || name === "startTagAndAttributes") &&
            this.startName.match(params[0], params[1])) {
            this.canEnd = true;
            return new base_1.InternalFireEventResult(true, undefined, [this]);
        }
        return new base_1.InternalFireEventResult(false);
    }
    end() {
        return !this.canEnd ?
            [new errors_1.ElementNameError("tag required", this.startName)] : false;
    }
    endAttributes() {
        return false;
    }
}
exports.RefWalker = RefWalker;
//# sourceMappingURL=ref.js.map