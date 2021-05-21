import { ConcreteName, Name } from "../name_patterns";
import { NameResolver } from "../name_resolver";
import { BasePattern, InternalFireEventResult, InternalWalker, Pattern } from "./base";
import { Define } from "./define";
export interface Initializable {
    initWithAttributes(attrs: string[], nameResolver: NameResolver): InternalFireEventResult;
}
/**
 * A pattern for elements.
 */
export declare class Element extends BasePattern {
    readonly name: ConcreteName;
    readonly pat: Pattern;
    readonly notAllowed: boolean;
    /**
     * @param xmlPath This is a string which uniquely identifies the
     * element from the simplified RNG tree. Used in debugging.
     *
     * @param name The qualified name of the element.
     *
     * @param pat The pattern contained by this one.
     */
    constructor(xmlPath: string, name: ConcreteName, pat: Pattern);
    newWalker(boundName: Name): InternalWalker & Initializable;
    hasAttrs(): boolean;
    hasEmptyPattern(): boolean;
    _prepare(definitions: Map<string, Define>, namespaces: Set<string>): void;
}
