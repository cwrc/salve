"use strict";
/**
 * This module contains the logic for converting a simplified schema to a
 * pattern.
 *
 * @author Louis-Dominique Dubeau
 * @license MPL 2.0
 * @copyright Mangalam Research Center for Buddhist Languages
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.makePatternFromSimplifiedSchema = void 0;
const name_patterns_1 = require("../name_patterns");
const patterns_1 = require("../patterns");
function walk(el) {
    switch (el.local) {
        //  "param" is not needed as a separate case, because it is handled in
        //  "data"
        //
        case "grammar":
            return new patterns_1.Grammar(el.path, walk(el.children[0]), el.children.slice(1)
                .map(x => walk(x)));
        case "except":
        case "start":
            return walk(el.children[0]);
        case "define":
            return new patterns_1.Define(el.path, el.mustGetAttribute("name"), walk(el.children[0]));
        case "ref":
            return new patterns_1.Ref(el.path, el.mustGetAttribute("name"));
        case "value":
            return new patterns_1.Value(el.path, el.text, el.mustGetAttribute("type"), el.mustGetAttribute("datatypeLibrary"), el.mustGetAttribute("ns"), el.documentation);
        case "data":
            const children = el.children;
            const length = children.length;
            const last = children[length - 1];
            const except = (length !== 0 && last.local === "except") ? last : undefined;
            const params = (except === undefined ? children : children.slice(0, -1))
                .map(param => ({ name: param.mustGetAttribute("name"),
                value: param.children[0].text }));
            return new patterns_1.Data(el.path, el.mustGetAttribute("type"), el.mustGetAttribute("datatypeLibrary"), params, except !== undefined ?
                walk(except) :
                undefined);
        case "group":
            return new patterns_1.Group(el.path, walk(el.children[0]), walk(el.children[1]));
        case "interleave":
            return new patterns_1.Interleave(el.path, walk(el.children[0]), walk(el.children[1]));
        case "choice":
            return new patterns_1.Choice(el.path, walk(el.children[0]), walk(el.children[1]));
        case "oneOrMore":
            return new patterns_1.OneOrMore(el.path, walk(el.children[0]));
        case "element":
            return new patterns_1.Element(el.path, walkNameClass(el.children[0]), walk(el.children[1]));
        case "attribute":
            return new patterns_1.Attribute(el.path, walkNameClass(el.children[0]), walk(el.children[1]));
        case "empty":
            return new patterns_1.Empty(el.path);
        case "text":
            return new patterns_1.Text(el.path);
        case "list":
            return new patterns_1.List(el.path, walk(el.children[0]));
        case "notAllowed":
            return new patterns_1.NotAllowed(el.path);
        default:
            throw new Error(`unexpected local name: ${el.local}`);
    }
}
function walkNameClass(el) {
    switch (el.local) {
        case "choice":
            return new name_patterns_1.NameChoice(walkNameClass(el.children[0]), walkNameClass(el.children[1]));
        case "name":
            return new name_patterns_1.Name(el.mustGetAttribute("ns"), el.text, el.documentation);
        case "nsName":
            return new name_patterns_1.NsName(el.mustGetAttribute("ns"), el.children.length !== 0 ?
                walkNameClass(el.children[0]) :
                undefined);
        case "anyName":
            return new name_patterns_1.AnyName(el.children.length !== 0 ?
                walkNameClass(el.children[0]) :
                undefined);
        case "except":
            return walkNameClass(el.children[0]);
        default:
            throw new Error(`unexpected local name: ${el.local}`);
    }
}
function makePatternFromSimplifiedSchema(tree) {
    const ret = walk(tree);
    if (!(ret instanceof patterns_1.Grammar)) {
        throw new Error("tree did not produce a Grammar!");
    }
    return ret;
}
exports.makePatternFromSimplifiedSchema = makePatternFromSimplifiedSchema;
//# sourceMappingURL=convert-simplified.js.map