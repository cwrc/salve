"use strict";
/**
 * RNG-based validator.
 *
 * @author Louis-Dominique Dubeau
 * @license MPL 2.0
 * @copyright Mangalam Research Center for Buddhist Languages
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnyName = exports.NsName = exports.NameChoice = exports.Name = exports.BaseName = exports.DefaultNameResolver = exports.ValidationError = exports.ElementNameError = exports.ChoiceError = exports.AttributeValueError = exports.AttributeNameError = exports.EName = exports.readTreeFromJSON = exports.writeTreeToJSON = exports.makeResourceLoader = exports.convertRNGToPattern = exports.BasePattern = exports.GrammarWalker = exports.Grammar = exports.eventsToTreeString = exports.version = void 0;
const tslib_1 = require("tslib");
exports.version = "1.1.0";
var patterns_1 = require("./patterns");
Object.defineProperty(exports, "eventsToTreeString", { enumerable: true, get: function () { return patterns_1.eventsToTreeString; } });
Object.defineProperty(exports, "Grammar", { enumerable: true, get: function () { return patterns_1.Grammar; } });
Object.defineProperty(exports, "GrammarWalker", { enumerable: true, get: function () { return patterns_1.GrammarWalker; } });
Object.defineProperty(exports, "BasePattern", { enumerable: true, get: function () { return patterns_1.BasePattern; } });
var conversion_1 = require("./conversion");
Object.defineProperty(exports, "convertRNGToPattern", { enumerable: true, get: function () { return conversion_1.convertRNGToPattern; } });
Object.defineProperty(exports, "makeResourceLoader", { enumerable: true, get: function () { return conversion_1.makeResourceLoader; } });
var write_1 = require("./json-format/write");
Object.defineProperty(exports, "writeTreeToJSON", { enumerable: true, get: function () { return write_1.writeTreeToJSON; } });
var read_1 = require("./json-format/read");
Object.defineProperty(exports, "readTreeFromJSON", { enumerable: true, get: function () { return read_1.readTreeFromJSON; } });
var ename_1 = require("./ename");
Object.defineProperty(exports, "EName", { enumerable: true, get: function () { return ename_1.EName; } });
tslib_1.__exportStar(require("./events"), exports);
var errors_1 = require("./errors");
Object.defineProperty(exports, "AttributeNameError", { enumerable: true, get: function () { return errors_1.AttributeNameError; } });
Object.defineProperty(exports, "AttributeValueError", { enumerable: true, get: function () { return errors_1.AttributeValueError; } });
Object.defineProperty(exports, "ChoiceError", { enumerable: true, get: function () { return errors_1.ChoiceError; } });
Object.defineProperty(exports, "ElementNameError", { enumerable: true, get: function () { return errors_1.ElementNameError; } });
Object.defineProperty(exports, "ValidationError", { enumerable: true, get: function () { return errors_1.ValidationError; } });
var default_name_resolver_1 = require("./default_name_resolver");
Object.defineProperty(exports, "DefaultNameResolver", { enumerable: true, get: function () { return default_name_resolver_1.DefaultNameResolver; } });
var name_patterns_1 = require("./name_patterns");
Object.defineProperty(exports, "BaseName", { enumerable: true, get: function () { return name_patterns_1.Base; } });
Object.defineProperty(exports, "Name", { enumerable: true, get: function () { return name_patterns_1.Name; } });
Object.defineProperty(exports, "NameChoice", { enumerable: true, get: function () { return name_patterns_1.NameChoice; } });
Object.defineProperty(exports, "NsName", { enumerable: true, get: function () { return name_patterns_1.NsName; } });
Object.defineProperty(exports, "AnyName", { enumerable: true, get: function () { return name_patterns_1.AnyName; } });
//  LocalWords:  rng Mangalam Dubeau MPL RNG constructTree validator
//# sourceMappingURL=validate.js.map