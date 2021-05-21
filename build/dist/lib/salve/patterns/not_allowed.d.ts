/**
 * Pattern and walker for RNG's ``notAllowed`` elements.
 * @author Louis-Dominique Dubeau
 * @license MPL 2.0
 * @copyright Mangalam Research Center for Buddhist Languages
 */
import { EndResult, EventSet, InternalFireEventResult, InternalWalker, Pattern } from "./base";
/**
 * Pattern for ``<notAllowed/>``.
 */
export declare class NotAllowed extends Pattern {
    newWalker(): NotAllowedWalker;
}
/**
 * Walker for [[NotAllowed]];
 */
export declare class NotAllowedWalker implements InternalWalker {
    protected readonly el: NotAllowed;
    canEnd: boolean;
    canEndAttribute: boolean;
    /**
     * @param el The pattern for which this walker was created.
     */
    constructor(el: NotAllowed);
    clone(): this;
    possible(): EventSet;
    possibleAttributes(): EventSet;
    fireEvent(): InternalFireEventResult;
    end(): EndResult;
    endAttributes(): EndResult;
}
