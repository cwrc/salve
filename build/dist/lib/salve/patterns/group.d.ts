import { InternalWalker, TwoSubpatterns } from "./base";
/**
 * A pattern for ``<group>``.
 */
export declare class Group extends TwoSubpatterns {
    protected _computeHasEmptyPattern(): boolean;
    newWalker(): InternalWalker;
}
