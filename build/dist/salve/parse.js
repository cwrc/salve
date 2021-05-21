/**
 * A parser used for testing.
 * @author Louis-Dominique Dubeau
 * @license MPL 2.0
 * @copyright Mangalam Research Center for Buddhist Languages
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse = void 0;
const tslib_1 = require("tslib");
const file_url_1 = tslib_1.__importDefault(require("file-url"));
const fs = tslib_1.__importStar(require("fs"));
const path = tslib_1.__importStar(require("path"));
const saxes_1 = require("saxes");
const validate_1 = require("./validate");
// tslint:disable no-console
const parser = new saxes_1.SaxesParser({ xmlns: true });
function grammarFromSource(rngSource) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (rngSource instanceof validate_1.Grammar) {
            return rngSource;
        }
        const rngSourceContent = fs.readFileSync(path.resolve(rngSource), "utf8").toString();
        // We try loading the tree as a JSON file. It may not work if the file is not
        // actually JSON.
        let obj;
        try {
            obj = JSON.parse(rngSourceContent);
        }
        // tslint:disable-next-line:no-empty
        catch (_a) { }
        if (obj !== undefined) {
            return validate_1.readTreeFromJSON(obj);
        }
        // Treat it as a Relax NG schema.
        return (yield validate_1.convertRNGToPattern(new URL(file_url_1.default(rngSource)))).pattern;
    });
}
/**
 * Parse an XML file and validate it against a schema. This function is meant
 * for **illustration purposes** and is used in testing. It does cut
 * corners. You should not use this for production code.
 *
 * @param rngSource It may be a [[Grammar]] object pre-built from the Relax NG
 * schema you want to use. Or it can be a JSON string, which is the contents of
 * a file created with ``salve-convert``. Or it can be a path to a local file.
 *
 * @param xmlSource The XML contents to parse and validate.
 *
 * @param mute If true, don't report errors verbosely.
 *
 * @returns A promise resolving ``true`` if there were errors, ``false``
 * otherwise.
 */
// tslint:disable-next-line: max-func-body-length
function parse(rngSource, xmlSource, mute) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        // tslint:disable-next-line:no-parameter-reassignment
        mute = !!mute;
        const tree = yield grammarFromSource(rngSource);
        const nameResolver = new validate_1.DefaultNameResolver();
        const walker = tree.newWalker(nameResolver);
        let error = false;
        function fireEvent(name, args) {
            const ret = walker.fireEvent(name, args);
            if (ret instanceof Array) {
                error = true;
                if (!mute) {
                    for (const err of ret) {
                        console.log(`on event ${name}, ${args.join(", ")}`);
                        console.log(err.toString());
                    }
                }
            }
        }
        const tagStack = [];
        let textBuf = "";
        function flushTextBuf() {
            if (textBuf !== "") {
                fireEvent("text", [textBuf]);
                textBuf = "";
            }
        }
        parser.onopentag = (node) => {
            flushTextBuf();
            const names = Object.keys(node.attributes);
            const nsDefinitions = [];
            const attributeEvents = [];
            names.sort();
            for (const name of names) {
                const attr = node.attributes[name];
                if (name === "xmlns") { // xmlns="..."
                    nsDefinitions.push(["", attr.value]);
                }
                else if (attr.prefix === "xmlns") { // xmlns:...=...
                    nsDefinitions.push([attr.local, attr.value]);
                }
                else {
                    attributeEvents.push(["attributeName", attr.uri, attr.local], ["attributeValue", attr.value]);
                }
            }
            if (nsDefinitions.length !== 0) {
                nameResolver.enterContext();
                for (const definition of nsDefinitions) {
                    nameResolver.definePrefix(definition[0], definition[1]);
                }
            }
            fireEvent("enterStartTag", [node.uri, node.local]);
            for (const event of attributeEvents) {
                fireEvent(event[0], event.slice(1));
            }
            fireEvent("leaveStartTag", []);
            tagStack.push({
                uri: node.uri,
                local: node.local,
                hasContext: nsDefinitions.length !== 0,
            });
        };
        parser.ontext = (text) => {
            textBuf += text;
        };
        parser.onclosetag = () => {
            flushTextBuf();
            const tagInfo = tagStack.pop();
            if (tagInfo === undefined) {
                throw new Error("stack underflow");
            }
            fireEvent("endTag", [tagInfo.uri, tagInfo.local]);
            if (tagInfo.hasContext) {
                nameResolver.leaveContext();
            }
        };
        const entityRe = /^<!ENTITY\s+([^\s]+)\s+(['"])(.*?)\2\s*>\s*/;
        parser.ondoctype = (doctype) => {
            // This is an extremely primitive way to handle ENTITY declarations in a
            // DOCTYPE. It is unlikely to support any kind of complicated construct.
            // If a reminder need be given then: THIS PARSER IS NOT MEANT TO BE A
            // GENERAL SOLUTION TO PARSING XML FILES!!! It supports just enough to
            // perform some testing.
            let cleaned = doctype
                .replace(/^.*?\[/, "")
                .replace(/].*?$/, "")
                .replace(/<!--(?:.|\n|\r)*?-->/g, "")
                .trim();
            while (cleaned.length !== 0) {
                const match = entityRe.exec(cleaned);
                if (match !== null) {
                    const name = match[1];
                    const value = match[3];
                    cleaned = cleaned.slice(match[0].length);
                    if (parser.ENTITIES[name] !== undefined) {
                        throw new Error(`redefining entity: ${name}`);
                    }
                    parser.ENTITIES[name] = value;
                }
                else {
                    throw new Error(`unexpected construct in DOCTYPE: ${doctype}`);
                }
            }
            console.log(doctype);
        };
        parser.onend = () => {
            const result = walker.end();
            if (result !== false) {
                error = true;
                if (!mute) {
                    for (const err of result) {
                        console.log(`on end`);
                        console.log(err.toString());
                    }
                }
            }
        };
        parser.write(xmlSource).close();
        return error;
    });
}
exports.parse = parse;
//# sourceMappingURL=parse.js.map