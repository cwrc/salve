/**
 * Classes that model datatypes used in RNG schemas.
 * @author Louis-Dominique Dubeau
 * @license MPL 2.0
 * @copyright Mangalam Research Center for Buddhist Languages
 *
 */
import { TypeLibrary } from "./datatypes/library";
/**
 * The registry of types.
 */
export declare class Registry {
    private readonly libraries;
    /**
     * Adds a library to the registry.
     *
     * @param library The library to add to the registry.
     *
     * @throws {Error} If the URI is already registered.
     */
    add(library: TypeLibrary): void;
    /**
     * Searches for a URI in the library.
     *
     * @param uri The URI to search for.
     *
     * @returns The library that corresponds to the URI or ``undefined`` if no
     * such library exists.
     */
    find(uri: string): TypeLibrary | undefined;
    /**
     * Gets the library corresponding to a URI.
     *
     * @param uri The URI.
     *
     * @returns The library that corresponds to the URI.
     *
     * @throws {Error} If the library does not exist.
     */
    get(uri: string): TypeLibrary;
}
export declare const registry: Registry;
export { ParameterParsingError, ValueValidationError, ValueError } from "./datatypes/errors";
export { Datatype, ParsedParams, RawParameter, TypeLibrary } from "./datatypes/library";
