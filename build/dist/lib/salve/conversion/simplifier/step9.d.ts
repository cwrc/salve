/**
 * Simplification step 9.
 * @author Louis-Dominique Dubeau
 * @license MPL 2.0
 * @copyright 2013, 2014 Mangalam Research Center for Buddhist Languages
 */
import { Element } from "../parser";
/**
 * Implements step 9 of the XSL pipeline. Namely:
 *
 * - ``div`` elements are replaced with their children.
 *
 * @param el The tree to process. It is modified in-place.
 *
 * @returns The new root of the tree.
 */
export declare function step9(el: Element): Element;
