import { EnterStartTagEvent } from "../events";
import { ConcreteName } from "../name_patterns";
import { EndResult, EventSet, InternalFireEventResult, InternalWalker, Pattern } from "./base";
import { Define } from "./define";
import { Element } from "./element";
/**
 * A pattern for RNG references.
 */
export declare class Ref extends Pattern {
    readonly name: string;
    private resolvesTo?;
    /**
     *
     * @param xmlPath This is a string which uniquely identifies the
     * element from the simplified RNG tree. Used in debugging.
     *
     * @param name The reference name.
     */
    constructor(xmlPath: string, name: string);
    _prepare(definitions: Map<string, Define>): void;
    hasEmptyPattern(): boolean;
    get element(): Element;
    newWalker(): InternalWalker;
}
export declare class RefWalker implements InternalWalker {
    protected readonly el: Ref;
    readonly element: Element;
    private readonly startName;
    private readonly startTagEvent;
    canEndAttribute: boolean;
    canEnd: boolean;
    /**
     * @param el The pattern for which this walker was constructed.
     */
    constructor(el: Ref, element: Element, startName: ConcreteName, startTagEvent: EnterStartTagEvent, canEndAttribute: boolean, canEnd: boolean);
    clone(): this;
    possible(): EventSet;
    possibleAttributes(): EventSet;
    fireEvent(name: string, params: string[]): InternalFireEventResult;
    end(): EndResult;
    endAttributes(): EndResult;
}
