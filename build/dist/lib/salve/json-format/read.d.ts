/**
 * This module contains utilities for reading salve's internal schema format.
 *
 * @author Louis-Dominique Dubeau
 * @license MPL 2.0
 * @copyright Mangalam Research Center for Buddhist Languages
 */
import { Grammar } from "../patterns";
/**
 * Constructs a tree of patterns from the data structure produced by running
 * ``salve-convert`` on an RNG file.
 *
 * @param code The JSON representation (a string) or the deserialized JSON.
 *
 * @throws {Error} When the version of the data is not supported.
 *
 * @returns The tree.
 */
export declare function readTreeFromJSON(code: string | {}): Grammar;
