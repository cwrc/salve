"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XMLLintValidator = void 0;
const tslib_1 = require("tslib");
/**
 * A schema validator that spawns xmllint to validate the schema.
 *
 * @author Louis-Dominique Dubeau
 * @license MPL 2.0
 * @copyright Mangalam Research Center for Buddhist Languages
 */
const child_process_1 = require("child_process");
const schema_validation_1 = require("../schema-validation");
class XMLLintValidator {
    constructor(options) {
        this.options = options;
    }
    validate(schemaURL) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let schemaPath = schemaURL.toString();
            if (schemaURL.protocol === "file:") {
                schemaPath = schemaPath.replace(/^file:\/\//, "");
            }
            else {
                throw new Error("URLs must use the file: protocol");
            }
            const err = yield new Promise(resolve => {
                const child = child_process_1.spawn("xmllint", ["--relaxng", schemaPath, "/dev/null"], { stdio: ["ignore", "ignore", "pipe"] });
                let buffer = "";
                child.stderr.on("data", data => {
                    buffer += data;
                });
                child.on("close", () => {
                    resolve(buffer);
                });
            });
            // Search for an actual schema error.
            if (err.search(/Relax-NG parser error/) !== -1) {
                let msg = "error in schema";
                if (!this.options.verbose) {
                    msg += "; run with --verbose to see what the problem was";
                }
                else {
                    process.stderr.write(err);
                }
                throw new schema_validation_1.SchemaValidationError(msg);
            }
            return {};
        });
    }
}
exports.XMLLintValidator = XMLLintValidator;
schema_validation_1.registerValidator("xmllint", XMLLintValidator);
//# sourceMappingURL=xmllint.js.map