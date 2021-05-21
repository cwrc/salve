import { Grammar } from "./validate";
/**
 * Parse an XML file and validate it against a schema. This function is meant
 * for **illustration purposes** and is used in testing. It does cut
 * corners. You should not use this for production code.
 *
 * @param rngSource It may be a [[Grammar]] object pre-built from the Relax NG
 * schema you want to use. Or it can be a JSON string, which is the contents of
 * a file created with ``salve-convert``. Or it can be a path to a local file.
 *
 * @param xmlSource The XML contents to parse and validate.
 *
 * @param mute If true, don't report errors verbosely.
 *
 * @returns A promise resolving ``true`` if there were errors, ``false``
 * otherwise.
 */
export declare function parse(rngSource: string | Grammar, xmlSource: string, mute: boolean): Promise<boolean>;
