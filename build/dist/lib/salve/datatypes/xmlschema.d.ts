/**
 * Implementation of the XMLSchema datatypes.
 * @author Louis-Dominique Dubeau
 * @license MPL 2.0
 * @copyright Mangalam Research Center for Buddhist Languages
 */
import { TypeLibrary } from "./library";
export interface ConvertedPattern {
    rng: string;
    internal: RegExp;
}
/**
 * The XML Schema datatype library.
 */
export declare const xmlschema: TypeLibrary;
