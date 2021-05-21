"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FetchResourceLoader = exports.FetchResource = void 0;
const tslib_1 = require("tslib");
// tslint:disable-next-line:no-typeof-undefined
if (typeof fetch === "undefined") {
    throw new Error("trying to load the fetch loader when fetch is absent");
}
class FetchResource {
    constructor(url, response) {
        this.url = url;
        this.response = response;
    }
    getText() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.response.text();
        });
    }
}
exports.FetchResource = FetchResource;
/**
 * A resource loader that loads resources using ``fetch``. It can only be used
 * in an environment where ``fetch`` is native or provided by a polyfill.
 *
 * This loader does not allow loading from ``file://``.
 */
class FetchResourceLoader {
    load(url) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (url.protocol === "file:") {
                throw new Error("this loader cannot load from the file system");
            }
            const response = yield fetch(url.toString());
            if (!response.ok) {
                throw new Error(`unable to fetch ${url}`);
            }
            return new FetchResource(url, response);
        });
    }
}
exports.FetchResourceLoader = FetchResourceLoader;
//# sourceMappingURL=fetch.js.map