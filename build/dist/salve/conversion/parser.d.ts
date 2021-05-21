/**
 * This module contains classes for a conversion parser.
 * @author Louis-Dominique Dubeau
 * @license MPL 2.0
 * @copyright Mangalam Research Center for Buddhist Languages
 */
import { SaxesAttribute, SaxesParser, SaxesTag } from "saxes";
import { ValidationError } from "../errors";
import { Grammar } from "../patterns";
export declare type ConcreteNode = Element | Text;
/**
 * An Element produced by [[BasicParser]].
 *
 * This constructor will insert the created object into the parent automatically
 * if the parent is provided.
 */
export declare class Element {
    readonly children: ConcreteNode[];
    readonly kind: "element";
    /**
     * The path of the element in its tree.
     */
    private _path;
    private _parent;
    prefix: string;
    local: string;
    uri: string;
    documentation: string | undefined;
    private readonly ns;
    attributes: Record<string, SaxesAttribute>;
    /**
     * @param node The value of the ``node`` created by the SAX parser.
     *
     * @param children The children of this element. **These children must not yet
     * be children of any element.**
     */
    constructor(prefix: string, local: string, uri: string, ns: Record<string, string>, attributes: Record<string, SaxesAttribute>, documentation: string | undefined, children: ConcreteNode[]);
    static fromSax(node: SaxesTag, children: ConcreteNode[], documentation?: string): Element;
    static makeElement(name: string, children: ConcreteNode[], documentation?: string): Element;
    get parent(): Element | undefined;
    set parent(value: Element | undefined);
    setParent(value: Element | undefined): void;
    resolve(name: string): string | undefined;
    _resolve(name: string): string | undefined;
    get text(): string;
    /**
     * A path describing the location of the element in the XML. Note that this is
     * meant to be used **only** after the simplification is complete. The value
     * is computed once and for all as soon as it is accessed.
     */
    get path(): string;
    private makePath;
    removeChild(child: ConcreteNode): void;
    removeChildAt(i: number): void;
    replaceChildWith(child: ConcreteNode, replacement: ConcreteNode): void;
    replaceChildAt(i: number, replacement: ConcreteNode): void;
    appendChild(child: ConcreteNode): void;
    appendChildren(children: ConcreteNode[]): void;
    prependChild(child: ConcreteNode): void;
    insertAt(index: number, toInsert: ConcreteNode[]): void;
    /**
     * Gets all the children from another element and append them to this
     * element. This is a faster operation than done through other means.
     *
     * @param src The element form which to get the children.
     */
    grabChildren(src: Element): void;
    replaceContent(children: ConcreteNode[]): void;
    protected indexOfChild(this: ConcreteNode, child: ConcreteNode): number;
    /**
     * Set an attribute on an element.
     *
     * @param name The attribute name.
     *
     * @param value The new value of the attribute.
     */
    setAttribute(name: string, value: string): void;
    setXMLNS(value: string): void;
    removeAttribute(name: string): void;
    getAttribute(name: string): string | undefined;
    getRawAttributes(): Record<string, SaxesAttribute>;
    mustGetAttribute(name: string): string;
    clone(): Element;
}
export declare class Text {
    readonly text: string;
    readonly kind: "text";
    parent: Element | undefined;
    /**
     * @param text The textual value.
     */
    constructor(text: string);
    clone(): Text;
}
export declare function isElement(node: ConcreteNode): node is Element;
export declare function isText(node: ConcreteNode): node is Text;
export interface ValidatorI {
    onopentag(node: SaxesTag): void;
    onclosetag(node: SaxesTag): void;
    ontext(text: string): void;
    onend(): void;
}
export declare class Validator implements ValidatorI {
    /** Whether we ran into an error. */
    readonly errors: ValidationError[];
    /** The walker used for validating. */
    private readonly walker;
    constructor(grammar: Grammar, parser: SaxesParser);
    protected fireEvent(name: string, args: string[]): void;
    onopentag(node: SaxesTag): void;
    onclosetag(node: SaxesTag): void;
    ontext(text: string): void;
    onend(): void;
}
/**
 * A simple parser used for loading a XML document into memory.  Parsers of this
 * class use [[Node]] objects to represent the tree of nodes.
 */
export declare class BasicParser {
    readonly saxesParser: SaxesParser;
    protected readonly validator: ValidatorI;
    /**
     * The stack of elements. At the end of parsing, there should be only one
     * element on the stack, the root. This root is not an element that was in
     * the XML file but a holder for the tree of elements. It has a single child
     * which is the root of the actual file parsed.
     */
    protected readonly stack: {
        node: SaxesTag;
        children: ConcreteNode[];
        documentation?: string;
    }[];
    protected readonly docStack: {
        node: SaxesTag;
        text: string;
    }[];
    protected drop: number;
    protected isAnnotation: boolean;
    constructor(saxesParser: SaxesParser, validator?: ValidatorI);
    /**
     * The root of the parsed XML.
     */
    get root(): Element;
    onopentag(node: SaxesTag): void;
    onclosetag(node: SaxesTag): void;
    ontext(text: string): void;
    onend(): void;
}
export declare function parseSimplifiedSchema(fileName: string, simplifiedSchema: string): Element;
/**
 * Determine whether an RNG file depends on another file either through the use
 * of ``include`` or ``externalRef``.
 *
 * @param rng The RNG file to check.
 *
 * @returns ``true`` if dependent, ``false`` if not.
 */
export declare function dependsOnExternalFile(rng: string): boolean;
