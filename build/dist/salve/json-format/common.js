"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OPTION_NO_PATHS = exports.nameToCode = exports.codeToConstructor = void 0;
/**
 * This module contains constants common to both reading and writing schemas in
 * the JSON format internal to salve.
 *
 * @author Louis-Dominique Dubeau
 * @license MPL 2.0
 * @copyright Mangalam Research Center for Buddhist Languages
 */
const patterns_1 = require("../patterns");
//
// MODIFICATIONS TO THIS TABLE MUST BE REFLECTED IN ALL OTHER TABLES IN THIS
// MODULE.
//
exports.codeToConstructor = [
    Array,
    patterns_1.Empty,
    patterns_1.Data,
    patterns_1.List,
    patterns_1.Param,
    patterns_1.Value,
    patterns_1.NotAllowed,
    patterns_1.Text,
    patterns_1.Ref,
    patterns_1.OneOrMore,
    patterns_1.Choice,
    patterns_1.Group,
    patterns_1.Attribute,
    patterns_1.Element,
    patterns_1.Define,
    patterns_1.Grammar,
    // EName used to be in this slot. Yes, we cheat with a cast. salve will
    // crash hard if this slot is accessed, which is what we want.
    undefined,
    patterns_1.Interleave,
    patterns_1.Name,
    patterns_1.NameChoice,
    patterns_1.NsName,
    patterns_1.AnyName,
];
//
// MODIFICATIONS TO THIS MAP MUST BE REFLECTED IN ALL OTHER TABLES IN THIS
// MODULE.
//
// Element name to code mapping
exports.nameToCode = Object.create(null);
exports.nameToCode.array = 0;
exports.nameToCode.empty = 1;
exports.nameToCode.data = 2;
exports.nameToCode.list = 3;
exports.nameToCode.param = 4;
exports.nameToCode.value = 5;
exports.nameToCode.notAllowed = 6;
exports.nameToCode.text = 7;
exports.nameToCode.ref = 8;
exports.nameToCode.oneOrMore = 9;
exports.nameToCode.choice = 10;
exports.nameToCode.group = 11;
exports.nameToCode.attribute = 12;
exports.nameToCode.element = 13;
exports.nameToCode.define = 14;
exports.nameToCode.grammar = 15;
// Historical value.
// nameToCode.EName = 16;
exports.nameToCode.interleave = 17;
exports.nameToCode.name = 18;
exports.nameToCode.nameChoice = 19;
exports.nameToCode.nsName = 20;
exports.nameToCode.anyName = 21;
// This is a bit field
exports.OPTION_NO_PATHS = 1;
// var OPTION_WHATEVER = 2;
// var OPTION_WHATEVER_PLUS_1 = 4;
// etc...
//# sourceMappingURL=common.js.map