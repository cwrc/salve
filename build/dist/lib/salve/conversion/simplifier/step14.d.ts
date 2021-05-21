/**
 * Simplification step 14.
 * @author Louis-Dominique Dubeau
 * @license MPL 2.0
 * @copyright 2013, 2014 Mangalam Research Center for Buddhist Languages
 */
import { Element } from "../parser";
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
export declare function step14(el: Element): Element;
