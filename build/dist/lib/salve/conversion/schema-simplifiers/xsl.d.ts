import { SchemaSimplifierOptions, SimplificationResult } from "../schema-simplification";
import { BaseSimplifier } from "./base";
/**
 * A simplifier implemented as a series of XSL transformations. It launches
 * external processes to perform the transformation.
 *
 * This simiplifier does not produce a manifest, and it does not validate.
 */
export declare class XSLSimplifier extends BaseSimplifier {
    static validates: false;
    static createsManifest: false;
    private lastStepStart;
    private _steps?;
    constructor(options: SchemaSimplifierOptions);
    private processDatatypes;
    private get steps();
    simplify(schemaURL: URL): Promise<SimplificationResult>;
    stepTiming(): void;
    /**
     * @param originalInputDir The URL to the directory that contained the
     * original file to simplify.
     *
     * @param stepNo The index in ``steps`` of the step we are running.
     *
     * @param input The data to process.
     */
    executeStep(originalInputDir: string, stepNo: number, input: string): Promise<string>;
}
