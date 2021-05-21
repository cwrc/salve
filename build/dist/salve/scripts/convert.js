"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/**
 * Conversion cli tool.
 * @author Louis-Dominique Dubeau
 * @license MPL 2.0
 * @copyright Mangalam Research Center for Buddhist Languages
 */
const crypto = tslib_1.__importStar(require("@trust/webcrypto"));
const argparse_1 = require("argparse");
const fs = tslib_1.__importStar(require("fs"));
const nodeFetch = tslib_1.__importStar(require("node-fetch"));
const path = tslib_1.__importStar(require("path"));
const require_dir_1 = tslib_1.__importDefault(require("require-dir"));
const temp = tslib_1.__importStar(require("temp"));
const url_1 = require("url");
const util = tslib_1.__importStar(require("util"));
const file_url_1 = tslib_1.__importDefault(require("file-url"));
global.fetch = nodeFetch;
global.URL = url_1.URL;
global.crypto = crypto;
global.TextEncoder = util.TextEncoder;
// We load individual modules rather than the build module because the
// conversion code uses parts of salve that are not public.
const conversion_1 = require("../conversion");
const datatypes_1 = require("../datatypes");
const write_1 = require("../json-format/write");
const validate_1 = require("../validate");
const fatal_1 = require("./convert/fatal");
// tslint:disable:no-console no-non-null-assertion radix
temp.track();
const prog = path.basename(process.argv[1]);
const stderr = process.stderr;
require_dir_1.default("../conversion/schema-simplifiers");
require_dir_1.default("../conversion/schema-validators");
//
// Safety harness
//
let args;
let terminating = false;
function terminate(ex) {
    // We don't want to handle exceptions that happen while we're terminating.
    if (terminating) {
        if (ex != null) {
            process.stderr.write(`${prog}: got error while terminating\n`);
            process.stderr.write(util.inspect(ex));
        }
        return;
    }
    terminating = true;
    if (ex != null) {
        if (ex instanceof fatal_1.Fatal) {
            process.stderr.write(`${prog}: ${ex.message}\n`);
            process.exit(1);
        }
        else {
            if (!args || !args.keep_temp) {
                temp.cleanup(); // We need to do this ourselves...
            }
            throw ex;
        }
    }
}
process.on("uncaughtException", terminate);
process.on("unhandledRejection", ex => {
    // We convert the rejection into an uncaught exception.
    throw ex;
});
//
// The real logic begins here.
//
const parser = new argparse_1.ArgumentParser({
    addHelp: true,
    description: "Converts a simplified RNG file to a JavaScript file " +
        "that salve can use.",
});
parser.addArgument(["--version"], {
    help: "Show program's version number and exit.",
    action: "version",
    version: validate_1.version,
});
const availableSimplifiers = conversion_1.getAvailableSimplifiers();
if (!availableSimplifiers.includes("internal")) {
    throw new fatal_1.Fatal("internal must be among the available validators");
}
parser.addArgument(["--simplifier"], {
    help: "Select the schema simplifier.",
    choices: availableSimplifiers,
    defaultValue: "internal",
});
const availableValidators = conversion_1.getAvailableValidators();
if (!availableValidators.includes("internal")) {
    throw new fatal_1.Fatal("internal must be among the available validators on Node!");
}
availableValidators.push("none");
parser.addArgument(["--validator"], {
    help: "Select how the schema is going to be validated.",
    choices: availableValidators,
    defaultValue: "internal",
});
parser.addArgument(["--no-optimize-ids"], {
    help: "Do NOT optimize the identifiers used by references and definitions.",
    action: "storeTrue",
});
parser.addArgument(["--include-paths"], {
    help: "Include RNG node path information in the JavaScript file.",
    action: "storeTrue",
});
parser.addArgument(["--format-version"], {
    help: "Version number of the JavaScript format that the tool must produce.",
    type: Number,
    defaultValue: 3,
});
parser.addArgument(["--simplify-only"], {
    help: "Stop converting at the simplification stage.",
    action: "storeTrue",
});
parser.addArgument(["--simplify-to"], {
    help: "Simplify only to a specific stage, inclusively. (Note that pipelines \
may not be able to stop at all stages.) This is mainly useful for debugging. \
Implies ``--simplify-only``.",
    type: Number,
    defaultValue: Infinity,
});
parser.addArgument(["--no-output"], {
    help: "Skip producing any output. This may be useful for debugging.",
    action: "storeTrue",
});
parser.addArgument(["--simplified-input"], {
    help: "The input is as simplified RNG.",
    action: "storeTrue",
});
parser.addArgument(["--keep-temp"], {
    help: "Keep the temporary files around. Useful for diagnosis.",
    action: "storeTrue",
});
parser.addArgument(["-v", "--verbose"], {
    help: "Run verbosely.",
    action: "storeTrue",
});
parser.addArgument(["--timing"], {
    help: "Output timing information. Implies --verbose.",
    action: "storeTrue",
});
parser.addArgument(["--verbose-format"], {
    help: `Outputs a verbose version of the data, with actual class names \
instead of numbers. Implies --no-optimize-ids. This format is cannot \
be read by salve. It is meant for debugging purposes only.`,
    action: "storeTrue",
});
parser.addArgument(["--allow-incomplete-types"], {
    help: `Without this flag, the conversion process will stop upon \
encountering types that are not fully supported. Using this flag will \
allow the conversion to happen. Use --allow-incomplete-types=quiet to \
suppress all warnings about this.`,
});
parser.addArgument(["input_path"]);
parser.addArgument(["output_path"]);
args = parser.parseArgs();
if (args.timing) {
    args.verbose = true;
}
if (args.verbose_format) {
    args.no_optimize_ids = true;
}
if (args.simplify_to !== Infinity) {
    args.simplify_only = true;
}
if (args.format_version < 3) {
    throw new fatal_1.Fatal(`can't produce format version ${args.format_version}`);
}
let _tempDir;
function ensureTempDir() {
    if (_tempDir === undefined) {
        _tempDir = temp.mkdirSync({ prefix: "salve-convert" });
        if (args.keep_temp) {
            temp.track(false);
            console.log(`Temporary files in: ${_tempDir}`);
        }
    }
    return _tempDir;
}
/**
 * Meant to be used as the ``after`` call back for ``executeStep``. Performs the
 * conversion from RNG to JS.
 *
 * @param simplified The result of the simplification.
 */
