"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Attribute = void 0;
const errors_1 = require("../errors");
const events_1 = require("../events");
const set_1 = require("../set");
const base_1 = require("./base");
const data_1 = require("./data");
const text_1 = require("./text");
/**
 * A pattern for attributes.
 */
class Attribute extends base_1.Pattern {
    /**
     * @param xmlPath This is a string which uniquely identifies the
     * element from the simplified RNG tree. Used in debugging.
     *
     * @param name The qualified name of the attribute.
     *
     * @param pat The pattern contained by this one.
     */
    constructor(xmlPath, name, pat) {
        super(xmlPath);
        this.name = name;
        this.pat = pat;
        if (pat instanceof text_1.Text) {
            this.kind = 1 /* TEXT */;
        }
        else if (pat instanceof data_1.Data) {
            this.kind = 2 /* DATA */;
        }
        else {
            this.kind = 0 /* DEFAULT */;
        }
    }
    _prepare(definitions, namespaces) {
        this.pat._prepare(definitions, namespaces);
        this.name._recordNamespaces(namespaces, false);
    }
    hasAttrs() {
        return true;
    }
    hasEmptyPattern() {
        return false;
    }
    newWalker() {
        switch (this.kind) {
            case 1 /* TEXT */:
                return new AttributeTextWalker(this, this.name, false, false, false);
            case 2 /* DATA */:
                const pat = this.pat;
                return new AttributeDataWalker(this, this.name, pat.datatype, pat.params, pat.except, false, false, false);
            default:
                // tslint:disable-next-line:no-use-before-declare
                return new AttributeWalker(this, this.name, this.pat.newWalker(), false, /* seenName */ false, false);
        }
    }
}
exports.Attribute = Attribute;
/**
 * Walker for [[Attribute]].
 */
class AttributeWalker {
    /**
     * @param el The pattern for which this walker was created.
     */
    constructor(el, name, subwalker, seenName, canEndAttribute, canEnd) {
        this.el = el;
        this.name = name;
        this.subwalker = subwalker;
        this.seenName = seenName;
        this.canEndAttribute = canEndAttribute;
        this.canEnd = canEnd;
    }
    clone() {
        return new AttributeWalker(this.el, this.name, this.subwalker.clone(), this.seenName, this.canEndAttribute, this.canEnd);
    }
    possible() {
        return new Set();
    }
    possibleAttributes() {
        if (this.canEnd) {
            return new Set();
        }
        if (!this.seenName) {
            return new Set([new events_1.AttributeNameEvent(this.name)]);
        }
        // Convert text events to attributeValue events.
        return set_1.map(this.subwalker.possible(), ev => {
            if (ev.name !== "text") {
                throw new Error(`unexpected event type: ${ev.name}`);
            }
            return new events_1.AttributeValueEvent(ev.value, ev.documentation);
        });
    }
    fireEvent(name, params, nameResolver) {
        // If canEnd is true, we've done everything we could. So we don't
        // want to match again.
        if (this.canEnd) {
            return new base_1.InternalFireEventResult(false);
        }
        let value;
        if (this.seenName) {
            if (name !== "attributeValue") {
                return new base_1.InternalFireEventResult(false);
            }
            value = params[0];
        }
        else if ((name === "attributeNameAndValue" || name === "attributeName") &&
            this.name.match(params[0], params[1])) {
            this.seenName = true;
            if (name === "attributeName") {
                return new base_1.InternalFireEventResult(true);
            }
            value = params[2];
        }
        else {
            return new base_1.InternalFireEventResult(false);
        }
        this.canEnd = true;
        this.canEndAttribute = true;
        if (value !== "" &&
            !this.subwalker.fireEvent("text", [value], nameResolver).matched) {
            return new base_1.InternalFireEventResult(false, [new errors_1.AttributeValueError("invalid attribute value", this.name)]);
        }
        return base_1.InternalFireEventResult.fromEndResult(this.subwalker.end());
    }
    endAttributes() {
        if (this.canEnd) {
            return false;
        }
        // We set the canEnd flags true even though we did not end properly. This
        // prevents producing errors about the same attribute multiple times,
        // because end is called by element walkers when leaveStartTag is
        // encountered, and again when the element closes.
        this.canEnd = true;
        this.canEndAttribute = true;
        return [this.seenName ?
                new errors_1.AttributeValueError("attribute value missing", this.name) :
                new errors_1.AttributeNameError("attribute missing", this.name)];
    }
    end() {
        return false;
    }
}
/**
 * This is a specialized walker for attributes that contain <text/> (which is
 * the default when an attribute does not have a more specific content
 * specified).
 */
