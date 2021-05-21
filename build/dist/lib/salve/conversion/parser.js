"use strict";
/**
 * This module contains classes for a conversion parser.
 * @author Louis-Dominique Dubeau
 * @license MPL 2.0
 * @copyright Mangalam Research Center for Buddhist Languages
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.dependsOnExternalFile = exports.parseSimplifiedSchema = exports.BasicParser = exports.Validator = exports.isText = exports.isElement = exports.Text = exports.Element = void 0;
const saxes_1 = require("saxes");
const ename_1 = require("../ename");
const name_resolver_1 = require("../name_resolver");
const tools_1 = require("../tools");
const util_1 = require("./simplifier/util");
const emptyNS = Object.create(null);
/**
 * An Element produced by [[BasicParser]].
 *
 * This constructor will insert the created object into the parent automatically
 * if the parent is provided.
 */
class Element {
    /**
     * @param node The value of the ``node`` created by the SAX parser.
     *
     * @param children The children of this element. **These children must not yet
     * be children of any element.**
     */
    constructor(prefix, local, uri, ns, attributes, documentation, children) {
        this.children = children;
        this.kind = "element";
        this.prefix = prefix;
        this.local = local;
        this.uri = uri;
        // Namespace declarations are immutable.
        this.ns = ns;
        this.attributes = attributes;
        this.documentation = documentation;
        for (const child of children) {
            if (child.parent !== undefined) {
                child.parent.removeChild(child);
            }
            child.parent = this;
        }
    }
    static fromSax(node, children, documentation = "") {
        return new Element(node.prefix, node.local, node.uri, node.ns, node.attributes, documentation, children);
    }
    static makeElement(name, children, documentation = "") {
        return new Element("", name, "", 
        // We always pass the same object as ns. So we save an unnecessary object
        // creation.
        emptyNS, Object.create(null), documentation, children);
    }
    get parent() {
        return this._parent;
    }
    set parent(value) {
        this.setParent(value);
    }
    setParent(value) {
        //
        // The cost of looking for cycles is noticeable. So we should use this
        // only when debugging new code.
        //
        // let scan = value;
        // while (scan !== undefined) {
        //   if (scan === this) {
        //     throw new Error("creating reference loop!");
        //   }
        //   scan = scan.parent;
        // }
        this._path = undefined; // This becomes void.
        this._parent = value;
    }
    resolve(name) {
        if (name === "xml") {
            return name_resolver_1.XML1_NAMESPACE;
        }
        if (name === "xmlns") {
            return name_resolver_1.XMLNS_NAMESPACE;
        }
        return this._resolve(name);
    }
    _resolve(name) {
        const ret = this.ns[name];
        if (ret !== undefined) {
            return ret;
        }
        return (this.parent === undefined) ? undefined : this.parent._resolve(name);
    }
    get text() {
        // Testing for this special case does payoff.
        if (this.children.length === 1) {
            return this.children[0].text;
        }
        let ret = "";
        for (const child of this.children) {
            ret += child.text;
        }
        return ret;
    }
    /**
     * A path describing the location of the element in the XML. Note that this is
     * meant to be used **only** after the simplification is complete. The value
     * is computed once and for all as soon as it is accessed.
     */
    get path() {
        if (this._path === undefined) {
            this._path = this.makePath();
        }
        return this._path;
    }
    makePath() {
        let ret = `${(this.parent !== undefined) ? this.parent.path : ""}/${this.local}`;
        const name = this.getAttribute("name");
        if (name !== undefined) {
            // tslint:disable-next-line:no-string-literal
            ret += `[@name='${name}']`;
        }
        // Name classes are only valid on elements and attributes. So don't go
        // searching for it on other elements.
        else if (this.local === "element" || this.local === "attribute") {
            // By the time path is used, the name class is the first child.
            const first = this.children[0];
            if (isElement(first) && first.local === "name") {
                ret += `[@name='${first.text}']`;
            }
        }
        return ret;
    }
    removeChild(child) {
        // We purposely don't call removeChildAt, so as to save a call.
        //
        // We don't check whether there's an element at [0]. If not, a hard fail is
        // appropriate. It shouldn't happen.
        this.children.splice(this.indexOfChild(child), 1)[0].parent = undefined;
    }
    removeChildAt(i) {
        // We don't check whether there's an element at [0]. If not, a hard fail is
        // appropriate. It shouldn't happen.
        this.children.splice(i, 1)[0].parent = undefined;
    }
    replaceChildWith(child, replacement) {
        this.replaceChildAt(this.indexOfChild(child), replacement);
    }
    replaceChildAt(i, replacement) {
        const child = this.children[i];
        // In practice this is not a great optimization.
        //
        // if (child === replacement) {
        //   return;
        // }
        if (replacement.parent !== undefined) {
            replacement.parent.removeChild(replacement);
        }
        this.children[i] = replacement;
        child.parent = undefined;
        replacement.parent = this;
    }
    appendChild(child) {
        // It is faster to use custom code than to rely on insertAt: splice
        // operations are costly.
        if (child.parent !== undefined) {
            child.parent.removeChild(child);
        }
        child.parent = this;
        this.children.push(child);
    }
    appendChildren(children) {
        // It is faster to use custom code than to rely on insertAt: splice
        // operations are costly.
        for (const el of children) {
            if (el.parent !== undefined) {
                el.parent.removeChild(el);
            }
            el.parent = this;
        }
        this.children.push(...children);
    }
    prependChild(child) {
        // It is faster to do this than to rely on insertAt: splice operations
        // are costly.
        if (child.parent !== undefined) {
            child.parent.removeChild(child);
        }
        child.parent = this;
        this.children.unshift(child);
    }
    insertAt(index, toInsert) {
        for (const el of toInsert) {
            if (el.parent !== undefined) {
                el.parent.removeChild(el);
            }
            el.parent = this;
        }
        this.children.splice(index, 0, ...toInsert);
    }
    /**
     * Gets all the children from another element and append them to this
     * element. This is a faster operation than done through other means.
     *
     * @param src The element form which to get the children.
     */
    grabChildren(src) {
        const children = src.children.splice(0, src.children.length);
        this.children.push(...children);
        for (const child of children) {
            child.parent = this;
        }
    }
    replaceContent(children) {
        const prev = this.children.splice(0, this.children.length, ...children);
        for (const child of prev) {
            child.parent = undefined;
        }
        for (const child of children) {
            child.parent = this;
        }
    }
    indexOfChild(child) {
        const parent = child.parent;
        if (parent !== this) {
            throw new Error("the child is not a child of this");
        }
        const index = parent.children.indexOf(child);
        if (index === -1) {
            throw new Error("child not among children");
        }
        return index;
    }
    /**
     * Set an attribute on an element.
     *
     * @param name The attribute name.
     *
     * @param value The new value of the attribute.
     */
    setAttribute(name, value) {
        if (name.includes(":")) {
            throw new Error("we don't support namespaces on this function");
        }
        this.attributes[name] = {
            name,
            prefix: "",
            local: name,
            uri: "",
            value,
        };
    }
    setXMLNS(value) {
        this.attributes.xmlns = {
            name: "xmlns",
            prefix: "",
            uri: name_resolver_1.XMLNS_NAMESPACE,
            value,
            local: "xmlns",
        };
    }
    removeAttribute(name) {
        delete this.attributes[name];
    }
    getAttribute(name) {
        const attr = this.attributes[name];
        return (attr !== undefined) ? attr.value : undefined;
    }
    getRawAttributes() {
        return this.attributes;
    }
    mustGetAttribute(name) {
        const attr = this.getAttribute(name);
        if (attr === undefined) {
            throw new Error(`no attribute named ${name}`);
        }
        return attr;
    }
    clone() {
        const newAttributes = Object.create(null);
        const { attributes } = this;
        const keys = Object.keys(attributes);
        if (keys.length !== 0) {
            for (const key of keys) {
                // We do not use Object.create(null) here because there's no advantage
                // to it.
                newAttributes[key] = Object.assign({}, attributes[key]);
            }
        }
        // This switch provides a significant improvement.
        let { children } = this;
        switch (children.length) {
            case 0:
                break;
            case 1:
                children = [children[0].clone()];
                break;
            case 2:
                children = [children[0].clone(), children[1].clone()];
                break;
            default:
                // This actually does not happen in the current code.
                children = children.map(child => child.clone());
        }
        return new Element(this.prefix, this.local, this.uri, this.ns, newAttributes, this.documentation, children);
    }
}
exports.Element = Element;
class Text {
    /**
     * @param text The textual value.
     */
    constructor(text) {
        this.text = text;
        this.kind = "text";
    }
    clone() {
        return new Text(this.text);
    }
}
exports.Text = Text;
function isElement(node) {
    return node.kind === "element";
}
exports.isElement = isElement;
function isText(node) {
    return node.kind === "text";
}
exports.isText = isText;
class SaxesNameResolver {
    constructor(saxesParser) {
        this.saxesParser = saxesParser;
    }
    resolveName(name, attribute = false) {
        const colon = name.indexOf(":");
        let prefix;
        let local;
        if (colon === -1) {
            if (attribute) { // Attribute in undefined namespace
                return new ename_1.EName("", name);
            }
            // We are searching for the default namespace currently in effect.
            prefix = "";
            local = name;
        }
        else {
            prefix = name.substring(0, colon);
            local = name.substring(colon + 1);
            if (local.includes(":")) {
                throw new Error("invalid name passed to resolveName");
            }
        }
        const uri = this.saxesParser.resolve(prefix);
        if (uri !== undefined) {
            return new ename_1.EName(uri, local);
        }
        return (prefix === "") ? new ename_1.EName("", local) : undefined;
    }
    clone() {
        throw new Error("cannot clone a SaxesNameResolver");
    }
}
class Validator {
    constructor(grammar, parser) {
        /** Whether we ran into an error. */
        this.errors = [];
        this.walker = grammar.newWalker(new SaxesNameResolver(parser));
    }
    fireEvent(name, args) {
        const ret = this.walker.fireEvent(name, args);
        if (ret) {
            this.errors.push(...ret);
        }
    }
    onopentag(node) {
        const { attributes } = node;
        const keys = Object.keys(attributes);
        // Pre-allocate an array of the right size, instead of reallocating
        // a bunch of times.
        // tslint:disable-next-line:prefer-array-literal
        const params = new Array(2 + keys.length);
        params[0] = node.uri;
        params[1] = node.local;
        let ix = 2;
        for (const name of keys) {
            const { uri, local, value } = attributes[name];
            // Skip XML namespace declarations
            if (uri !== name_resolver_1.XMLNS_NAMESPACE) {
                params[ix++] = uri;
                params[ix++] = local;
                params[ix++] = value;
            }
        }
        this.fireEvent("startTagAndAttributes", params);
    }
    onclosetag(node) {
        this.fireEvent("endTag", [node.uri, node.local]);
    }
    ontext(text) {
        this.fireEvent("text", [text]);
    }
    onend() {
        const result = this.walker.end();
        if (result !== false) {
            this.errors.push(...result);
        }
    }
}
exports.Validator = Validator;
// A validator that does not validate.
class NullValidator {
    // tslint:disable-next-line:no-empty
    onopentag() { }
    // tslint:disable-next-line:no-empty
    onclosetag() { }
    // tslint:disable-next-line:no-empty
    ontext() { }
    // tslint:disable-next-line:no-empty
    onend() { }
}
/**
 * A simple parser used for loading a XML document into memory.  Parsers of this
 * class use [[Node]] objects to represent the tree of nodes.
 */
