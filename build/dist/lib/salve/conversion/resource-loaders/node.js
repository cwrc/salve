"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeResourceLoader = exports.NodeResource = void 0;
const tslib_1 = require("tslib");
/**
 * A resource loader that loads resources using Node's ``fs`` facilities or
 * ``fetch``.
 *
 * @author Louis-Dominique Dubeau
 * @license MPL 2.0
 * @copyright Mangalam Research Center for Buddhist Languages
 */
const fs = tslib_1.__importStar(require("fs"));
const fetch_1 = require("./fetch");
class NodeResource {
    constructor(url, text) {
        this.url = url;
        this.text = text;
    }
    getText() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.text;
        });
    }
}
exports.NodeResource = NodeResource;
/**
 * A resource loader that loads resources using Node's ``fs`` facilities or
 * ``fetch``.
 *
 * URLs with the file: protocol are loaded through Node's ``fs``
 * facilities. Otherwise, fetch is used.
 */
class NodeResourceLoader {
    constructor() {
        // We use composition to delegate network loads to the fetch loader. Extending
        // FetchResourceLoader causes interface complications.
        this.fetchLoader = new fetch_1.FetchResourceLoader();
    }
    load(url) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (url.protocol === "file:") {
                if (url.hash !== "" || url.href.endsWith("#")) {
                    throw new Error("url cannot have a hash");
                }
                return new Promise((resolve, reject) => {
                    fs.readFile(url, (err, data) => {
                        if (err != null) {
                            reject(err);
                            return;
                        }
                        resolve(new NodeResource(url, data.toString()));
                    });
                });
            }
            return this.fetchLoader.load(url);
        });
    }
}
exports.NodeResourceLoader = NodeResourceLoader;
//# sourceMappingURL=node.js.map