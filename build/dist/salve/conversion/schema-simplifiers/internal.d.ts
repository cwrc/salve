import { ResourceLoader } from "../resource-loader";
import { SchemaSimplifierOptions, SimplificationResult } from "../schema-simplification";
import { BaseSimplifier } from "./base";
/**
 * A simplifier implemented in TypeScript (thus internal to Salve).
 */
export declare class InternalSimplifier<RL extends ResourceLoader> extends BaseSimplifier {
    static validates: true;
    static createsManifest: true;
    private lastStepStart?;
    private readonly manifestPromises;
    constructor(options: SchemaSimplifierOptions<RL>);
    private parse;
    stepStart(no: number): void;
    stepTiming(): void;
    simplify(schemaPath: URL): Promise<SimplificationResult>;
}
