/**
 * Implements a name resolver for handling namespace changes in XML.
 * @author Louis-Dominique Dubeau
 * @license MPL 2.0
 * @copyright Mangalam Research Center for Buddhist Languages
 */
import { EName } from "./ename";
import { NameResolver } from "./name_resolver";
/**
 * A name resolver for handling namespace changes in XML. This name
 * resolver maintains mappings from namespace prefix to namespace URI.
 */
export declare class DefaultNameResolver implements NameResolver {
    private readonly _contextStack;
    constructor(other?: DefaultNameResolver);
    /**
     * Makes a deep copy.
     *
     * @returns A deep copy of the resolver.
     */
    clone(): this;
    /**
     * Defines a (prefix, URI) mapping.
     *
     * @param prefix The namespace prefix to associate with the URI.
     *
     * @param uri The namespace URI associated with the prefix.
     */
    definePrefix(prefix: string, uri: string): void;
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
    enterContext(): void;
    /**
     * Enter a new context, and immediately populate it with bindings. If you
     * already have a binding map, then using this method is preferable to using
     * [[enterContext]] because it is faster than doing [[enterContext]] followed
     * by a series of calls to [[definePrefix]].
     *
     * @param mapping The mapping with which to initialize the context.
     */
    enterContextWithMapping(mapping: Readonly<Record<string, string>>): void;
    /**
     * This method is called to indicate the end of a context. Whatever context
     * was in effect when the current context ends becomes effective.
     *
     * @throws {Error} If this method is called when there is no context created
     * by [[enterContext]].
     */
    leaveContext(): void;
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
    resolveName(name: string, attribute?: boolean): EName | undefined;
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
    unresolveName(uri: string, name: string): string | undefined;
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
    prefixFromURI(uri: string): string | undefined;
}
