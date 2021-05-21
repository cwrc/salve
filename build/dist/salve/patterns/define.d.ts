import { OneSubpattern } from "./base";
import { Element } from "./element";
/**
 * A pattern for ``<define>``.
 */
export declare class Define extends OneSubpattern<Element> {
    readonly name: string;
    /**
     * @param xmlPath This is a string which uniquely identifies the
     * element from the simplified RNG tree. Used in debugging.
     *
     * @param name The name of the definition.
     *
     * @param pat The pattern contained by this one.
     */
    constructor(xmlPath: string, name: string, pat: Element);
}
