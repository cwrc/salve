"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Value = void 0;
/**
 * Pattern and walker for RNG's ``list`` elements.
 * @author Louis-Dominique Dubeau
 * @license MPL 2.0
 * @copyright Mangalam Research Center for Buddhist Languages
 */
const datatypes_1 = require("../datatypes");
const ename_1 = require("../ename");
const errors_1 = require("../errors");
const events_1 = require("../events");
const base_1 = require("./base");
/**
 * Value pattern.
 */
class Value extends base_1.Pattern {
    /**
     * @param xmlPath This is a string which uniquely identifies the
     * element from the simplified RNG tree. Used in debugging.
     *
     * @param value The value expected in the document.
     *
     * @param type The type of value. ``undefined`` means
     * ``"token"``.
     *
     * @param datatypeLibrary The URI of the datatype library to
     * use. ``undefined`` means use the builtin library.
     *
     * @param ns The namespace in which to interpret the value.
     *
     * @param documentation Documentation about the value.
     */
    // tslint:disable-next-line: no-reserved-keywords
    constructor(xmlPath, value, type = "token", datatypeLibrary = "", ns = "", documentation) {
        super(xmlPath);
        this.type = type;
        this.datatypeLibrary = datatypeLibrary;
        this.ns = ns;
        this.datatype = datatypes_1.registry.get(this.datatypeLibrary).types[this.type];
        if (this.datatype === undefined) {
            throw new Error(`unknown type: ${type}`);
        }
        this.rawValue = value;
        this.documentation = documentation;
    }
    get value() {
        let ret = this._value;
        if (ret != null) {
            return ret;
        }
        // We construct a pseudo-context representing the context in the schema
        // file.
        let context;
        if (this.datatype.needsContext) {
            context = {
                resolver: {
                    resolveName: (name) => {
                        return new ename_1.EName(this.ns, name);
                    },
                    clone() {
                        throw new Error("cannot clone this resolver");
                    },
                },
            };
        }
        ret = this._value = this.datatype.parseValue(this.xmlPath, this.rawValue, context);
        return ret;
    }
    hasEmptyPattern() {
        return this.rawValue === "";
    }
    newWalker() {
        const hasEmptyPattern = this.hasEmptyPattern();
        // tslint:disable-next-line:no-use-before-declare
        return new ValueWalker(this, false, hasEmptyPattern, hasEmptyPattern);
    }
}
exports.Value = Value;
/**
 * Walker for [[Value]].
 */
class ValueWalker {
    constructor(el, matched, canEndAttribute, canEnd) {
        this.el = el;
        this.matched = matched;
        this.canEndAttribute = canEndAttribute;
        this.canEnd = canEnd;
    }
    clone() {
        return new ValueWalker(this.el, this.matched, this.canEndAttribute, this.canEnd);
    }
    possible() {
        return new Set(this.matched ? undefined :
            [new events_1.TextEvent(this.el.rawValue, this.el.documentation)]);
    }
    possibleAttributes() {
        return new Set();
    }
    fireEvent(name, params, nameResolver) {
        if (this.matched || name !== "text" ||
            !this.el.datatype.equal(params[0], this.el.value, { resolver: nameResolver })) {
            return new base_1.InternalFireEventResult(false);
        }
        this.matched = true;
        this.canEndAttribute = this.canEnd = true;
        return new base_1.InternalFireEventResult(true);
    }
    end() {
        return this.canEnd ? false :
            [new errors_1.ValidationError(`value required: ${this.el.rawValue}`)];
    }
    endAttributes() {
        return this.canEndAttribute ? false :
            [new errors_1.ValidationError(`value required: ${this.el.rawValue}`)];
    }
}
//  LocalWords:  RNG's MPL RNG nd possibleCached
//# sourceMappingURL=value.js.map