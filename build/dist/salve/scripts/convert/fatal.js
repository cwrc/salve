"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Fatal = void 0;
/**
 * Class modeling a fatal error in the CLI tools.
 *
 * @author Louis-Dominique Dubeau
 * @license MPL 2.0
 * @copyright Mangalam Research Center for Buddhist Languages
 */
const tools_1 = require("../../tools");
class Fatal extends Error {
    constructor(msg) {
        super(msg);
        this.name = "Fatal";
        this.message = msg;
        tools_1.fixPrototype(this, Fatal);
    }
}
exports.Fatal = Fatal;
//# sourceMappingURL=fatal.js.map