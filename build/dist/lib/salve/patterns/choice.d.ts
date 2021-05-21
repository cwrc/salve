import { InternalWalker, Pattern, TwoSubpatterns } from "./base";
/**
 * A pattern for ``<choice>``.
 */
export declare class Choice extends TwoSubpatterns {
    private readonly optional;
    constructor(xmlPath: string, patA: Pattern, patB: Pattern);
    protected _computeHasEmptyPattern(): boolean;
    newWalker(): InternalWalker;
}