class BasicParser {
    constructor(saxesParser, validator = new NullValidator()) {
        this.saxesParser = saxesParser;
        this.validator = validator;
        this.drop = 0;
        this.isAnnotation = false;
        saxesParser.onopentag = this.onopentag.bind(this);
        saxesParser.onclosetag = this.onclosetag.bind(this);
        saxesParser.ontext = this.ontext.bind(this);
        saxesParser.onend = this.onend.bind(this);
        this.stack = [{
                // We cheat. The node field of the top level stack item won't ever be
                // accessed.
                node: undefined,
                children: [],
            }];
        this.docStack = [];
    }
    /**
     * The root of the parsed XML.
     */
    get root() {
        return this.stack[0].children.filter(isElement)[0];
    }
    onopentag(node) {
        // We have to validate the node even if we are not going to record it,
        // because RelaxNG does not allow foreign nodes everywhere.
        this.validator.onopentag(node);
        // We can skip creating Element objects for foreign nodes and their
        // children.
        if ((node.uri !== util_1.RELAXNG_URI
            && node.uri !== util_1.ANNOS_URI && node.uri !== util_1.XHTML_URI) || this.drop !== 0) {
            this.drop++;
            return;
        }
        if (node.uri === util_1.ANNOS_URI || node.uri === util_1.XHTML_URI) {
            if (!this.isAnnotation) {
                this.isAnnotation = true;
                this.docStack.push({
                    node,
                    text: "",
                });
            }
            else {
                this.drop++;
            }
        }
        else {
            this.stack.push({
                node,
                children: [],
            });
        }
    }
    onclosetag(node) {
        // We have to validate the node even if we are not going to record it,
        // because RelaxNG does not allow foreign nodes everywhere.
        this.validator.onclosetag(node);
        if (this.drop !== 0) {
            this.drop--;
            return;
        }
        if (this.isAnnotation) {
            if (this.docStack.length === 1) {
                // Annotations must be either the first child
                // or an immediate sibling of a value element
                const topNode = this.stack[this.stack.length - 1];
                const doc = this.docStack[this.docStack.length - 1].text;
                const childrenEls = topNode.children.filter(child => child.kind === "element");
                if (childrenEls.length === 0) {
                    // Assign doc to topNode if it doesn't yet have children.
                    topNode.documentation = doc;
                }
                else {
                    const lastChild = childrenEls[childrenEls.length - 1];
                    if (lastChild.local === "value") {
                        // Assign to first child if it's a value.
                        lastChild.documentation = doc;
                    }
                }
            }
            // tslint:disable-next-line: no-unused-expression
            this.docStack.pop();
            if (this.docStack.length === 0) {
                this.isAnnotation = false;
            }
        }
        else {
            // tslint:disable-next-line:no-non-null-assertion
            const { node: topNode, children, documentation } = this.stack.pop();
            this.stack[this.stack.length - 1].children
                .push(Element.fromSax(topNode, children, documentation));
        }
    }
    ontext(text) {
        this.validator.ontext(text);
        if (this.drop !== 0) {
            return;
        }
        if (this.isAnnotation) {
            this.docStack[this.docStack.length - 1].text += text;
        }
        else {
            this.stack[this.stack.length - 1].children.push(new Text(text));
        }
    }
    onend() {
        this.validator.onend();
    }
}
exports.BasicParser = BasicParser;
/**
 * This parser is specifically dedicated to the task of reading simplified Relax
 * NG schemas. In a Relax NG schema, text nodes that consist entirely of white
 * space are expendable, except in the ``param`` and ``value`` elements, where
 * they do potentially carry significant information.
 *
 * This parser strips nodes that consist entirely of white space because this
 * simplifies code that needs to process the resulting tree, but preserve those
 * nodes that are potentially significant.
 *
 * This parser does not allow elements which are not in the Relax NG namespace.
 */
