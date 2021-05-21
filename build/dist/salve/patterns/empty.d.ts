/**
 * Pattern and walker for RNG's ``empty`` elements.
 * @author Louis-Dominique Dubeau
 * @license MPL 2.0
 * @copyright Mangalam Research Center for Buddhist Languages
 */
import { InternalWalker, Pattern } from "./base";
/**
 * Pattern for ``<empty/>``.
 */
export declare class Empty extends Pattern {
    hasEmptyPattern(): boolean;
    newWalker(): InternalWalker;
}
