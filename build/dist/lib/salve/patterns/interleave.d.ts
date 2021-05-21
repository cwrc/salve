import { InternalWalker, TwoSubpatterns } from "./base";
/**
 * A pattern for ``<interleave>``.
 */
export declare class Interleave extends TwoSubpatterns {
    protected _computeHasEmptyPattern(): boolean;
    newWalker(): InternalWalker;
}
