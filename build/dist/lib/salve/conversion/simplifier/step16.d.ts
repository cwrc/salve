/**
 * Simplification step 16.
 * @author Louis-Dominique Dubeau
 * @license MPL 2.0
 * @copyright 2013, 2014 Mangalam Research Center for Buddhist Languages
 */
import { Element } from "../parser";
/**
 * Implements step 16 of the XSL pipeline. Namely:
 *
 * - All ``element`` elements that are not wrapped in a ``define`` element are
 *   wrapped in new ``define`` elements. And a ``ref`` element takes the
 *   place of the original ``element`` and refers to the new ``define``.
 *
 * - ``ref`` elements that reference a ``define`` which does not contain an
 *   ``element`` element as the top element are replaced by the contents of the
 *   ``define`` element they reference.
 *
 * - Remove ``define`` elements that are not referenced.
 *
 * @param tree The tree to process. It is modified in-place.
 *
 * @returns The new root of the tree.
 */
export declare function step16(tree: Element): Element;
