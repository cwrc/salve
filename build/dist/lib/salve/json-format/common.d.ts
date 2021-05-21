/**
 * This module contains constants common to both reading and writing schemas in
 * the JSON format internal to salve.
 *
 * @author Louis-Dominique Dubeau
 * @license MPL 2.0
 * @copyright Mangalam Research Center for Buddhist Languages
 */
import { AnyName, BasePattern, Name, NameChoice, NsName } from "../patterns";
export declare type NamePattern = Name | NameChoice | NsName | AnyName;
export declare type PatternCtor = new (...args: any[]) => (BasePattern | NamePattern);
export declare type Ctors = PatternCtor | typeof Array;
export declare const codeToConstructor: Ctors[];
export declare const nameToCode: Record<string, number>;
export declare const OPTION_NO_PATHS = 1;
