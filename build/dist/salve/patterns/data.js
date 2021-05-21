"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Data = void 0;
/**
 * Pattern and walker for RNG's ``data`` elements.
 * @author Louis-Dominique Dubeau
 * @license MPL 2.0
 * @copyright Mangalam Research Center for Buddhist Languages
 */
const datatypes_1 = require("../datatypes");
const errors_1 = require("../errors");
const events_1 = require("../events");
const base_1 = require("./base");
/**
 * Data pattern.
 */
class Data extends base_1.Pattern {
    /**
     *
     * @param xmlPath This is a string which uniquely identifies the
     * element from the simplified RNG tree. Used in debugging.
     *
     * @param type The type of value.
     *
     * @param datatypeLibrary The URI of the datatype library to use.
     *
     * @param params The parameters from the RNG file.
     *
     * @param except The exception pattern.
     */
    // tslint:disable-next-line: no-reserved-keywords
    constructor(xmlPath, type = "token", datatypeLibrary = "", params, except) {
        super(xmlPath);
        this.type = type;
        this.datatypeLibrary = datatypeLibrary;
        this.except = except;
        const datatype = this.datatype =
            datatypes_1.registry.get(this.datatypeLibrary).types[this.type];
        if (datatype === undefined) {
            throw new Error(`unknown type: ${type}`);
        }
        this.rngParams = params;
    }
    get params() {
        let ret = this._params;
        if (ret !== undefined) {
            return ret;
        }
        ret = this._params = this.datatype.parseParams(this.xmlPath, this.rngParams);
        return ret;
    }
    get allowsEmptyContent() {
        let ret = this._allowsEmptyContent;
        if (ret !== undefined) {
            return ret;
        }
        const { except, params, datatype } = this;
        ret = this._allowsEmptyContent =
            !(except !== undefined && except.hasEmptyPattern()) &&
                !datatype.disallows("", params);
        return ret;
    }
    newWalker() {
        const { allowsEmptyContent } = this;
        // tslint:disable-next-line:no-use-before-declare
        return new DataWalker(this, this.datatype, this.params, this.except, false, allowsEmptyContent, allowsEmptyContent);
    }
}
exports.Data = Data;
/**
 * Walker for [[Data]].
 */
class DataWalker {
    constructor(el, datatype, params, except, matched, canEndAttribute, canEnd) {
        this.el = el;
        this.datatype = datatype;
        this.params = params;
        this.except = except;
        this.matched = matched;
        this.canEndAttribute = canEndAttribute;
        this.canEnd = canEnd;
    }
    clone() {
        return new DataWalker(this.el, this.el.datatype, this.el.params, this.el.except, this.matched, this.canEndAttribute, this.canEnd);
    }
    possible() {
        // We completely ignore the possible exception when producing the
        // possibilities. There is no clean way to specify such an exception.
        return new Set(this.matched ? undefined :
            [new events_1.TextEvent(this.datatype.regexp)]);
    }
    possibleAttributes() {
        return new Set();
    }
    fireEvent(name, params, nameResolver) {
        if (this.matched || name !== "text" ||
            this.datatype.disallows(params[0], this.params, { resolver: nameResolver })) {
            return new base_1.InternalFireEventResult(false);
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
        // If we matched, we are done. salve does not allow text that appears in
        // an XML element to be passed as two "text" events. So there is nothing
        // to come that could falsify the match. (If a client *does* pass
        // multiple text events one after the other, it is using salve
        // incorrectly.)
        this.matched = true;
        this.canEnd = true;
        this.canEndAttribute = true;
        return new base_1.InternalFireEventResult(true);
    }
    end() {
        return this.canEnd ? false : [new errors_1.ValidationError("value required")];
    }
    endAttributes() {
        return false;
    }
}
//  LocalWords:  RNG's MPL RNG nd possibleCached
//# sourceMappingURL=data.js.map