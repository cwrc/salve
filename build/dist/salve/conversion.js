/**
 * This module contains utilities used for converting Relax NG files to the
 * format required by salve.
 *
 * @author Louis-Dominique Dubeau
 * @license MPL 2.0
 * @copyright Mangalam Research Center for Buddhist Languages
 *
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchemaValidationError = exports.makeValidator = exports.getAvailableValidators = exports.makeSimplifier = exports.getAvailableSimplifiers = exports.serialize = exports.makeResourceLoader = exports.Text = exports.parseSimplifiedSchema = exports.Element = exports.convertRNGToPattern = void 0;
var convert_1 = require("./conversion/convert");
Object.defineProperty(exports, "convertRNGToPattern", { enumerable: true, get: function () { return convert_1.convertRNGToPattern; } });
var parser_1 = require("./conversion/parser");
Object.defineProperty(exports, "Element", { enumerable: true, get: function () { return parser_1.Element; } });
Object.defineProperty(exports, "parseSimplifiedSchema", { enumerable: true, get: function () { return parser_1.parseSimplifiedSchema; } });
Object.defineProperty(exports, "Text", { enumerable: true, get: function () { return parser_1.Text; } });
var resource_loader_1 = require("./conversion/resource-loader");
Object.defineProperty(exports, "makeResourceLoader", { enumerable: true, get: function () { return resource_loader_1.makeResourceLoader; } });
var serializer_1 = require("./conversion/serializer");
Object.defineProperty(exports, "serialize", { enumerable: true, get: function () { return serializer_1.serialize; } });
var schema_simplification_1 = require("./conversion/schema-simplification");
Object.defineProperty(exports, "getAvailableSimplifiers", { enumerable: true, get: function () { return schema_simplification_1.getAvailableSimplifiers; } });
Object.defineProperty(exports, "makeSimplifier", { enumerable: true, get: function () { return schema_simplification_1.makeSimplifier; } });
var schema_validation_1 = require("./conversion/schema-validation");
Object.defineProperty(exports, "getAvailableValidators", { enumerable: true, get: function () { return schema_validation_1.getAvailableValidators; } });
Object.defineProperty(exports, "makeValidator", { enumerable: true, get: function () { return schema_validation_1.makeValidator; } });
Object.defineProperty(exports, "SchemaValidationError", { enumerable: true, get: function () { return schema_validation_1.SchemaValidationError; } });
//# sourceMappingURL=conversion.js.map