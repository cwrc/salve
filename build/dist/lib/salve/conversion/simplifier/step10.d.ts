/**
 * Simplification step 10.
 * @author Louis-Dominique Dubeau
 * @license MPL 2.0
 * @copyright 2013, 2014 Mangalam Research Center for Buddhist Languages
 */
import { Element } from "../parser";
/**
 * Implements steps 10 to 13 of the XSL pipeline. Namely:
 *
 * - ``define``, ``oneOrMore``, ``zeroOrMore``, ``optional``, ``list`` and
 *   ``mixed`` elements with more than one child have their children wrapped in
 *   a ``group`` element.
 *
 * - ``element`` elements with more than two children have their children
 *   wrapped in a ``group`` element. (This means more than one child in addition
 *   to the name class which is the 1sts element of ``element`` at this point.)
 *
 * - ``except`` elements with more than one child have their children wrapped in
 *   a ``group`` element.
 *
 * - ``attribute`` elements with only one child (only a ``name`` element) get a
 *   ``<text/>`` child.
 *
 * - ``choice``, ``group`` and ``interleave`` elements with only one child are
 *   replaced by their single child.
 *
 * - ``choice``, ``group`` and ``interleave`` elements with more than 2 children
 *   have their first 2 children wrapped in an element of the same name, and
 *   this is repeated until the top level element contains only two
 *   children. (This transformation applies to elements that were part of the
 *   input and those elements created by the transformations above.)
 *
 * - ``mixed`` elements are converted to ``interleave`` elements containing the
 *    single child of ``mixed``, and ``<text/>``.
 *
 * - ``optional`` elements are converted to ``choice`` elements containing the
 *   single child of ``optional``, and ``<empty/>``.
 *
 * - ``zeroOrMore`` elements are converted to ``choice`` elements. The single
 *   child of the original ``zeroOrMore`` element is wrapped in a ``oneOrMore``
 *   element, and ``<empty/>`` is added to the ``choice`` element.
 *
 * @param el The tree to process. It is modified in-place.
 *
 * @param check Whether to perform constraint checks.
 *
 * @returns The new root of the tree.
 */
export declare function step10(el: Element, check: boolean): Element;
