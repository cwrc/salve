"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertRNGToPattern = void 0;
const tslib_1 = require("tslib");
const convert_simplified_1 = require("./convert-simplified");
const resource_loader_1 = require("./resource-loader");
const internal_1 = require("./schema-simplifiers/internal");
const DEFAULT_OPTIONS = {
    createManifest: false,
    manifestHashAlgorithm: "SHA-1",
    resourceLoader: undefined,
};
/**
 * Validate, simplify and convert a schema to a pattern, which can then be used
 * to validate an XML document. This function uses the internal simplification
 * and validation code.
 *
 * @param schemaPath The schema's location. The schema must be in the XML Relax
 * NG format. (Not the compact notation.)
 *
 * @param options The options driving the conversion.
 *
 * @returns The converted pattern.
 */
function convertRNGToPattern(schemaPath, options = DEFAULT_OPTIONS) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const resourceLoader = options.resourceLoader !== undefined ?
            options.resourceLoader : resource_loader_1.makeResourceLoader();
        const simplifier = new internal_1.InternalSimplifier({
            verbose: false,
            timing: false,
            keepTemp: false,
            simplifyTo: Infinity,
            resourceLoader,
            validate: true,
            createManifest: options.createManifest,
            manifestHashAlgorithm: options.manifestHashAlgorithm,
        });
        const { simplified, warnings, manifest } = yield simplifier.simplify(schemaPath);
        return {
            pattern: convert_simplified_1.makePatternFromSimplifiedSchema(simplified),
            simplified,
            warnings,
            manifest,
        };
    });
}
exports.convertRNGToPattern = convertRNGToPattern;
//# sourceMappingURL=convert.js.map