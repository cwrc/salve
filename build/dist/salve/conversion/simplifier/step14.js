"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.step14 = void 0;
/**
 * Simplification step 14.
 * @author Louis-Dominique Dubeau
 * @license MPL 2.0
 * @copyright 2013, 2014 Mangalam Research Center for Buddhist Languages
 */
const parser_1 = require("../parser");
const schema_validation_1 = require("../schema-validation");
const util_1 = require("./util");
function makeName(el) {
    let ret = el.local;
    if (ret === "def") {
        ret += `@name="${util_1.getName(el)}"`;
    }
    return ret;
}
function combine(els) {
    if (els.length < 2) {
        // There's nothing to actually *combine*.
        if (els.length > 0) {
            // Delete the useless combine attribute that may be present.
            els[0].removeAttribute("combine");
        }
        return;
    }
    let undefinedCombine = false;
    let combineAs;
    for (const el of els) {
        const combineAttr = el.getAttribute("combine");
        if (combineAttr === undefined) {
            if (undefinedCombine) {
                throw new schema_validation_1.SchemaValidationError(`more than one ${makeName(el)} without @combine`);
            }
            undefinedCombine = true;
        }
        else {
            if (combineAs === undefined) {
                combineAs = combineAttr;
            }
            else if (combineAs !== combineAttr) {
                throw new schema_validation_1.SchemaValidationError(`inconsistent values on ${makeName(el)}/@combine`);
            }
        }
    }
    if (combineAs === undefined) {
        throw new Error("no combination value found");
    }
    let wrapper = parser_1.Element.makeElement(combineAs, []);
    const [first, second, ...rest] = els;
    wrapper.grabChildren(first);
    wrapper.grabChildren(second);
    second.parent.removeChild(second);
    for (const el of rest) {
        const newWrapper = parser_1.Element.makeElement(combineAs, [wrapper]);
        newWrapper.grabChildren(el);
        el.parent.removeChild(el);
        wrapper = newWrapper;
    }
    first.appendChild(wrapper);
    first.removeAttribute("combine");
}
/**
 * Implements step 14 of the XSL pipeline. Namely, in each grammar:
 *
 * - ``start`` elements are combined.
 *
 * - ``define`` elements with the same name are combined.
 *
 * The scope of the transformation performed for a grammar include all ``start``
 * and ``define`` elements, *excluding* those that may be in a descendant
 * ``grammar`` element.
 *
 * @param el The tree to process. It is modified in-place.
 *
 * @returns The new root of the tree.
 */
function step14(el) {
    const grammars = util_1.findDescendantsByLocalName(el, "grammar");
    if (el.local === "grammar") {
        grammars.unshift(el);
    }
    for (const grammar of grammars) {
        combine(util_1.findChildrenByLocalName(grammar, "start"));
        const defs = util_1.findChildrenByLocalName(grammar, "define");
        const grouped = util_1.groupBy(defs, util_1.getName);
        for (const group of grouped.values()) {
            combine(group);
        }
    }
    return el;
}
exports.step14 = step14;
//# sourceMappingURL=step14.js.map