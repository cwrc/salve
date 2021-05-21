"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseSimplifier = void 0;
class BaseSimplifier {
    constructor(options) {
        this.options = options;
        if (options.timing) {
            options.verbose = true;
        }
        if (options.validate &&
            !this.constructor.validates) {
            throw new Error("requested validation on a simplifier that does not validate");
        }
        if (options.createManifest &&
            !this.constructor.createsManifest) {
            throw new Error("requested a manifest on a simplifier that does not create manifests");
        }
    }
}
exports.BaseSimplifier = BaseSimplifier;
//# sourceMappingURL=base.js.map