function convert(result) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const simplified = result.simplified;
        if (args.simplify_only && !args.no_output) {
            return fs.promises.writeFile(args.output_path, conversion_1.serialize(simplified, { prettyPrint: true }));
        }
        if (result.warnings.length !== 0 &&
            args.allow_incomplete_types !== "quiet") {
            stderr.write(`${prog}: WARNING: incomplete types are used in the schema\n`);
            result.warnings.forEach(x => {
                stderr.write(`${prog}: ${x}\n`);
            });
            if (!args.allow_incomplete_types) {
                throw new fatal_1.Fatal("use --allow-incomplete-types to convert a file " +
                    "using these types");
            }
            else {
                stderr.write(`${prog}: allowing as requested\n`);
            }
        }
        let convStartTime;
        if (args.verbose) {
            console.log("Transforming RNG to JavaScript...");
            if (args.timing) {
                convStartTime = Date.now();
            }
        }
        if (!args.no_output) {
            fs.writeFileSync(args.output_path, write_1.writeTreeToJSON(simplified, args.format_version, args.include_paths, args.verbose_format, !args.no_optimize_ids));
        }
        if (args.timing) {
            console.log(`Conversion delta: ${Date.now() - convStartTime}`);
        }
    });
}
function start() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        let startTime;
        if (args.simplified_input) {
            return convert({
                simplified: conversion_1.parseSimplifiedSchema(args.input_path, fs.readFileSync(args.input_path).toString()),
                warnings: [],
                manifest: [],
            });
        }
        const resourceLoader = conversion_1.makeResourceLoader();
        let simplified;
        let warnings;
        if (args.validator !== "none") {
            if (args.verbose) {
                console.log("Validating RNG...");
                if (args.timing) {
                    startTime = Date.now();
                }
            }
            const validator = conversion_1.makeValidator(args.validator, {
                verbose: args.verbose,
                timing: args.timing,
                resourceLoader,
                keepTemp: args.keep_temp,
                simplifyTo: args.simplify_to,
                ensureTempDir,
                validate: true,
                createManifest: false,
                manifestHashAlgorithm: "void",
            });
            ({ simplified, warnings } =
                yield validator.validate(new url_1.URL(file_url_1.default(args.input_path))));
            if (args.timing) {
                console.log(`Validation delta: ${Date.now() - startTime}`);
            }
        }
        if (simplified !== undefined) {
            return convert({
                simplified,
                warnings: warnings === undefined ? [] : warnings,
                manifest: [],
            });
        }
        const simplifier = conversion_1.makeSimplifier(args.simplifier, {
            verbose: args.verbose,
            timing: args.timing,
            keepTemp: args.keep_temp,
            simplifyTo: args.simplify_to,
            ensureTempDir,
            resourceLoader,
            validate: false,
            createManifest: false,
            manifestHashAlgorithm: "void",
        });
        return simplifier.simplify(new url_1.URL(file_url_1.default(args.input_path))).then(convert);
    });
}
// tslint:disable-next-line:no-floating-promises
start().then(() => {
    process.exit(0);
}).catch(e => {
    if (e instanceof datatypes_1.ValueValidationError ||
        e instanceof datatypes_1.ParameterParsingError ||
        e instanceof conversion_1.SchemaValidationError) {
        throw new fatal_1.Fatal(e.message);
    }
    throw e;
});
//  LocalWords:  cli MPL uncaughtException externalRef RNG storeTrue args jing
//  LocalWords:  tempDir dev startTime xsl rng stepStart stepNo xsltproc JS
//  LocalWords:  stringparam originalDir repeatWhen simplifyingStartTime prog
//  LocalWords:  xmllint convStartTime
//# sourceMappingURL=convert.js.map