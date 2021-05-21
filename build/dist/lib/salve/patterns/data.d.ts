/**
 * Pattern and walker for RNG's ``data`` elements.
 * @author Louis-Dominique Dubeau
 * @license MPL 2.0
 * @copyright Mangalam Research Center for Buddhist Languages
 */
import { Datatype, ParsedParams, RawParameter } from "../datatypes";
import { InternalWalker, Pattern } from "./base";
/**
 * Data pattern.
 */
export declare class Data extends Pattern {
    readonly type: string;
    readonly datatypeLibrary: string;
    readonly except?: Pattern | undefined;
    readonly datatype: Datatype;
    readonly rngParams?: RawParameter[];
    private _params?;
    private _allowsEmptyContent?;
    /**
     *
     * @param xmlPath This is a string which uniquely identifies the
     * element from the simplified RNG tree. Used in debugging.
     *
     * @param type The type of value.
     *
     * @param datatypeLibrary The URI of the datatype library to use.
     *
     * @param params The parameters from the RNG file.
     *
     * @param except The exception pattern.
     */
    constructor(xmlPath: string, type?: string, datatypeLibrary?: string, params?: RawParameter[], except?: Pattern | undefined);
    get params(): ParsedParams;
    get allowsEmptyContent(): boolean;
    newWalker(): InternalWalker;
}
