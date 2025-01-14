"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Element = void 0;
/**
 * Pattern and walker for RNG's ``element`` elements.
 * @author Louis-Dominique Dubeau
 * @license MPL 2.0
 * @copyright Mangalam Research Center for Buddhist Languages
 */
const errors_1 = require("../errors");
const events_1 = require("../events");
const base_1 = require("./base");
const not_allowed_1 = require("./not_allowed");
/**
 * A pattern for elements.
 */
class Element extends base_1.BasePattern {
    /**
     * @param xmlPath This is a string which uniquely identifies the
     * element from the simplified RNG tree. Used in debugging.
     *
     * @param name The qualified name of the element.
     *
     * @param pat The pattern contained by this one.
     */
    constructor(xmlPath, name, pat) {
        super(xmlPath);
        this.name = name;
        this.pat = pat;
        this.notAllowed = pat instanceof not_allowed_1.NotAllowed;
    }
    newWalker(boundName) {
        // tslint:disable-next-line:no-use-before-declare
        return new ElementWalker(this, this.pat.hasAttrs(), this.pat.newWalker(), false, new events_1.EndTagEvent(boundName), boundName, true, false);
    }
    hasAttrs() {
        return false;
    }
    hasEmptyPattern() {
        // The question is whether an element allows empty content **in the context
        // in which it appears**, not empty content inside it. So the answer is
        // always negative.
        return false;
    }
    _prepare(definitions, namespaces) {
        this.name._recordNamespaces(namespaces, true);
        this.pat._prepare(definitions, namespaces);
    }
}
exports.Element = Element;
/**
 *
 * Walker for [[Element]].
 */
class ElementWalker {
    constructor(el, hasAttrs, walker, endedStartTag, endTagEvent, boundName, canEndAttribute, canEnd) {
        this.el = el;
        this.hasAttrs = hasAttrs;
        this.walker = walker;
        this.endedStartTag = endedStartTag;
        this.endTagEvent = endTagEvent;
        this.boundName = boundName;
        this.canEndAttribute = canEndAttribute;
        this.canEnd = canEnd;
    }
    clone() {
        return new ElementWalker(this.el, this.hasAttrs, this.walker.clone(), this.endedStartTag, this.endTagEvent, this.boundName, this.canEndAttribute, this.canEnd);
    }
    possible() {
        // Contrarily to all other implementations, which must only return
        // non-attribute events. This implementation actually returns all types of
        // possible events. Representing this distinction through TS type
        // declarations would be cumbersome. The exception works because of the way
        // Relax NG constrains the structure of a simplified schema. The only
        // possible caller for this method is ``GrammarWalker``, which also aims to
        // return all possible events.
        if (!this.endedStartTag) {
            const walker = this.walker;
            const ret = walker.possibleAttributes();
            if (walker.canEndAttribute) {
                ret.add(ElementWalker._leaveStartTagEvent);
            }
            return ret;
        }
        else if (!this.canEnd) {
            const walker = this.walker;
            const posses = walker.possible();
            if (walker.canEnd) {
                posses.add(this.endTagEvent);
            }
            return posses;
        }
        return new Set();
    }
    possibleAttributes() {
        throw new Error("calling possibleAttributes on ElementWalker is invalid");
    }
    /**
     * Initialize this walker with initial attributes. This is provided to support
     * ``startTagAndAttributes``.
     *
     * @param params The **entire** list of parameters passed with the
     * ``startTagAndAttributes`` event.
     *
     * @param nameResolver The name resolver to use to resolve names.
     *
     * @returns The result of firing all the events for the attributes.
     */
    initWithAttributes(params, nameResolver) {
        const { walker } = this;
        // We need to handle all attributes and leave the start tag.
        for (let ix = 2; ix < params.length; ix += 3) {
            const attrRet = walker.fireEvent("attributeNameAndValue", [params[ix], params[ix + 1],
                params[ix + 2]], nameResolver);
            if (!attrRet.matched) {
                return attrRet;
            }
        }
        // Make leaveStartTag effective.
        this.endedStartTag = true;
        return this.hasAttrs ?
            base_1.InternalFireEventResult.fromEndResult(walker.endAttributes()) :
            new base_1.InternalFireEventResult(true);
    }
    fireEvent(name, params, nameResolver) {
        // This is not a useful optimization. canEnd becomes true once we see
        // the end tag, which means that this walker will be popped of
        // GrammarWalker's stack and won't be called again.
        //
        // if (this.canEnd) {
        //   return undefined;
        // }
        const walker = this.walker;
        if (this.endedStartTag) {
            if (name === "endTag") {
                // We cannot get here if canEnd is already true. So this will
                // necessarily leave it false or set it to true but it won't set a true
                // canEnd back to false.
                this.canEnd = this.boundName.match(params[0], params[1]);
                return base_1.InternalFireEventResult.fromEndResult(walker.end());
            }
            return walker.fireEvent(name, params, nameResolver);
        }
        if (name === "leaveStartTag") {
            this.endedStartTag = true;
            return this.hasAttrs ?
                base_1.InternalFireEventResult.fromEndResult(walker.endAttributes()) :
                new base_1.InternalFireEventResult(true);
        }
        return walker.fireEvent(name, params, nameResolver);
    }
    end() {
        if (this.canEnd) {
            return false;
        }
        const err = new errors_1.ElementNameError(this.endedStartTag ?
            "tag not closed" :
            "start tag not terminated", this.boundName);
        const walkerRet = this.walker.end();
        return walkerRet ? walkerRet.concat(err) : [err];
    }
    endAttributes() {
        throw new Error("calling endAttributes on ElementWalker is illegal");
    }
}
ElementWalker._leaveStartTagEvent = new events_1.LeaveStartTagEvent();
//  LocalWords:  RNG's MPL RNG ElementWalker leaveStartTag valueEvs
//  LocalWords:  enterStartTag attributeValue endTag errored subwalker
//  LocalWords:  neutralizeAttribute boundName fireEvent suppressAttributes
//# sourceMappingURL=element.js.map