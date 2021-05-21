/**
 * Pattern and walker for RNG's ``list`` elements.
 * @author Louis-Dominique Dubeau
 * @license MPL 2.0
 * @copyright Mangalam Research Center for Buddhist Languages
 */
import { Datatype } from "../datatypes";
import { InternalWalker, Pattern } from "./base";
/**
 * Value pattern.
 */
export declare class Value extends Pattern {
    readonly type: string;
    readonly datatypeLibrary: string;
    readonly ns: string;
    readonly datatype: Datatype;
    readonly rawValue: string;
    readonly documentation: string | undefined;
    private _value;
    /**
     * @param xmlPath This is a string which uniquely identifies the
     * element from the simplified RNG tree. Used in debugging.
     *
     * @param value The value expected in the document.
     *
     * @param type The type of value. ``undefined`` means
     * ``"token"``.
     *
     * @param datatypeLibrary The URI of the datatype library to
     * use. ``undefined`` means use the builtin library.
     *
     * @param ns The namespace in which to interpret the value.
     *
     * @param documentation Documentation about the value.
     */
    constructor(xmlPath: string, value: string, type?: string, datatypeLibrary?: string, ns?: string, documentation?: string);
    get value(): any;
    hasEmptyPattern(): boolean;
    newWalker(): InternalWalker;
}
