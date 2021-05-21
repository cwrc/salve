/**
 * @author Louis-Dominique Dubeau
 * @license MPL 2.0
 * @copyright Mangalam Research Center for Buddhist Languages
 */
/**
 * Base class for all name patterns.
 */
export declare abstract class Base {
    abstract readonly kind: string;
    private _asString?;
    /**
     * Tests whether the pattern matches a name.
     *
     * @param ns The namespace to match.
     * @param name The name to match.
     * @returns ``true`` if there is a match.
     */
    abstract match(ns: string, name: string): boolean;
    /**
     * Test whether a pattern intersects another pattern. Two pattern intersect if
     * there exist a name that can be matched by both.
     *
     * @param other The other pattern to check.
     */
    abstract intersects(other: ConcreteName): boolean;
    /**
     * Computes the intersection of two patterns.
     *
     * @param other The other pattern to check.
     *
     * @returns 0 if the intersection is the empty set. Otherwise, a ConcreteName
     * representing the intersection.
     */
    abstract intersection(other: ConcreteName | 0): ConcreteName | 0;
    /**
     * Tests whether the pattern matches a name and this match is due only to a
     * wildcard match (``nsName`` or ``anyName``).
     *
     * @param ns The namespace to match.
     * @param name The name to match.
     *
     * @returns ``true`` if there is a match **and** the match is due only to a
     * wildcard match. If there is a choice between matching with a wildcard and
     * matching with a regular ``name`` pattern, this will return false because of
     * the ``name`` pattern.
     */
    abstract wildcardMatch(ns: string, name: string): boolean;
    /**
     * Determines whether a pattern is simple or not. A pattern is deemed simple
     * if it does not use ``<except>``, ``<anyName>`` or ``<NsName>``.  Put in
     * practical terms, non-simple patterns cannot generally be presented as a
     * list of choices to the user. In most cases, the appropriate input from the
     * user should be obtained by presenting an input field in which the user can
     * type the namespace and name of the entity to be named and the GUI reports
     * whether the name is allowed or not by the schema.
     *
     * @returns  ``true`` if the pattern is simple.
     */
    abstract simple(): boolean;
    /**
     * Gets the list of namespaces used in the pattern. An ``::except`` entry
     * indicates that there are exceptions in the pattern. A ``*`` entry indicates
     * that any namespace is allowed.
     *
     * This method should be used by client code to help determine how to prompt
     * the user for a namespace. If the return value is a list without
     * ``::except`` or ``*``, the client code knows there is a finite list of
     * namespaces expected, and what the possible values are. So it could present
     * the user with a choice from the set. If ``::except`` or ``*`` appears in
     * the list, then a different strategy must be used.
     *
     * @returns The list of namespaces.
     */
    getNamespaces(): string[];
    /**
     * This is public due to limitations in how TypeScript works. You should never
     * call this function directly.
     *
     * @param namespaces A map in which to record namespaces.
     *
     * @param recordEmpty Whether to record an empty namespace in the map.
     */
    abstract _recordNamespaces(namespaces: Set<string>, recordEmpty: boolean): void;
    /**
     * Represent the name pattern as a plain object. The object returned contains
     * a ``pattern`` field which has the name of the JavaScript class that was
     * used to create the object. Other fields are present, depending on the
     * actual needs of the class.
     *
     * @returns The object representing the instance.
     */
    abstract toObject(): any;
    /**
     * Alias of [[Base.toObject]].
     *
     * ``toJSON`` is a misnomer, as the data returned is not JSON but a JavaScript
     * object. This method exists so that ``JSON.stringify`` can use it.
     */
    toJSON(): any;
    /**
     * Returns an array of [[Name]] objects which is a list of all
     * the possible names that this pattern allows.
     *
     * @returns An array of names. The value ``null`` is returned if the pattern
     * is not simple.
     */
    abstract toArray(): Name[] | null;
    /**
     * Stringify the pattern to a JSON string.
     *
     * @returns The stringified instance.
     */
    toString(): string;
    protected abstract asString(): string;
}
export declare type ConcreteName = Name | NameChoice | NsName | AnyName;
export declare function isName(name: ConcreteName): name is Name;
export declare function isNameChoice(name: ConcreteName): name is NameChoice;
export declare function isNsName(name: ConcreteName): name is NsName;
export declare function isAnyName(name: ConcreteName): name is AnyName;
/**
 * Models the Relax NG ``<name>`` element.
 *
 */
