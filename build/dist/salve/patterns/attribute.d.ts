import { ConcreteName } from "../name_patterns";
import { InternalWalker, Pattern } from "./base";
import { Define } from "./define";
/**
 * A pattern for attributes.
 */
export declare class Attribute extends Pattern {
    readonly name: ConcreteName;
    readonly pat: Pattern;
    private readonly kind;
    /**
     * @param xmlPath This is a string which uniquely identifies the
     * element from the simplified RNG tree. Used in debugging.
     *
     * @param name The qualified name of the attribute.
     *
     * @param pat The pattern contained by this one.
     */
    constructor(xmlPath: string, name: ConcreteName, pat: Pattern);
    _prepare(definitions: Map<string, Define>, namespaces: Set<string>): void;
    hasAttrs(): boolean;
    hasEmptyPattern(): boolean;
    newWalker(): InternalWalker;
}
