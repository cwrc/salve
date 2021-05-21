"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatatypeProcessor = exports.fromQNameToURI = exports.localName = void 0;
const tslib_1 = require("tslib");
const datatypes = tslib_1.__importStar(require("../../datatypes"));
const patterns_1 = require("../../patterns");
const parser_1 = require("../parser");
const warnAboutTheseTypes = [
    "ENTITY",
    "ENTITIES",
];
/**
 * @private
 *
 * @param el Element to start the search from.
 *
 * @returns ``true`` if ``el`` is an attribute or is in an RNG
 * ``<attribute>`` element. ``false`` otherwise.
 */
function inAttribute(el) {
    let current = el;
    while (current !== undefined) {
        if (current.local === "attribute") {
            return true;
        }
        current = current.parent;
    }
    return false;
}
function localName(value) {
    const sep = value.indexOf(":");
    return (sep === -1) ? value : value.slice(sep + 1);
}
exports.localName = localName;
function fromQNameToURI(value, el) {
    const colon = value.indexOf(":");
    let prefix;
    if (colon === -1) { // If there is no prefix
        if (inAttribute(el)) { // Attribute in undefined namespace
            return "";
        }
        // We are searching for the default namespace currently in effect.
        prefix = "";
    }
    else {
        prefix = value.substr(0, colon);
        if (value.lastIndexOf(":") !== colon) {
            throw new Error("invalid name");
        }
    }
    if (prefix === "") {
        // Yes, we return the empty string even if that what @ns is set to:
        // there is no default namespace when @ns is set to ''.
        return el.mustGetAttribute("ns");
    }
    //
    // We have a prefix, in which case @ns is useless. We have to get the
    // namespace from the namespaces declared in the XML file that contains the
    // schema. At this stage, @xmlns and @xmlns:prefix attributes should no longer
    // be available available. So we just ask the element to use its internal
    // namespace data to resolve the prefix.
    //
    // (Note: in fact in the current implementation of the simplifiers the xmlns
    // nodes are still available. The XSLT simplifier *cannot* carry the namespace
    // information we need without keeping those nodes around, or producing a
    // workaround. The internal simplifier does the same thing as the XSLT
    // simplifier for ease of debugging (we can expect the same results from
    // both). However... in any case the information is available through the
    // namespace information stored on the nodes. So...)
    //
    const uri = el.resolve(prefix);
    if (uri === undefined) {
        throw new Error(`cannot resolve prefix: ${prefix}`);
    }
    return uri;
}
exports.fromQNameToURI = fromQNameToURI;
/**
 * This walker checks that the types used in the tree can be used, and does
 * special processing for ``QName`` and ``NOTATION``.
 */
class DatatypeProcessor {
    constructor() {
        /**
         * The warnings generated during the walk. This array is populated while
         * walking.
         */
        this.warnings = [];
    }
    // tslint:disable-next-line:max-func-body-length
    walk(el) {
        let libname;
        let type; // tslint:disable-line: no-reserved-keywords
        const name = el.local;
        switch (name) {
            case "value": {
                let value = el.text;
                type = el.mustGetAttribute("type");
                libname = el.mustGetAttribute("datatypeLibrary");
                let ns = el.mustGetAttribute("ns");
                const lib = datatypes.registry.find(libname);
                if (lib === undefined) {
                    throw new datatypes.ValueValidationError(el.path, [new datatypes.ValueError(`unknown datatype library: ${libname}`)]);
                }
                const datatype = lib.types[type];
                if (datatype === undefined) {
                    throw new datatypes.ValueValidationError(el.path, [new datatypes.ValueError(`unknown datatype ${type} in \
${(libname === "") ? "default library" : `library ${libname}`}`)]);
                }
                if (datatype.needsContext &&
                    // tslint:disable-next-line: no-http-string
                    !(libname === "http://www.w3.org/2001/XMLSchema-datatypes" &&
                        (type === "QName" || type === "NOTATION"))) {
                    throw new Error("datatype needs context but is not QName or NOTATION \
form the XML Schema library: don't know how to handle");
                }
                if (datatype.needsContext) {
                    // Change ns to the namespace we need.
                    ns = fromQNameToURI(value, el);
                    value = localName(value);
                    el.setAttribute("ns", ns);
                    el.replaceContent([new parser_1.Text(value)]);
                }
                const valuePattern = new patterns_1.Value(el.path, value, type, libname, ns, el.documentation);
                // Accessing the value will cause it to be validated.
                // tslint:disable-next-line:no-unused-expression
                valuePattern.value;
                break;
            }
            case "data": {
                // Except is necessarily last.
                const hasExcept = (el.children.length !== 0 &&
                    el.children[el.children.length - 1]
                        .local === "except");
                type = el.mustGetAttribute("type");
                libname = el.mustGetAttribute("datatypeLibrary");
                const lib = datatypes.registry.find(libname);
                if (lib === undefined) {
                    throw new datatypes.ValueValidationError(el.path, [new datatypes.ValueError(`unknown datatype library: ${libname}`)]);
                }
                if (lib.types[type] === undefined) {
                    throw new datatypes.ValueValidationError(el.path, [new datatypes.ValueError(`unknown datatype ${type} in \
${(libname === "") ? "default library" : `library ${libname}`}`)]);
                }
                const params = el.children.slice(0, hasExcept ? el.children.length - 1 : undefined).map((child) => ({
                    name: child.mustGetAttribute("name"),
                    value: child.text,
                }));
                const data = new patterns_1.Data(el.path, type, libname, params);
                // This causes the parameters to be checked. We do not need to do
                // anything with the value.
                // tslint:disable-next-line:no-unused-expression
                data.params;
                break;
            }
            default:
        }
        // tslint:disable-next-line: no-http-string
        if (libname === "http://www.w3.org/2001/XMLSchema-datatypes" &&
            // tslint:disable-next-line:no-non-null-assertion
            warnAboutTheseTypes.includes(type)) {
            this.warnings.push(`WARNING: ${el.path} uses the ${type} type in library ${libname}`);
        }
        for (const child of el.children) {
            if (parser_1.isElement(child)) {
                this.walk(child);
            }
        }
    }
}
exports.DatatypeProcessor = DatatypeProcessor;
//# sourceMappingURL=common.js.map