"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeUnreferencedDefs = exports.getName = exports.groupBy = exports.indexBy = exports.findMultiNames = exports.findMultiDescendantsByLocalName = exports._findDescendantsByLocalName = exports.findDescendantsByLocalName = exports.findChildrenByLocalName = exports.XHTML_URI = exports.ANNOS_URI = exports.RELAXNG_URI = void 0;
/**
 * Utilities for simplification support for trees produced by the parser module.
 * @author Louis-Dominique Dubeau
 * @license MPL 2.0
 * @copyright 2013, 2014 Mangalam Research Center for Buddhist Languages
 */
const parser_1 = require("../parser");
// tslint:disable-next-line:no-http-string
exports.RELAXNG_URI = "http://relaxng.org/ns/structure/1.0";
// tslint:disable-next-line:no-http-string
exports.ANNOS_URI = "http://relaxng.org/ns/compatibility/annotations/1.0";
// tslint:disable-next-line:no-http-string
exports.XHTML_URI = "http://www.w3.org/1999/xhtml";
function findChildrenByLocalName(el, name) {
    return el
        .children
        .filter(child => parser_1.isElement(child) && child.local === name);
}
exports.findChildrenByLocalName = findChildrenByLocalName;
function findDescendantsByLocalName(el, name) {
    const ret = [];
    _findDescendantsByLocalName(el, name, ret);
    return ret;
}
exports.findDescendantsByLocalName = findDescendantsByLocalName;
function _findDescendantsByLocalName(el, name, ret) {
    for (const child of el.children) {
        if (!parser_1.isElement(child)) {
            continue;
        }
        if (child.local === name) {
            ret.push(child);
        }
        _findDescendantsByLocalName(child, name, ret);
    }
}
exports._findDescendantsByLocalName = _findDescendantsByLocalName;
function findMultiDescendantsByLocalName(el, names) {
    const ret = Object.create(null);
    for (const name of names) {
        ret[name] = [];
    }
    _findMultiDescendantsByLocalName(el, names, ret);
    return ret;
}
exports.findMultiDescendantsByLocalName = findMultiDescendantsByLocalName;
function _findMultiDescendantsByLocalName(el, names, ret) {
    for (const child of el.children) {
        if (!parser_1.isElement(child)) {
            continue;
        }
        const name = child.local;
        if (names.includes(name)) {
            ret[name].push(child);
        }
        _findMultiDescendantsByLocalName(child, names, ret);
    }
}
/**
 * This is a specialized version of [[findMultiDescendantsByLocalName]] that
 * searches through the first child element and its descendants. ``element`` and
 * ``attribute`` elements during simplification get their name class recorded as
 * their first child element.
 *
 * @param el The element in which to search.
 *
 * @param names The name class elements to look for.
 *
 * @returns A map of name to element list.
 */
function findMultiNames(el, names) {
    const nameClass = el.children[0];
    const descendants = findMultiDescendantsByLocalName(nameClass, names);
    const name = nameClass.local;
    if (names.includes(name)) {
        if (!(name in descendants)) {
            descendants[name] = [nameClass];
        }
        else {
            descendants[name].unshift(nameClass);
        }
    }
    return descendants;
}
exports.findMultiNames = findMultiNames;
/**
 * Index the elements of ``arr`` by the keys obtained through calling
 * ``makeKey``. If two elements resolve to the same key, the later element
 * overwrites the earlier.
 *
 * @param arr The array to index.
 *
 * @param makeKey A function that takes an array element and makes a key by
 * which this element will be indexed.
 *
 * @return The indexed elements.
 */
function indexBy(arr, makeKey) {
    const ret = new Map();
    for (const x of arr) {
        ret.set(makeKey(x), x);
    }
    return ret;
}
exports.indexBy = indexBy;
/**
 * Group the elements of ``arr`` by the keys obtained through calling
 * ``makeKey``. Contrarily to [[indexBy]], this function allows for multiple
 * elements with the same key to coexist in the results because the resulting
 * object maps keys to arrays of elements rather than keys to single elements.
 *
 * @param arr The array to index.
 *
 * @param makeKey A function that takes an array element and makes a key by
 * which this element will be indexed.
 *
 * @return The grouped elements.
 */
function groupBy(arr, makeKey) {
    const ret = new Map();
    for (const x of arr) {
        const key = makeKey(x);
        let list = ret.get(key);
        if (list === undefined) {
            list = [];
            ret.set(key, list);
        }
        list.push(x);
    }
    return ret;
}
exports.groupBy = groupBy;
/**
 * Get the value of the @name attribute.
 *
 * @param el The element to process.
 */
function getName(el) {
    return el.mustGetAttribute("name");
}
exports.getName = getName;
/**
 * Removes unreferenced ``define`` elements from a grammar.
 *
 * **Important**: this is a very ad-hoc function, not meant for general
 * consumption. For one thing, this function works only if called with ``el``
 * pointing to a top-level ``grammar`` element **after** all ``grammar``
 * elements have been reduced to a single ``grammar``, all ``define`` elements
 * moved to that single ``grammar``, and ``grammar`` contains ``start`` as the
 * first element, and the rest of the children are all ``define`` elements.
 *
 * This function does no check these constraints!!! You must call it from a
 * stage where these constraints hold.
 *
 * This function does not guard against misuse. It must be called from steps
 * that execute after the above assumption holds.
 *
 * @param el The element that contains the ``define`` elements.
 *
 * @param seen A set of ``define`` names. If the name is in the set, then there
 * was a reference to the name, and the ``define`` is kept. Otherwise, the
 * ``define`` is removed.
 */
function removeUnreferencedDefs(el, seen) {
    const children = el.children;
    for (let ix = 1; ix < children.length; ++ix) {
        if (seen.has(children[ix].mustGetAttribute("name"))) {
            continue;
        }
        el.removeChildAt(ix);
        --ix;
    }
}
exports.removeUnreferencedDefs = removeUnreferencedDefs;
//# sourceMappingURL=util.js.map