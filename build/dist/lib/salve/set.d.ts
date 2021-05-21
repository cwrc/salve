/**
 * Set utilities.
 *
 * @author Louis-Dominique Dubeau
 * @license MPL 2.0
 * @copyright Mangalam Research Center for Buddhist Languages
 * @private
 */
/**
 * Add the elements of another set to this set. This mutates this set.
 *
 * @param me The set to mutate.
 *
 * @param s The set to add.
 */
export declare function union<T>(me: Set<T>, s: Set<T>): void;
/**
 * Selects a subset of values.
 *
 * @param me The set to filter.
 *
 * @param f A function that selects values.
 *
 * @returns An object of the same class as the object on which the method is
 * called. This object contains only the value selected by the function.
 */
export declare function filter<T>(me: Set<T>, f: (value: T, index: number, me: Set<T>) => any): Set<T>;
/**
 * This method works like Array.map but with a provision for eliminating
 * elements.
 *
 * @param me The set to map.
 *
 * @param f This parameter plays the same role as for ``Array``'s ``map``
 * method.  However, when it returns an undefined value, this return value is
 * not added to set that will be returned.
 *
 * @returns The new set. This set is of the same class as the original set.
 */
export declare function map<T>(me: Set<T>, f: (value: T, index: number, me: Set<T>) => any): Set<T>;
