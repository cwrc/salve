"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Param = void 0;
/**
 * Pattern for RNG's ``param`` element.
 * @author Louis-Dominique Dubeau
 * @license MPL 2.0
 * @copyright Mangalam Research Center for Buddhist Languages
 */
const base_1 = require("./base");
/**
 * This is a defunct pattern. During the processing of the RNG file all
 * ``param`` elements are converted into parameters to [["patterns/data".Data]]
 * so we never end up with a converted file that contains an instance of this
 * class.
 */
class Param extends base_1.Pattern {
    constructor(xmlPath) {
        super(xmlPath);
        throw new Error("this pattern is a placeholder and should never actually " +
            "be used");
    }
}
exports.Param = Param;
//  LocalWords:  RNG's MPL
//# sourceMappingURL=param.js.map