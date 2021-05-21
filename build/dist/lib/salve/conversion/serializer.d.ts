/**
 * Serialization support for trees produced by the {@link
 * module:conversion/parser parser} module.
 * @author Louis-Dominique Dubeau
 * @license MPL 2.0
 * @copyright 2013, 2014 Mangalam Research Center for Buddhist Languages
 */
import { Element } from "./parser";
export interface SerializationOptions {
    /** Whether to pretty print the results. */
    prettyPrint?: boolean;
}
/**
 * Serialize a tree previously produced by [["conversion/parser".BasicParser]].
 *
 * @param tree The tree to serialize.
 *
 * @param options Options specifying how to perform the serialization.
 *
 * @returns The serialized tree.
 */
export declare function serialize(tree: Element, options?: SerializationOptions): string;
