"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.step10 = void 0;
/**
 * Simplification step 10.
 * @author Louis-Dominique Dubeau
 * @license MPL 2.0
 * @copyright 2013, 2014 Mangalam Research Center for Buddhist Languages
 */
const parser_1 = require("../parser");
const schema_validation_1 = require("../schema-validation");
const util_1 = require("./util");
// We do not do the checks on ``data`` and ``value`` here. They are done
// later. The upshot is that fragments of the schema that may be removed in
// later steps are not checked here.
function checkNames(el) {
    if (el.local === "except") {
        // parent cannot be undefined at this point.
        // tslint:disable-next-line:no-non-null-assertion
        switch (el.parent.local) {
            case "anyName":
                if (util_1.findDescendantsByLocalName(el, "anyName").length !== 0) {
                    throw new schema_validation_1.SchemaValidationError("an except in anyName has an anyName descendant");
                }
                break;
            case "nsName": {
                const { anyName: anyNames, nsName: nsNames } = util_1.findMultiDescendantsByLocalName(el, ["anyName", "nsName"]);
                if (anyNames.length !== 0) {
                    throw new schema_validation_1.SchemaValidationError("an except in nsName has an anyName descendant");
                }
                if (nsNames.length !== 0) {
                    throw new schema_validation_1.SchemaValidationError("an except in nsName has an nsName descendant");
                }
                break;
            }
            default:
        }
    }
    for (const child of el.children) {
        if (!parser_1.isElement(child)) {
            continue;
        }
        checkNames(child);
    }
}
// tslint:disable-next-line:max-func-body-length
function walk(check, el) {
    const { local, children } = el;
    switch (local) {
        case "choice":
        case "group":
        case "interleave":
            if (children.length === 1) {
                const replaceWith = children[0];
                if (el.parent !== undefined) {
                    el.parent.replaceChildWith(el, replaceWith);
                }
                else {
                    el.removeChildAt(0); // This removes replaceWith from el.
                    // By this stage in the process, this is the only attribute that need
                    // be carried over.
                    const xmlns = el.getAttribute("xmlns");
                    if (xmlns !== undefined) {
                        replaceWith.setXMLNS(xmlns);
                    }
                }
                return replaceWith;
            }
            else {
                while (children.length > 2) {
                    el.prependChild(parser_1.Element.makeElement(local, [children[0], children[1]]));
                }
            }
            break;
        case "element":
            if (children.length > 2) {
                el.appendChild(parser_1.Element.makeElement("group", children.slice(1)));
            }
            if (check) {
                checkNames(children[0]);
            }
            break;
        case "attribute":
            if (children.length === 1) {
                el.appendChild(parser_1.Element.makeElement("text", []));
            }
            if (check) {
                checkNames(children[0]);
                for (const attrName of util_1.findMultiNames(el, ["name"]).name) {
                    switch (attrName.getAttribute("ns")) {
                        case "":
                            if (attrName.text === "xmlns") {
                                throw new schema_validation_1.SchemaValidationError("found attribute with name xmlns outside all namespaces");
                            }
                            break;
                        // tslint:disable-next-line:no-http-string
                        case "http://www.w3.org/2000/xmlns":
                            throw new schema_validation_1.SchemaValidationError("found attribute in namespace http://www.w3.org/2000/xmlns");
                        default:
                    }
                }
            }
            break;
        case "define":
        case "oneOrMore":
        case "list":
            if (children.length > 1) {
                const group = parser_1.Element.makeElement("group", []);
                group.grabChildren(el);
                el.appendChild(group);
            }
            break;
        case "zeroOrMore": {
            el.local = "choice";
            const oneOrMore = parser_1.Element.makeElement("oneOrMore", []);
            if (children.length > 1) {
                const group = parser_1.Element.makeElement("group", []);
                group.grabChildren(el);
                oneOrMore.appendChild(group);
            }
            else {
                oneOrMore.grabChildren(el);
            }
            el.appendChildren([oneOrMore, parser_1.Element.makeElement("empty", [])]);
            break;
        }
        case "optional":
            el.local = "choice";
            if (children.length > 1) {
                const group = parser_1.Element.makeElement("group", []);
                group.grabChildren(el);
                el.appendChild(group);
            }
            el.appendChild(parser_1.Element.makeElement("empty", []));
            break;
        case "mixed":
            el.local = "interleave";
            if (children.length > 1) {
                const group = parser_1.Element.makeElement("group", []);
                group.grabChildren(el);
                el.appendChild(group);
            }
            el.appendChild(parser_1.Element.makeElement("text", []));
            break;
        case "except":
            if (children.length > 1) {
                const choice = parser_1.Element.makeElement("choice", []);
                choice.grabChildren(el);
                el.appendChild(choice);
            }
            break;
        default:
    }
    // tslint:disable-next-line:prefer-for-of
    for (let ix = 0; ix < children.length; ++ix) {
        const child = children[ix];
        if (!parser_1.isElement(child)) {
            continue;
        }
        let replaced = walk(check, child);
        while (replaced !== null) {
            replaced = walk(check, replaced);
        }
    }
    return null;
}
/**
 * Implements steps 10 to 13 of the XSL pipeline. Namely:
 *
 * - ``define``, ``oneOrMore``, ``zeroOrMore``, ``optional``, ``list`` and
 *   ``mixed`` elements with more than one child have their children wrapped in
 *   a ``group`` element.
 *
 * - ``element`` elements with more than two children have their children
 *   wrapped in a ``group`` element. (This means more than one child in addition
 *   to the name class which is the 1sts element of ``element`` at this point.)
 *
 * - ``except`` elements with more than one child have their children wrapped in
 *   a ``group`` element.
 *
 * - ``attribute`` elements with only one child (only a ``name`` element) get a
 *   ``<text/>`` child.
 *
 * - ``choice``, ``group`` and ``interleave`` elements with only one child are
 *   replaced by their single child.
 *
 * - ``choice``, ``group`` and ``interleave`` elements with more than 2 children
 *   have their first 2 children wrapped in an element of the same name, and
 *   this is repeated until the top level element contains only two
 *   children. (This transformation applies to elements that were part of the
 *   input and those elements created by the transformations above.)
 *
 * - ``mixed`` elements are converted to ``interleave`` elements containing the
 *    single child of ``mixed``, and ``<text/>``.
 *
 * - ``optional`` elements are converted to ``choice`` elements containing the
 *   single child of ``optional``, and ``<empty/>``.
 *
 * - ``zeroOrMore`` elements are converted to ``choice`` elements. The single
 *   child of the original ``zeroOrMore`` element is wrapped in a ``oneOrMore``
 *   element, and ``<empty/>`` is added to the ``choice`` element.
 *
 * @param el The tree to process. It is modified in-place.
 *
 * @param check Whether to perform constraint checks.
 *
 * @returns The new root of the tree.
 */
function step10(el, check) {
    let replaced = walk(check, el);
    while (replaced !== null) {
        el = replaced;
        replaced = walk(check, el);
    }
    return el;
}
exports.step10 = step10;
//# sourceMappingURL=step10.js.map