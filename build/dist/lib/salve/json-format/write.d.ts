/**
 * This module contains classes for writing salve's internal schema format.
 *
 * @author Louis-Dominique Dubeau
 * @license MPL 2.0
 * @copyright Mangalam Research Center for Buddhist Languages
 */
import { Element } from "../conversion";
export declare function writeTreeToJSON(tree: Element, formatVersion: number, includePaths?: boolean, verbose?: boolean, rename?: boolean): string;
