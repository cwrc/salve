/**
 * Simplification step 1.
 * @author Louis-Dominique Dubeau
 * @license MPL 2.0
 * @copyright 2013, 2014 Mangalam Research Center for Buddhist Languages
 */
import { Element } from "../parser";
export declare type Parser = (filePath: URL) => Promise<Element>;
export declare function resolveURL(base: URL, tail: string): URL;
/**
 * Modify the tree:
 *
 * - All references to external resources (``externalRef`` and ``include``) are
 *   replaced by the contents of the references. It essentially "flattens" a
 *   schema made of group of documents to a single document.
 *
 * - Remove text nodes that contain only white spaces.  Text nodes in the
 *   elements ``param`` and ``value`` are excluded.
 *
 * - Trim the text node in the elements named ``name``.
 *
 * - Also trim the values of the attributes ``name``, ``type`` and ``combine``.
 *
 * Note that step1 also subsumes what was step2 and step3 in the XSLT-based
 * transforms.
 *
 * @param documentBase The base URI of the tree being processed.
 *
 * @param tree The XML tree to process.
 *
 * @param parser A function through which we load and parse XML files.
 *
 * @returns A promise that resolves to the new tree root when processing is
 * done.
 */
export declare function step1(documentBase: URL, tree: Element, parser: Parser): Promise<Element>;
