/**
 * Simplification step 17.
 * @author Louis-Dominique Dubeau
 * @license MPL 2.0
 * @copyright 2013, 2014 Mangalam Research Center for Buddhist Languages
 */
import { Element } from "../parser";
/**
 * Implements step 17 of the XSL pipeline. Namely:
 *
 * - All ``attribute``, ``list``, ``group``, ``interleave``, and ``oneOrMore``
 *   elements having a ``notAllowed`` child are replaced with a ``notAllowed``
 *   element.
 *
 * - A ``choice`` element with two ``notAllowed`` children is replaced with a
 *   ``notAllowed`` element.
 *
 * - A ``choice`` element with a single ``notAllowed`` child is replaced with
 *   the other child.
 *
 * - An ``except`` element with a ``notAllowed`` child is removed.
 *
 * These transformations are repeated until they no longer modify the tree. (The
 * way we apply the transformations obviates the need to repeat them.)
 *
 * Any ``define`` element that becomes unreachable after transformation is
 * removed.
 *
 * @param tree The tree to process. It is modified in-place.
 *
 * @returns The new root of the tree.
 */
export declare function step17(tree: Element): Element;
