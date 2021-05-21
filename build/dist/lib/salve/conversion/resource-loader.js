"use strict";
/**
 * Facilities for loading resources.
 *
 * @author Louis-Dominique Dubeau
 * @license MPL 2.0
 * @copyright Mangalam Research Center for Buddhist Languages
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeResourceLoader = void 0;
// tslint:disable-next-line:no-typeof-undefined
if (typeof fetch === "undefined") {
    throw new Error("all resource loaders require fetch to be available");
}
function makeResourceLoader() {
    // tslint:disable-next-line:no-typeof-undefined
    if (typeof window === "undefined") {
        // tslint:disable-next-line:no-require-imports
        const node = require("./resource-loaders/node");
        return new node.NodeResourceLoader();
    }
    // tslint:disable-next-line:no-require-imports
    const fetch = require("./resource-loaders/fetch");
    return new fetch.FetchResourceLoader();
}
exports.makeResourceLoader = makeResourceLoader;
//# sourceMappingURL=resource-loader.js.map