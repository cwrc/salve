"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XSLSimplifier = void 0;
const tslib_1 = require("tslib");
/**
 * A simplifier implemented as a series of XSL transformations. It launches
 * external processes to perform the transformation.
 *
 * @author Louis-Dominique Dubeau
 * @license MPL 2.0
 * @copyright Mangalam Research Center for Buddhist Languages
 */
const child_process_1 = require("child_process");
const fs = tslib_1.__importStar(require("fs"));
const path = tslib_1.__importStar(require("path"));
const parser_1 = require("../parser");
const schema_simplification_1 = require("../schema-simplification");
const base_1 = require("./base");
const common_1 = require("./common");
/**
 * A simplifier implemented as a series of XSL transformations. It launches
 * external processes to perform the transformation.
 *
 * This simiplifier does not produce a manifest, and it does not validate.
 */
class XSLSimplifier extends base_1.BaseSimplifier {
    constructor(options) {
        super(options);
        if (options.timing) {
            options.verbose = true;
        }
    }
    processDatatypes(tree) {
        const processor = new common_1.DatatypeProcessor();
        processor.walk(tree);
        return processor.warnings;
    }
    get steps() {
        if (this._steps !== undefined) {
            return this._steps;
        }
        // Grab the xsl files that form the simplification process, and store these
        // paths in ``steps``.
        const libPath = path.resolve(__dirname, path.join("..", "..", "rng-simplification"));
        const stepRe = /^rng-simplification_step(\d*?).xsl$/;
        const stepFiles = fs.readdirSync(libPath).filter(file => file.match(stepRe));
        // The filter step above ensures the regexp match.
        // tslint:disable-next-line:no-non-null-assertion
        stepFiles.sort((a, b) => parseInt(a.match(stepRe)[1]) -
            // tslint:disable-next-line:no-non-null-assertion
            parseInt(b.match(stepRe)[1]));
        return this._steps = stepFiles.map(file => {
            const ret = {
                name: file,
                path: path.join(libPath, file),
                repeatNo: 0,
                saxon: false,
            };
            if (file === "rng-simplification_step1.xsl") {
                ret.saxon = true;
                // We want to check whether we need to run the step again to include
                // more files.
                ret.repeatWhen = parser_1.dependsOnExternalFile;
            }
            return ret;
        });
    }
    simplify(schemaURL) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let schemaPath = schemaURL.toString();
            if (schemaURL.protocol === "file:") {
                schemaPath = schemaPath.replace(/^file:\/\//, "");
            }
            else {
                throw new Error("URLs must use the file: protocol");
            }
            let startTime;
            if (this.options.verbose) {
                // tslint:disable-next-line:no-console
                console.log("Simplifying...");
                if (this.options.timing) {
                    startTime = Date.now();
                }
            }
            const originalInputDir = `${path.dirname(path.resolve(schemaPath))}/`;
            const result = yield this.executeStep(originalInputDir, 0, fs.readFileSync(schemaPath).toString());
            const simplified = parser_1.parseSimplifiedSchema(schemaPath, result);
            const warnings = (this.options.simplifyTo >= 18) ?
                this.processDatatypes(simplified) : [];
            this.stepTiming();
            if (this.options.timing) {
                // tslint:disable-next-line:no-non-null-assertion no-console
                console.log(`Simplification delta: ${Date.now() - startTime}`);
            }
            return {
                simplified,
                warnings,
                manifest: [],
            };
        });
    }
    stepTiming() {
        if (this.lastStepStart !== undefined) {
            // tslint:disable-next-line:no-console
            console.log(`${Date.now() - this.lastStepStart}ms`);
        }
    }
    /**
     * @param originalInputDir The URL to the directory that contained the
     * original file to simplify.
     *
     * @param stepNo The index in ``steps`` of the step we are running.
     *
     * @param input The data to process.
     */
    executeStep(originalInputDir, stepNo, input) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const steps = this.steps;
            if (stepNo >= steps.length || stepNo >= this.options.simplifyTo) {
                return input;
            }
            const step = steps[stepNo];
            if (this.options.verbose) {
                this.stepTiming();
                // tslint:disable-next-line:no-console
                console.log(`Simplification step ${stepNo + 1}, repetition ${step.repeatNo}...`);
                if (this.options.timing) {
                    this.lastStepStart = Date.now();
                }
            }
            let child;
            const output = yield new Promise((resolve, reject) => {
                // Only step 1 requires XSLT 2. Remember that steps are 0-based here.
                if (step.saxon) {
                    child = child_process_1.spawn("java", ["-jar", "/usr/share/java/Saxon-HE.jar", `-xsl:${step.path}`, "-s:-",
                        `originalDir=file://${originalInputDir}`], { stdio: ["pipe", "pipe", "inherit"] });
                }
                else {
                    child = child_process_1.spawn("xsltproc", ["--stringparam", "originalDir", originalInputDir, step.path, "-"], {
                        stdio: ["pipe", "pipe", "inherit"],
                        cwd: originalInputDir,
                    });
                }
                child.stdin.end(input);
                let outputBuf = "";
                child.stdout.on("data", data => {
                    outputBuf += data.toString();
                });
                child.on("exit", status => {
                    if (status !== 0) {
                        reject(new Error(`child terminated with status: ${status}`));
                    }
                    resolve(outputBuf);
                });
            });
            if (this.options.keepTemp) {
                // tslint:disable-next-line:no-non-null-assertion
                const tempDir = this.options.ensureTempDir();
                const outBase = `out${String((stepNo + 1)) +
                    (step.repeatWhen !== undefined ? `.${step.repeatNo + 1}` : "")}.rng`;
                const outPath = path.join(tempDir, outBase);
                fs.writeFileSync(outPath, output);
            }
            if (step.repeatWhen !== undefined) {
                if (step.repeatWhen(output)) {
                    step.repeatNo++;
                    return this.executeStep(originalInputDir, stepNo, output);
                }
            }
            return this.executeStep(originalInputDir, stepNo + 1, output);
        });
    }
}
exports.XSLSimplifier = XSLSimplifier;
XSLSimplifier.validates = false;
XSLSimplifier.createsManifest = false;
schema_simplification_1.registerSimplifier("xsl", XSLSimplifier);
//# sourceMappingURL=xsl.js.map