/**
 * This module contains the logic for converting a simplified schema to a
 * pattern.
 *
 * @author Louis-Dominique Dubeau
 * @license MPL 2.0
 * @copyright Mangalam Research Center for Buddhist Languages
 */
import { Grammar } from "../patterns";
import { Element } from "./parser";
export declare function makePatternFromSimplifiedSchema(tree: Element): Grammar;
