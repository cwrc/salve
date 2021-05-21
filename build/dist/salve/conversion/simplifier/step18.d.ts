/**
 * Simplification step 18.
 * @author Louis-Dominique Dubeau
 * @license MPL 2.0
 * @copyright 2013, 2014 Mangalam Research Center for Buddhist Languages
 */
import { Element } from "../parser";
/**
 * Implements step 18 of the XSL pipeline. Namely:
 *
 * - All ``group``, ``interleave`` and ``choice`` elements with two ``empty``
 *   children are replaced with ``empty``.
 *
 * - All ``group`` and ``interleave`` elements with one ``empty`` child
 *   are transformed into their other child.
 *
 * - All ``choice`` elements with ``empty`` as the second child have their
 *   children swapped.
 *
 * - All ``oneOrMore`` elements with an ``empty`` child are replaced with
 *   ``empty``.
 *
 * These transformations are repeated until they no longer modify the tree. (The
 * way we apply the transformations obviates the need to repeat them.)
 *
 * Note that none of the transformations above remove ``ref`` elements from the
 * schema. So it is not necessary to check for unreferenced ``define``
 * elements. (To ascertain that this is the case, you need to take into account
 * the previous transformations. For instance, ``oneOrMore`` by this stage has
 * only one possible child so replacing ``oneOrMore`` with ``empty`` if it has
 * an ``empty`` child **cannot** remove a ``ref`` element from the tree. Similar
 * reasoning applies to the other transformations.)
 *
 * @param tree The tree to process. It is modified in-place.
 *
 * @returns The new root of the tree.
 */
export declare function step18(tree: Element): Element;
