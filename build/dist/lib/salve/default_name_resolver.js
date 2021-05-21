"use strict";
/**
 * Implements a name resolver for handling namespace changes in XML.
 * @author Louis-Dominique Dubeau
 * @license MPL 2.0
 * @copyright Mangalam Research Center for Buddhist Languages
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultNameResolver = void 0;
const ename_1 = require("./ename");
const name_resolver_1 = require("./name_resolver");
/**
 * A name resolver for handling namespace changes in XML. This name
 * resolver maintains mappings from namespace prefix to namespace URI.
 */
class DefaultNameResolver {
    constructor(other) {
        if (other !== undefined) {
            this._contextStack = other._contextStack.slice();
        }
        else {
            // Both namespaces defined at:
            // http://www.w3.org/TR/REC-xml-names/#ns-decl
            // Skip definePrefix for these initial values.
            this._contextStack = [{
                    forward: new Map([["xml", name_resolver_1.XML1_NAMESPACE],
                        ["xmlns", name_resolver_1.XMLNS_NAMESPACE]]),
                    backwards: new Map([[name_resolver_1.XML1_NAMESPACE, ["xml"]],
                        [name_resolver_1.XMLNS_NAMESPACE, ["xmlns"]]]),
                }];
        }
    }
    /**
     * Makes a deep copy.
     *
     * @returns A deep copy of the resolver.
     */
    clone() {
        return new DefaultNameResolver(this);
    }
    /**
     * Defines a (prefix, URI) mapping.
     *
     * @param prefix The namespace prefix to associate with the URI.
     *
     * @param uri The namespace URI associated with the prefix.
     */
    definePrefix(prefix, uri) {
        // http://www.w3.org/TR/REC-xml-names/#ns-decl
        if (prefix === "xmlns") {
            throw new Error("trying to define 'xmlns' but the XML Namespaces " +
                "standard stipulates that 'xmlns' cannot be " +
                "declared (= \"defined\")");
        }
        if (prefix === "xml" && uri !== name_resolver_1.XML1_NAMESPACE) {
            throw new Error("trying to define 'xml' to an incorrect URI");
        }
        const top = this._contextStack[this._contextStack.length - 1];
        top.forward.set(prefix, uri);
        let prefixes = top.backwards.get(uri);
        if (prefixes === undefined) {
            prefixes = [prefix];
            top.backwards.set(uri, prefixes);
        }
        // This ensure that the default namespace is given priority when
        // unresolving names.
        else if (prefix === "") {
            prefixes.unshift("");
        }
        else {
            prefixes.push(prefix);
        }
    }
    /**
     * This method is called to indicate the start of a new context.  Contexts
     * enable this class to support namespace redeclarations. In XML, each start
     * tag can potentially redefine a prefix that was already defined by an
     * ancestor. When using this class, such redefinition must appear in a new
     * context, otherwise it would merely overwrite the old definition.
     *
     * See also [[enterContextWithMapping]], which is preferable if you already
     * know the bindings you need to initialize the context with.
     *
     * At creation, a [[NameResolver]] has a default context already
     * created. There is no need to create it and it is not possible to leave it.
     */
    enterContext() {
        this._contextStack.push({
            forward: new Map(),
            backwards: new Map(),
        });
    }
    /**
     * Enter a new context, and immediately populate it with bindings. If you
     * already have a binding map, then using this method is preferable to using
     * [[enterContext]] because it is faster than doing [[enterContext]] followed
     * by a series of calls to [[definePrefix]].
     *
     * @param mapping The mapping with which to initialize the context.
     */
    enterContextWithMapping(mapping) {
        // http://www.w3.org/TR/REC-xml-names/#ns-decl
        if (mapping.xmlns !== undefined) {
            throw new Error("trying to define 'xmlns' but the XML Namespaces " +
                "standard stipulates that 'xmlns' cannot be " +
                "declared (= \"defined\")");
        }
        const xmlMapping = mapping.xml;
        if (xmlMapping !== undefined && xmlMapping !== name_resolver_1.XML1_NAMESPACE) {
            throw new Error("trying to define 'xml' to an incorrect URI");
        }
        const forward = new Map();
        const backwards = new Map();
        for (const prefix of Object.keys(mapping)) {
            const uri = mapping[prefix];
            forward.set(prefix, uri);
            let prefixes = backwards.get(uri);
            if (prefixes === undefined) {
                prefixes = [prefix];
                backwards.set(uri, prefixes);
            }
            // This ensure that the default namespace is given priority when
            // unresolving names.
            else if (prefix === "") {
                prefixes.unshift("");
            }
            else {
                prefixes.push(prefix);
            }
        }
        this._contextStack.push({ forward, backwards });
    }
    /**
     * This method is called to indicate the end of a context. Whatever context
     * was in effect when the current context ends becomes effective.
     *
     * @throws {Error} If this method is called when there is no context created
     * by [[enterContext]].
     */
    leaveContext() {
        if (this._contextStack.length > 1) {
            this._contextStack.pop();
        }
        else {
            throw new Error("trying to leave the default context");
        }
    }
    /**
     * Resolves a qualified name to an expanded name. A qualified name is an XML
     * name optionally prefixed by a namespace prefix. For instance, in ``<html
     * xml:lang="en">``, "html" is a name without a prefix, and "xml:lang" is a
     * name with the "xml" prefix. An expanded name is a (URI, name) pair.
     *
     * @param name The name to resolve.
     *
     * @param attribute Whether this name appears as an attribute.
     *
     * @throws {Error} If the name is malformed. For instance, a name with two
     * colons would be malformed.
     *
     * @returns The expanded name, or ``undefined`` if the name cannot be
     * resolved.
     */
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
            prefix = name.substr(0, colon);
            local = name.substr(colon + 1);
            if (local.includes(":")) {
                throw new Error("invalid name passed to resolveName");
            }
        }
        // Search through the contexts.
        for (let ix = this._contextStack.length - 1; ix >= 0; --ix) {
            const context = this._contextStack[ix];
            const uri = context.forward.get(prefix);
            if (uri !== undefined) {
                return new ename_1.EName(uri, local);
            }
        }
        // If we get here uri is necessarily undefined.
        return (prefix === "") ? new ename_1.EName("", local) : undefined;
    }
    /**
     * Unresolves an expanded name to a qualified name. An expanded name is a
     * (URI, name) pair. Note that if we execute:
     *
     * <pre>
     *   var nameResolver = new NameResolver();
     *   var ename = nameResolver.resolveName(qname);
     *   var qname2 = nameResolver.unresolveName(ename.ns, ename.name);
     * </pre>
     *
     * then ``qname === qname2`` is not necessarily true. This would happen if two
     * prefixes map to the same URI. In such case the prefix provided in the
     * return value is arbitrarily chosen.
     *
     * @param uri The URI part of the expanded name. An empty string is
     * valid, and basically means "no namespace". This occurs for unprefixed
     * attributes but could also happen if the default namespace is undeclared.
     *
     * @param  name The name part.
     *
     * @returns The qualified name that corresponds to the expanded name, or
     * ``undefined`` if it cannot be resolved.
     */
    unresolveName(uri, name) {
        if (uri === "") {
            return name;
        }
        // Search through the contexts.
        let prefixes;
        for (let cIx = this._contextStack.length - 1; (prefixes === undefined) && (cIx >= 0); --cIx) {
            prefixes = this._contextStack[cIx].backwards.get(uri);
        }
        if (prefixes === undefined) {
            return undefined;
        }
        const pre = prefixes[0];
        return (pre !== "") ? `${pre}:${name}` : name;
    }
    /**
     * Returns a prefix that, in the current context, is mapped to the URI
     * specified. Note that this function will return the first prefix that
     * satisfies the requirement, starting from the innermost context.
     *
     * @param uri A URI for which to get a prefix.
     *
     * @returns A prefix that maps to this URI. Undefined if there is no prefix
     * available.
     */
    prefixFromURI(uri) {
        let prefixes;
        for (let cIx = this._contextStack.length - 1; (prefixes === undefined) && (cIx >= 0); --cIx) {
            prefixes = this._contextStack[cIx].backwards.get(uri);
        }
        if (prefixes === undefined) {
            return undefined;
        }
        return prefixes[0];
    }
}
exports.DefaultNameResolver = DefaultNameResolver;
//  LocalWords:  unprefixed nameResolver pre definePrefix Unresolves qname vm
//  LocalWords:  redeclarations newID ename lang html NameResolver Mangalam uri
//  LocalWords:  xmlns URI Dubeau resolveName xml MPL unresolving namespace
//# sourceMappingURL=default_name_resolver.js.map