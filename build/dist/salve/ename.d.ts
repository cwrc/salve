/**
 * Class for XML Expanded Names.
 * @author Louis-Dominique Dubeau
 * @license MPL 2.0
 * @copyright Mangalam Research Center for Buddhist Languages
 */
/**
 * Immutable objects modeling XML Expanded Names.
 */
export declare class EName {
    readonly ns: string;
    readonly name: string;
    /**
     * @param ns The namespace URI.
     *
     * @param name The local name of the entity.
     */
    constructor(ns: string, name: string);
    /**
     * @returns A string representing the expanded name.
     */
    toString(): string;
    /**
     * Compares two expanded names.
     *
     * @param other The other object to compare this object with.
     *
     * @returns  ``true`` if this object equals the other.
     */
    equal(other: EName): boolean;
}
