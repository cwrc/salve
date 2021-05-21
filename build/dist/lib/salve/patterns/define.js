"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Define = void 0;
const base_1 = require("./base");
/**
 * A pattern for ``<define>``.
 */
class Define extends base_1.OneSubpattern {
    /**
     * @param xmlPath This is a string which uniquely identifies the
     * element from the simplified RNG tree. Used in debugging.
     *
     * @param name The name of the definition.
     *
     * @param pat The pattern contained by this one.
     */
    constructor(xmlPath, name, pat) {
        super(xmlPath, pat);
        this.name = name;
    }
}
exports.Define = Define;
//# sourceMappingURL=define.js.map