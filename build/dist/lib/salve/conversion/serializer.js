"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serialize = void 0;
/**
 * Serialize a tree previously produced by [["conversion/parser".BasicParser]].
 *
 * @param tree The tree to serialize.
 *
 * @param options Options specifying how to perform the serialization.
 *
 * @returns The serialized tree.
 */
function serialize(tree, options = {}) {
    const normalized = {
        prettyPrint: options.prettyPrint === true,
    };
    let out = `<?xml version="1.0"?>\n${_serialize(false, "", tree, normalized)}`;
    if (out[out.length - 1] !== "\n") {
        out += "\n";
    }
    return out;
}
exports.serialize = serialize;
/**
 * Escape characters that cannot be represented literally in XML.
 *
 * @param text The text to escape.
 *
 * @param isAttr Whether the text is part of an attribute.
 *
 * @returns The escaped text.
 */
function escape(text, isAttr) {
    // Even though the > escape is not *mandatory* in all cases, we still do it
    // everywhere.
    let ret = text.replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    if (isAttr) {
        ret = ret.replace(/"/g, "&quot;");
    }
    return ret;
}
/**
 * Serialize an element and its children, recursively.
 *
 * @param mixed Whether or not the element being converted is in mixed contents.
 *
 * @param curIndent The current indentation. This is represented as a string of
 * white spaces.
 *
 * @param el The element to serialize.
 *
 * @param options Options specifying how to perform the serialization.
 *
 * @returns The serialization.
 */
function _serialize(mixed, curIndent, el, options) {
    let buf = "";
    buf += `${curIndent}<${el.local}`;
    const attrs = el.getRawAttributes();
    const names = Object.keys(attrs);
    names.sort();
    for (const name of names) {
        buf += ` ${name}="${escape(el.mustGetAttribute(name), true)}"`;
    }
    if (el.children.length === 0) {
        buf += "/>";
    }
    else {
        let childrenMixed = false;
        for (const child of el.children) {
            if (child.kind === "text") {
                childrenMixed = true;
                break;
            }
        }
        buf += ">";
        if (options.prettyPrint && !childrenMixed) {
            buf += "\n";
        }
        const childIndent = options.prettyPrint ? `${curIndent}  ` : "";
        for (const child of el.children) {
            buf += child.kind === "text" ? escape(child.text, false) :
                _serialize(childrenMixed, childIndent, child, options);
        }
        if (!childrenMixed) {
            buf += curIndent;
        }
        buf += `</${el.local}>`;
    }
    if (options.prettyPrint && !mixed) {
        buf += "\n";
    }
    return buf;
}
//# sourceMappingURL=serializer.js.map