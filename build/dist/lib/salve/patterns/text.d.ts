import { InternalWalker, Pattern } from "./base";
/**
 * Pattern for ``<text/>``.
 */
export declare class Text extends Pattern {
    hasEmptyPattern(): boolean;
    newWalker(): InternalWalker;
}
