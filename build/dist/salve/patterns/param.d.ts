/**
 * Pattern for RNG's ``param`` element.
 * @author Louis-Dominique Dubeau
 * @license MPL 2.0
 * @copyright Mangalam Research Center for Buddhist Languages
 */
import { Pattern } from "./base";
/**
 * This is a defunct pattern. During the processing of the RNG file all
 * ``param`` elements are converted into parameters to [["patterns/data".Data]]
 * so we never end up with a converted file that contains an instance of this
 * class.
 */
export declare class Param extends Pattern {
    constructor(xmlPath: string);
}
