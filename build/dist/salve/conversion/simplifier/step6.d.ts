/**
 * Simplification step 6.
 * @author Louis-Dominique Dubeau
 * @license MPL 2.0
 * @copyright 2013, 2014 Mangalam Research Center for Buddhist Languages
 */
import { Element } from "../parser";
/**
 * Implements steps 6, 7 and 8 of the XSL pipeline. Namely:
 *
 * - ``@name`` on ``element`` or ``attribute`` elements is converted to a
 *   ``name`` element.
 *
 * - If a ``name`` element is created for an ``attribute`` element which does
 *   not have an ``@ns``, the ``name`` element has ``@ns=""``.
 *
 * - Any ``name``, ``nsName`` and ``value`` element that does not have an
 *   ``@ns`` gets an ``@ns`` from the closest ancestor with such a value, or the
 *   empty string if there is no such ancestor.
 *
 * - ``@ns`` is removed from all elements except those in the previous point.
 *
 * - When a ``name`` element contains a QName with a prefix, the prefix is
 *   removed from the QName, and a ``@ns`` is added to the ``name`` by resolving
 *   the prefix against the namespaces in effect in the XML file. (We're talking
 *   here about resolving the prefix against the prefixes declared by
 *   ``xmlns:...``. Note that the default namespace set through ``xmlns``
 *   *never* participates in the resolution performed here.)
 *
 * @param el The tree to process. It is modified in-place.
 *
 * @returns The new root of the tree.
 */
export declare function step6(el: Element): Element;
