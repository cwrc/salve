"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalValidator = void 0;
const tslib_1 = require("tslib");
/**
 * A schema validator that uses salve to validate the schema.
 *
 * @author Louis-Dominique Dubeau
 * @license MPL 2.0
 * @copyright Mangalam Research Center for Buddhist Languages
 */
const internal_1 = require("../schema-simplifiers/internal");
const schema_validation_1 = require("../schema-validation");
class InternalValidator {
    constructor(options) {
        this.options = options;
    }
    validate(schemaPath) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const simplifier = new internal_1.InternalSimplifier(Object.assign(Object.assign({}, this.options), { validate: true }));
            return simplifier.simplify(schemaPath);
        });
    }
}
exports.InternalValidator = InternalValidator;
schema_validation_1.registerValidator("internal", InternalValidator);
//# sourceMappingURL=internal.js.map