class AttributeTextWalker {
    /**
     * @param el The pattern for which this walker was created.
     */
    constructor(el, name, seenName, canEndAttribute, canEnd) {
        this.el = el;
        this.name = name;
        this.seenName = seenName;
        this.canEndAttribute = canEndAttribute;
        this.canEnd = canEnd;
    }
    clone() {
        return new AttributeTextWalker(this.el, this.name, this.seenName, this.canEndAttribute, this.canEnd);
    }
    possible() {
        return new Set();
    }
    possibleAttributes() {
        return this.canEnd ?
            new Set() :
            new Set([this.seenName ?
                    new events_1.AttributeValueEvent(/^[^]*$/) :
                    new events_1.AttributeNameEvent(this.name)]);
    }
    fireEvent(name, params, nameResolver) {
        // If canEnd is true, we've done everything we could. So we don't
        // want to match again.
        if (this.canEnd) {
            return new base_1.InternalFireEventResult(false);
        }
        if (this.seenName) {
            if (name !== "attributeValue") {
                return new base_1.InternalFireEventResult(false);
            }
        }
        else if ((name === "attributeNameAndValue" || name === "attributeName") &&
            this.name.match(params[0], params[1])) {
            this.seenName = true;
            if (name === "attributeName") {
                return new base_1.InternalFireEventResult(true);
            }
        }
        else {
            return new base_1.InternalFireEventResult(false);
        }
        this.canEnd = true;
        this.canEndAttribute = true;
        return new base_1.InternalFireEventResult(true);
    }
    endAttributes() {
        if (this.canEnd) {
            return false;
        }
        // We set the canEnd flags true even though we did not end properly. This
        // prevents producing errors about the same attribute multiple times,
        // because end is called by element walkers when leaveStartTag is
        // encountered, and again when the element closes.
        this.canEnd = true;
        this.canEndAttribute = true;
        return [this.seenName ?
                new errors_1.AttributeValueError("attribute value missing", this.name) :
                new errors_1.AttributeNameError("attribute missing", this.name)];
    }
    end() {
        return false;
    }
}
/**
 * This is a specialized walker for attributes that contain <data> (which is
 * rather common).
 */
class AttributeDataWalker {
    /**
     * @param el The pattern for which this walker was created.
     */
    constructor(el, name, datatype, params, except, seenName, canEndAttribute, canEnd) {
        this.el = el;
        this.name = name;
        this.datatype = datatype;
        this.params = params;
        this.except = except;
        this.seenName = seenName;
        this.canEndAttribute = canEndAttribute;
        this.canEnd = canEnd;
    }
    clone() {
        return new AttributeDataWalker(this.el, this.name, this.datatype, this.params, this.except, this.seenName, this.canEndAttribute, this.canEnd);
    }
    possible() {
        return new Set();
    }
    possibleAttributes() {
        return this.canEnd ?
            new Set() :
            new Set([this.seenName ?
                    new events_1.AttributeValueEvent(this.datatype.regexp) :
                    new events_1.AttributeNameEvent(this.name)]);
    }
    fireEvent(name, params, nameResolver) {
        // If canEnd is true, we've done everything we could. So we don't
        // want to match again.
        if (this.canEnd) {
            return new base_1.InternalFireEventResult(false);
        }
        let value;
        if (this.seenName) {
            if (name !== "attributeValue") {
                return new base_1.InternalFireEventResult(false);
            }
            value = params[0];
        }
        else if ((name === "attributeNameAndValue" || name === "attributeName") &&
            this.name.match(params[0], params[1])) {
            this.seenName = true;
            if (name === "attributeName") {
                return new base_1.InternalFireEventResult(true);
            }
            value = params[2];
        }
        else {
            return new base_1.InternalFireEventResult(false);
        }
        this.canEnd = true;
        this.canEndAttribute = true;
        if (this.datatype.disallows(value, this.params, this.datatype.needsContext ?
            { resolver: nameResolver } : undefined)) {
            return new base_1.InternalFireEventResult(false, [new errors_1.AttributeValueError("invalid attribute value", this.name)]);
        }
        if (this.except !== undefined) {
            const walker = this.except.newWalker();
            const exceptRet = walker.fireEvent(name, params, nameResolver);
            // False, so the except does match the text, and so this pattern does
            // not match it.
            if (exceptRet.matched) {
                return new base_1.InternalFireEventResult(false);
            }
            // Otherwise, it is undefined, in which case it means the except does
            // not match the text, and we are fine. Or it would be possible for the
            // walker to have returned an error but there is nothing we can do with
            // such errors here.
        }
        return new base_1.InternalFireEventResult(true);
    }
    endAttributes() {
        if (this.canEnd) {
            return false;
        }
        // We set the canEnd flags true even though we did not end properly. This
        // prevents producing errors about the same attribute multiple times,
        // because end is called by element walkers when leaveStartTag is
        // encountered, and again when the element closes.
        this.canEnd = true;
        this.canEndAttribute = true;
        return [this.seenName ?
                new errors_1.AttributeValueError("attribute value missing", this.name) :
                new errors_1.AttributeNameError("attribute missing", this.name)];
    }
    end() {
        return false;
    }
}
//  LocalWords:  RNG's MPL RNG attributeName attributeValue ev params
//  LocalWords:  neutralizeAttribute
//# sourceMappingURL=attribute.js.map