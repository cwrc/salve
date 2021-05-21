"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeValidator = exports.registerValidator = exports.isValidatorAvailable = exports.getAvailableValidators = exports.SchemaValidationError = void 0;
const tools_1 = require("../tools");
class SchemaValidationError extends Error {
    constructor(message) {
        super();
        const err = new Error(message);
        this.name = "SchemaValidationError";
        this.stack = err.stack;
        this.message = err.message;
        tools_1.fixPrototype(this, SchemaValidationError);
    }
}
exports.SchemaValidationError = SchemaValidationError;
const availableValidators = Object.create(null);
function getAvailableValidators() {
    return Object.keys(availableValidators);
}
exports.getAvailableValidators = getAvailableValidators;
function isValidatorAvailable(name) {
    return availableValidators[name] !== undefined;
}
exports.isValidatorAvailable = isValidatorAvailable;
function registerValidator(name, ctor) {
    availableValidators[name] = ctor;
}
exports.registerValidator = registerValidator;
function makeValidator(name, options) {
    const ctor = availableValidators[name];
    if (ctor === undefined) {
        throw new Error(`unknown validator name: ${name}`);
    }
    return new ctor(options);
}
exports.makeValidator = makeValidator;
//# sourceMappingURL=schema-validation.js.map