class ConversionParser extends BasicParser {
    onopentag(node) {
        // tslint:disable-next-line: no-http-string
        if (node.uri !== "http://relaxng.org/ns/structure/1.0") {
            throw new Error(`node in unexpected namespace: ${node.uri}`);
        }
        super.onopentag(node);
    }
    ontext(text) {
        // We ignore text appearing before or after the top level element.
        if (this.stack.length <= 1 || this.drop !== 0) {
            return;
        }
        const top = this.stack[this.stack.length - 1];
        const local = top.node.local;
        // The parser does not allow non-RNG nodes, so we don't need to check the
        // namespace.
        const keepWhitespaceNodes = local === "param" || local === "value";
        if (keepWhitespaceNodes || text.trim() !== "") {
            super.ontext(text);
        }
    }
}
function parseSimplifiedSchema(fileName, simplifiedSchema) {
    const convParser = new ConversionParser(new saxes_1.SaxesParser({ xmlns: true,
        position: false,
        fileName }));
    convParser.saxesParser.write(simplifiedSchema).close();
    return convParser.root;
}
exports.parseSimplifiedSchema = parseSimplifiedSchema;
// Exception used to terminate the saxes parser early.
class Found extends Error {
    constructor() {
        super();
        tools_1.fixPrototype(this, Found);
    }
}
class IncludeParser {
    constructor(saxesParser) {
        this.saxesParser = saxesParser;
        saxesParser.onopentag = this.onopentag.bind(this);
    }
    onopentag(node) {
        // tslint:disable-next-line:no-http-string
        if (node.uri === "http://relaxng.org/ns/structure/1.0" &&
            (node.local === "include" || node.local === "externalRef")) {
            throw new Found(); // Stop early.
        }
    }
}
/**
 * Determine whether an RNG file depends on another file either through the use
 * of ``include`` or ``externalRef``.
 *
 * @param rng The RNG file to check.
 *
 * @returns ``true`` if dependent, ``false`` if not.
 */
function dependsOnExternalFile(rng) {
    const parser = new IncludeParser(new saxes_1.SaxesParser({ xmlns: true, position: false }));
    let found = false;
    try {
        parser.saxesParser.write(rng).close();
    }
    catch (ex) {
        if (!(ex instanceof Found)) {
            throw ex;
        }
        found = true;
    }
    return found;
}
exports.dependsOnExternalFile = dependsOnExternalFile;
//  LocalWords:  MPL NG param RNG
//# sourceMappingURL=parser.js.map