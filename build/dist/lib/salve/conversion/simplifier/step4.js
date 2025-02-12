"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.step4 = void 0;
/**
 * Simplification step 4.
 * @author Louis-Dominique Dubeau
 * @license MPL 2.0
 * @copyright 2013, 2014 Mangalam Research Center for Buddhist Languages
 */
const parser_1 = require("../parser");
const schema_validation_1 = require("../schema-validation");
function walk(el, parentLibrary) {
    const local = el.local;
    const currentLibrary = el.getAttribute("datatypeLibrary");
    if (currentLibrary !== undefined && currentLibrary !== "") {
        let url;
        try {
            // tslint:disable-next-line:no-unused-expression
            url = new URL(currentLibrary);
        }
        catch (e) {
            throw new schema_validation_1.SchemaValidationError(`invalid datatypeLibrary URL: ${currentLibrary}`);
        }
        // We have to test for "#" a the end of href because that's also an
        // error per Relax NG but the hash will still be empty. :-/
        if (url.hash !== "" || url.href.endsWith("#")) {
            throw new schema_validation_1.SchemaValidationError(`datatypeLibrary URL must not have a fragment identifier: \
${currentLibrary}`);
        }
    }
    if (local === "data" || local === "value") {
        // ``value`` elements without a ``@type`` get ``@type`` set to ``"token"``
        // and ``@datatypeLibrary`` set to the empty string.
        if (local === "value" && el.getAttribute("type") === undefined) {
            el.setAttribute("datatypeLibrary", "");
            el.setAttribute("type", "token");
        }
        else if (currentLibrary === undefined) {
            // Inherit from parent.
            el.setAttribute("datatypeLibrary", parentLibrary);
        }
    }
    else if (currentLibrary !== undefined) {
        // All other elements lose their ``@datatypeLibrary``.
        el.removeAttribute("datatypeLibrary");
    }
    const childLib = currentLibrary !== undefined ? currentLibrary : parentLibrary;
    for (const child of el.children) {
        if (parser_1.isElement(child)) {
            walk(child, childLib);
        }
    }
}
/**
 * Implements steps 4 and 5 of the XSL pipeline. Namely:
 *
 * - ``data`` and ``value`` elements that don't have ``@datatypeLibrary`` get
 *    one from the closest ancestor with such a value.
 *
 * - ``value`` elements without a ``@type`` get ``@type`` set to ``"token"`` and
 *    ``@datatypeLibrary`` set to the empty string. (This is irrespective of the
 *    1st transformation above.)
 *
 * - All elements other than ``data`` and ``value`` lose their
 *   ``@datatypeLibrary`` attribute.
 *
 * Note that this step currently does not perform any URI encoding required by
 * the Relax NG spec. As we speak, salve does not support loading arbitrary type
 * libraries, and the supported URIs do not need special encoding.
 *
 * Even in the general case, it is unclear that we need to perform the encoding
 * transformation *here*. The URIs could be passed as-are to a library that
 * performs the encoding before fetching.
 *
 * @param el The tree to process. It is modified in-place.
 *
 * @returns The new root of the tree.
 */
function step4(el) {
    walk(el, "");
    return el;
}
exports.step4 = step4;
//# sourceMappingURL=step4.js.map