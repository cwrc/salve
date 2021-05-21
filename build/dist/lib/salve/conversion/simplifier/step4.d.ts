/**
 * Simplification step 4.
 * @author Louis-Dominique Dubeau
 * @license MPL 2.0
 * @copyright 2013, 2014 Mangalam Research Center for Buddhist Languages
 */
import { Element } from "../parser";
/**
 * Implements steps 4 and 5 of the XSL pipeline. Namely:
 *
 * - ``data`` and ``value`` elements that don't have ``@datatypeLibrary`` get
 *    one from the closest ancestor with such a value.
 *
 * - ``value`` elements without a ``@type`` get ``@type`` set to ``"token"`` and
 *    ``@datatypeLibrary`` set to the empty string. (This is irrespective of the
 *    1st transformation above.)
 *
 * - All elements other than ``data`` and ``value`` lose their
 *   ``@datatypeLibrary`` attribute.
 *
 * Note that this step currently does not perform any URI encoding required by
 * the Relax NG spec. As we speak, salve does not support loading arbitrary type
 * libraries, and the supported URIs do not need special encoding.
 *
 * Even in the general case, it is unclear that we need to perform the encoding
 * transformation *here*. The URIs could be passed as-are to a library that
 * performs the encoding before fetching.
 *
 * @param el The tree to process. It is modified in-place.
 *
 * @returns The new root of the tree.
 */
export declare function step4(el: Element): Element;
