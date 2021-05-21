import { NameResolver } from "../name_resolver";
import { TrivialMap } from "../types";
import { BasePattern, EndResult, EventSet, FireEventResult, Pattern } from "./base";
import { Define } from "./define";
import { Element } from "./element";
/**
 * Grammar object. Users of this library normally do not create objects of this
 * class themselves but rely on the conversion facilities of salve to create
 * these objects.
 */
export declare class Grammar extends BasePattern {
    xmlPath: string;
    start: Pattern;
    private readonly definitions;
    private _elementDefinitions;
    private _namespaces;
    /**
     * @param xmlPath This is a string which uniquely identifies the
     * element from the simplified RNG tree. Used in debugging.
     *
     * @param start The start pattern of this grammar.
     *
     * @param definitions An array which contain all definitions specified in this
     * grammar.
     *
     * @throws {Error} When any definition in the original
     * schema refers to a schema entity which is not defined in the schema.
     */
    constructor(xmlPath: string, start: Pattern, definitions?: Define[]);
    /**
     * Adds a definition.
     *
     * @param d The definition to add.
     */
    add(d: Define): void;
    get elementDefinitions(): TrivialMap<Element[]>;
    /**
     * @returns ``true`` if the schema is wholly context independent. This means
     * that each element in the schema can be validated purely on the basis of
     * knowing its expanded name. ``false`` otherwise.
     */
    whollyContextIndependent(): boolean;
    /**
     * @returns An array of all namespaces used in the schema.  The array may
     * contain two special values: ``*`` indicates that there was an ``anyName``
     * element in the schema and thus that it is probably possible to insert more
     * than the namespaces listed in the array, ``::except`` indicates that an
     * ``except`` element is affecting what namespaces are acceptable to the
     * schema.
     */
    getNamespaces(): string[];
    _prepare(definitions: Map<string, Define>, namespaces: Set<string>): void;
    /**
     * Creates a new walker to walk this pattern.
     *
     * @returns A walker.
     */
    newWalker<NR extends NameResolver>(nameResolver: NR): GrammarWalker<NR>;
}
/**
 * Walker for [[Grammar]].
 */
export declare class GrammarWalker<NR extends NameResolver> {
    protected readonly el: Grammar;
    readonly nameResolver: NR;
    private elementWalkerStack;
    private misplacedDepth;
    private _swallowAttributeValue;
    private suspendedWs;
    private ignoreNextWs;
    private constructor();
    static make<NR extends NameResolver>(el: Grammar, nameResolver: NR): GrammarWalker<NR>;
    clone(): this;
    /**
     * On a [[GrammarWalker]] this method cannot return ``undefined``. An
     * undefined value would mean nothing matched, which is a validation error.
     *
     * @param name The event name.
     *
     * @param params The event parameters.
     *
     * @returns ``false`` if there is no error or an array errors.
     *
     * @throws {Error} When trying to process an event type unknown to salve.
     */
    fireEvent(name: string, params: string[]): FireEventResult;
    private diagnose;
    private _fireSuspendedWsOnCurrentWalkers;
    private _fireOnCurrentWalkers;
    private _processRefs;
    canEnd(): boolean;
    end(): EndResult;
    possible(): EventSet;
}
