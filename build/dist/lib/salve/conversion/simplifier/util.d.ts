/**
 * Utilities for simplification support for trees produced by the parser module.
 * @author Louis-Dominique Dubeau
 * @license MPL 2.0
 * @copyright 2013, 2014 Mangalam Research Center for Buddhist Languages
 */
import { Element } from "../parser";
export declare const RELAXNG_URI = "http://relaxng.org/ns/structure/1.0";
export declare const ANNOS_URI = "http://relaxng.org/ns/compatibility/annotations/1.0";
export declare const XHTML_URI = "http://www.w3.org/1999/xhtml";
export declare function findChildrenByLocalName(el: Element, name: string): Element[];
export declare function findDescendantsByLocalName(el: Element, name: string): Element[];
export declare function _findDescendantsByLocalName(el: Element, name: string, ret: Element[]): void;
export declare function findMultiDescendantsByLocalName(el: Element, names: string[]): Record<string, Element[]>;
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
export declare function findMultiNames(el: Element, names: string[]): Record<string, Element[]>;
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
export declare function indexBy<T>(arr: T[], makeKey: (x: T) => string): Map<string, T>;
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
export declare function groupBy<T>(arr: T[], makeKey: (x: T) => string): Map<string, T[]>;
/**
 * Get the value of the @name attribute.
 *
 * @param el The element to process.
 */
export declare function getName(el: Element): string;
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
export declare function removeUnreferencedDefs(el: Element, seen: Set<string>): void;
