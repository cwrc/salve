import { InternalWalker, OneSubpattern } from "./base";
import { Define } from "./define";
/**
 * List pattern.
 */
export declare class List extends OneSubpattern {
    _prepare(definitions: Map<string, Define>, namespaces: Set<string>): void;
    hasAttrs(): boolean;
    newWalker(): InternalWalker;
}
