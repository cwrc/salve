/**
 * Classes that model RNG patterns.
 * @author Louis-Dominique Dubeau
 * @license MPL 2.0
 * @copyright Mangalam Research Center for Buddhist Languages
 */
import { ValidationError } from "../errors";
import { Events } from "../events";
import { NameResolver } from "../name_resolver";
import { Define } from "./define";
import { Element } from "./element";
import { RefWalker } from "./ref";
export declare type EventSet = Set<Events>;
export declare type FireEventResult = false | undefined | readonly ValidationError[];
export declare class InternalFireEventResult {
    readonly matched: boolean;
    readonly errors?: readonly ValidationError[] | undefined;
    readonly refs?: readonly RefWalker[] | undefined;
    constructor(matched: boolean, errors?: readonly ValidationError[] | undefined, refs?: readonly RefWalker[] | undefined);
    static fromEndResult(result: EndResult): InternalFireEventResult;
    combine(other: InternalFireEventResult): InternalFireEventResult;
}
export declare type EndResult = false | ValidationError[];
/**
 * These patterns form a JavaScript representation of the simplified RNG
 * tree. The base class implements a leaf in the RNG tree. In other words, it
 * does not itself refer to children Patterns. (To put it in other words, it has
 * no subpatterns.)
 */
export declare class BasePattern {
    readonly xmlPath: string;
    /**
     * @param xmlPath This is a string which uniquely identifies the element from
     * the simplified RNG tree. Used in debugging.
     */
    constructor(xmlPath: string);
    /**
     * This method must be called after resolution has been performed.
     * ``_prepare`` recursively calls children but does not traverse ref-define
     * boundaries to avoid infinite regress...
     *
     * This function now performs these tasks:
     *
     * - it precomputes the values returned by ``hasAttr``,
     *
     * - it precomputes the values returned by ``hasEmptyPattern``,
     *
     * - it gathers all the namespaces seen in the schema.
     *
     * - it resolves the references.
     *
     * @param definitions The definitions present in the schema.
     *
     * @param namespaces An object whose keys are the namespaces seen in
     * the schema. This method populates the object.
     */
    _prepare(definitions: Map<string, Define>, namespaces: Set<string>): void;
    /**
     * This method tests whether a pattern is an attribute pattern or contains
     * attribute patterns. This method does not cross element boundaries. That is,
     * if element X cannot have attributes of its own but can contain elements
     * that can have attributes, the return value if this method is called on the
     * pattern contained by element X's pattern will be ``false``.
     *
     * @returns True if the pattern is or has attributes. False if not.
     */
    hasAttrs(): boolean;
    /**
     * This method determines whether a pattern has the ``empty``
     * pattern. Generally, this means that either this pattern is the ``empty``
     * pattern or has ``empty`` as a child.
     */
    hasEmptyPattern(): boolean;
}
/**
 * This is the common class from which patterns are derived. Most patterns
 * create a new walker by passing a name resolver. The one exception is
 * [[Grammar]], which creates the name resolver that are used by other
 * patterns. So when calling it we do not need a ``resolver`` parameter and thus
 * it inherits from [[BasePattern]] rather than [[Pattern]].
 */
export declare abstract class Pattern extends BasePattern {
    /**
     * Creates a new walker to walk this pattern.
     *
     * @returns A walker.
     */
    newWalker(): InternalWalker;
}
/**
 * Pattern objects of this class have exactly one child pattern.
 */
export declare abstract class OneSubpattern<T extends (Pattern | Element) = Pattern> extends Pattern {
    readonly pat: T;
    protected _cachedHasAttrs?: boolean;
    protected _cachedHasEmptyPattern?: boolean;
    constructor(xmlPath: string, pat: T);
    _prepare(definitions: Map<string, Define>, namespaces: Set<string>): void;
    hasAttrs(): boolean;
    hasEmptyPattern(): boolean;
}
/**
 * Pattern objects of this class have exactly two child patterns.
 *
 */
export declare abstract class TwoSubpatterns extends Pattern {
    readonly patA: Pattern;
    readonly patB: Pattern;
    protected _cachedHasAttrs?: boolean;
    protected _cachedHasEmptyPattern?: boolean;
    constructor(xmlPath: string, patA: Pattern, patB: Pattern);
    protected abstract _computeHasEmptyPattern(): boolean;
    _prepare(definitions: Map<string, Define>, namespaces: Set<string>): void;
    hasAttrs(): boolean;
    hasEmptyPattern(): boolean;
}
export declare function isAttributeEvent(name: string): boolean;
/**
 * Utility function used mainly in testing to transform a set of
 * events into a string containing a tree structure.  The principle is to
 * combine events of a same type together and among events of a same type
 * combine those which are in the same namespace. So for instance if there is a
 * set of events that are all attributeName events plus one ``leaveStartTag``
 * event, the output could be:
 *
 * <pre>``
 * attributeName:
 * ..uri A:
 * ....name 1
 * ....name 2
 * ..uri B:
 * ....name 3
 * ....name 4
 * leaveStartTag
 * ``</pre>
 *
 * The dots above are to represent more visually the indentation. Actual output
 * does not contain leading dots.  In this list there are two attributeName
 * events in the "uri A" namespace and two in the "uri B" namespace.
 *
 * @param evs Events to turn into a string.
 * @returns A string which contains the tree described above.
 */
export declare function eventsToTreeString(evs: Events[] | EventSet): string;
/**
 * This is the class of all walkers that are used internally to Salve.
 */
export interface InternalWalker {
    /**
     * Passes an event to the walker for handling. The Walker will determine
     * whether it or one of its children can handle the event.
     *
     * @param name The event name.
     *
     * @param params The event parameters.
     *
     * @param nameResolver The name resolver to use to resolve names.
     *
     * @returns The value ``false`` if there was no error. The value ``undefined``
     * if no walker matches the pattern. Otherwise, an array of
     * [[ValidationError]] objects.
     */
    fireEvent(name: string, params: string[], nameResolver: NameResolver): InternalFireEventResult;
    /**
     * Flag indicating whether the walker can end.
     */
    canEnd: boolean;
    /**
     * Flag indicating whether the walker can end, in a context where
     * we are processing attributes.
     */
    canEndAttribute: boolean;
    /**
     * @returns The set of non-attribute event that can be fired without resulting
     * in an error. ``ElementWalker`` exceptionally returns all possible events,
     * including attribute events.
     */
    possible(): EventSet;
    /**
     * @returns The set of attribute events that can be fired without resulting in
     * an error. This method may not be called on ``ElementWalker``.
     */
    possibleAttributes(): EventSet;
    /**
     * End the walker.
     *
     * @returns ``false`` if the walker ended without error. Otherwise, the
     * errors.
     */
    end(): EndResult;
    /**
     * End the processing of attributes.
     *
     * @returns ``false`` if the walker ended without error. Otherwise, the
     * errors.
     */
    endAttributes(): EndResult;
    /**
     * Deep copy the Walker.
     *
     * @returns A deep copy of the Walker.
     */
    clone(): this;
}
