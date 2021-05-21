/**
 * A base class providing some functionality that most simplifiers need.
 *
 * @author Louis-Dominique Dubeau
 * @license MPL 2.0
 * @copyright Mangalam Research Center for Buddhist Languages
 */
import { SchemaSimplifier, SchemaSimplifierOptions, SimplificationResult } from "../schema-simplification";
export declare abstract class BaseSimplifier implements SchemaSimplifier {
    protected readonly options: SchemaSimplifierOptions;
    constructor(options: SchemaSimplifierOptions);
    abstract simplify(schemaPath: string | URL): Promise<SimplificationResult>;
}