export declare class Name extends Base {
    readonly ns: string;
    readonly name: string;
    readonly documentation?: string | undefined;
    readonly kind: "Name";
    /**
     * @param ns The namespace URI for this name. Corresponds to the
     * ``ns`` attribute in the simplified Relax NG syntax.
     *
     * @param name The name. Corresponds to the content of ``<name>``
     * in the simplified Relax NG syntax.
     *
     * @param documentation Attached documentation if available.
     */
    constructor(ns: string, name: string, documentation?: string | undefined);
    match(ns: string, name: string): boolean;
    intersects(other: ConcreteName): boolean;
    intersection(other: ConcreteName | 0): ConcreteName | 0;
    wildcardMatch(ns: string, name: string): false;
    toObject(): {
        ns: string;
        name: string;
        documentation: string | undefined;
    };
    asString(): string;
    simple(): true;
    toArray(): Name[];
    _recordNamespaces(namespaces: Set<string>, recordEmpty: boolean): void;
}
/**
 * Models the Relax NG ``<choice>`` element when it appears in a name
 * class.
 */
export declare class NameChoice extends Base {
    readonly a: ConcreteName;
    readonly b: ConcreteName;
    readonly kind: "NameChoice";
    /**
     * @param a The first choice.
     *
     * @param b The second choice.
     */
    constructor(a: ConcreteName, b: ConcreteName);
    /**
     * Makes a tree of NameChoice objects out of a list of names.
     *
     * @param names The names from which to build a tree.
     *
     * @return If the list is a single name, then just that name. Otherwise,
     * the names from the list in a tree of [[NameChoice]].
     */
    static makeTree(names: ConcreteName[]): ConcreteName;
    match(ns: string, name: string): boolean;
    intersects(other: ConcreteName): boolean;
    intersection(other: ConcreteName | 0): ConcreteName | 0;
    /**
     * Recursively apply a transformation to a NameChoice tree.
     *
     * @param fn The transformation to apply. It may return 0 to indicate that the
     * child has been transformed to the empty set.
     *
     * @returns The transformed tree, or 0 if the tree has been transformed to
     * nothing.
     */
    applyRecursively(fn: (child: Name | NsName | AnyName) => ConcreteName | 0): ConcreteName | 0;
    wildcardMatch(ns: string, name: string): boolean;
    toObject(): {
        a: any;
        b: any;
    };
    asString(): string;
    simple(): boolean;
    toArray(): Name[] | null;
    _recordNamespaces(namespaces: Set<string>, recordEmpty: boolean): void;
}
/**
 * Models the Relax NG ``<nsName>`` element.
 */
export declare class NsName extends Base {
    readonly ns: string;
    readonly except?: Name | NameChoice | NsName | AnyName | undefined;
    readonly kind: "NsName";
    /**
     * @param ns The namespace URI for this name. Corresponds to the ``ns``
     * attribute in the simplified Relax NG syntax.
     *
     * @param except Corresponds to an ``<except>`` element appearing as a child
     * of the ``<nsName>`` element in the Relax NG schema.
     */
    constructor(ns: string, except?: Name | NameChoice | NsName | AnyName | undefined);
    match(ns: string, name: string): boolean;
    intersects(other: ConcreteName): boolean;
    intersection(other: ConcreteName | 0): ConcreteName | 0;
    /**
     * Subtract a [[Name]] or [[NsName]] from this one, or a [[NameChoice]] that
     * contains only a mix of these two. We support subtracting only these two
     * types because only these two cases are required by Relax NG.
     *
     * @param other The object to subtract from this one.
     *
     * @returns An object that represents the subtraction. If the result is the
     * empty set, 0 is returned.
     */
    subtract(other: Name | NsName | NameChoice): ConcreteName | 0;
    wildcardMatch(ns: string, name: string): boolean;
    toObject(): {
        ns: string;
        except?: any;
    };
    asString(): string;
    simple(): false;
    toArray(): null;
    _recordNamespaces(namespaces: Set<string>, recordEmpty: boolean): void;
}
/**
 * Models the Relax NG ``<anyName>`` element.
 */
export declare class AnyName extends Base {
    readonly except?: Name | NameChoice | NsName | AnyName | undefined;
    readonly kind: "AnyName";
    /**
     * @param except Corresponds to an ``<except>`` element appearing as a child
     * of the ``<anyName>`` element in the Relax NG schema.
     */
    constructor(except?: Name | NameChoice | NsName | AnyName | undefined);
    match(ns: string, name: string): boolean;
    intersects(other: ConcreteName): boolean;
    intersection(other: ConcreteName | 0): ConcreteName | 0;
    wildcardMatch(ns: string, name: string): boolean;
    toObject(): {
        pattern: "AnyName";
        except?: any;
    };
    asString(): string;
    simple(): false;
    toArray(): null;
    _recordNamespaces(namespaces: Set<string>, _recordEmpty: boolean): void;
}
