/**
 * Simplification step 15.
 * @author Louis-Dominique Dubeau
 * @license MPL 2.0
 * @copyright 2013, 2014 Mangalam Research Center for Buddhist Languages
 */
import { Element } from "../parser";
/**
 * Implements step 15 of the XSL pipeline. Namely:
 *
 * - Rename each ``define`` element so as to make it unique across the
 *   schema. We do this by giving a unique id to each ``grammar`` element, which
 *   is the number of ``grammar`` elements before it, in document reading order,
 *   plus 1. Then we add to ``define/@name`` the string ``-gr-{id}`` where
 *   ``{id}`` is the grammar's id of the grammar to which the ``define``
 *   belongs. NOTE: this pattern was selected to avoid a clash with step 16,
 *   which creates new ``define`` elements.
 *
 * - Rename each ``ref`` and ``parentRef`` to preserve the references the
 *   establish to ``define`` elements.
 *
 * - Create a top level ``grammar/start`` structure, if necessary.
 *
 * - Move all ``define`` elements to the top ``grammar``.
 *
 * - Rename all ``parentRef`` elements to ``ref``.
 *
 * - Replace all ``grammar/start`` elements with the expression contained
 *   therein, except for the top level ``grammar/start``.
 *
 * @param el The tree to process. It is modified in-place.
 *
 * @returns The new tree root.
 */
export declare function step15(el: Element): Element;
