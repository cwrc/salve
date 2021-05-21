"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeSimplifier = exports.registerSimplifier = exports.isAvailable = exports.getAvailableSimplifiers = void 0;
const availableSimplifiers = Object.create(null);
function getAvailableSimplifiers() {
    return Object.keys(availableSimplifiers);
}
exports.getAvailableSimplifiers = getAvailableSimplifiers;
function isAvailable(name) {
    return availableSimplifiers[name] !== undefined;
}
exports.isAvailable = isAvailable;
function registerSimplifier(name, ctor) {
    availableSimplifiers[name] = ctor;
}
exports.registerSimplifier = registerSimplifier;
function makeSimplifier(name, options) {
    const ctor = availableSimplifiers[name];
    if (ctor === undefined) {
        throw new Error(`unknown simplifier name: ${name}`);
    }
    return new ctor(options);
}
exports.makeSimplifier = makeSimplifier;
//# sourceMappingURL=schema-simplification.js.map