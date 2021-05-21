/**
 * Classes that model possible events.
 * @author Louis-Dominique Dubeau
 * @license MPL 2.0
 * @copyright Mangalam Research Center for Buddhist Languages
 */
import { ConcreteName } from "./name_patterns";
/**
 * This is the class that events **returned** by salve derive from. This class
 * is entirely abstract but it can still be use for instanceof tests.
 */
export declare abstract class Event {
    /**
     * The event name. All concrete classes deriving from this class must have a
     * unique name per class. That is, objects of two different classes have
     * different names, and all objects of the same class have the same name. The
     * logic below and elsewhere relies on this contract.
     */
    abstract readonly name: string;
    /** The event parameter. This is null if the event has no parameter. */
    abstract readonly param: string | ConcreteName | RegExp | null;
    /** Whether it is an attribute event. */
    abstract readonly isAttributeEvent: boolean;
    /**
     * The event parameters. This consists of the event name, followed by
     * the rest of the parameters making up the event.
     *
     * @deprecated This field will be removed in a future major release.
     */
    abstract readonly params: [string] | [string, string | ConcreteName | RegExp];
    /**
     * Determine if this event is equal to another. Two events are deemed equal if
     * they are of the same class, and have equal [[param]].
     *
     *
     * @param other The other event.
     *
     * @returns Whether the events are equal.
     */
    abstract equals(other: Event): boolean;
    /**
     * Provide a specialized string representation of the event.
     */
    abstract toString(): string;
}
/**
 * A class for events that take a name pattern as parameter.
 */
export declare abstract class NamePatternEvent<Name extends string> extends Event {
    readonly name: Name;
    readonly namePattern: ConcreteName;
    protected constructor(name: Name, namePattern: ConcreteName);
    get param(): ConcreteName;
    get params(): [Name, ConcreteName];
    equals(other: Event): boolean;
    toString(): string;
}
export declare class EnterStartTagEvent extends NamePatternEvent<"enterStartTag"> {
    readonly isAttributeEvent: false;
    constructor(namePattern: ConcreteName);
}
export declare class LeaveStartTagEvent extends Event {
    readonly name: "leaveStartTag";
    readonly isAttributeEvent: false;
    readonly param: null;
    get params(): ["leaveStartTag"];
    equals(other: Event): boolean;
    toString(): string;
}
export declare class EndTagEvent extends NamePatternEvent<"endTag"> {
    readonly isAttributeEvent: false;
    constructor(namePattern: ConcreteName);
}
export declare class AttributeNameEvent extends NamePatternEvent<"attributeName"> {
    readonly isAttributeEvent: true;
    constructor(namePattern: ConcreteName);
}
/**
 * A class for events that take a string or regexp value as parameter.
 */
export declare abstract class ValueEvent<Name extends string> extends Event {
    readonly name: Name;
    readonly value: string | RegExp;
    readonly documentation?: string | undefined;
    protected constructor(name: Name, value: string | RegExp, documentation?: string | undefined);
    get params(): [Name, string | RegExp];
    get param(): string | RegExp;
    equals(other: Event): boolean;
    toString(): string;
}
export declare class AttributeValueEvent extends ValueEvent<"attributeValue"> {
    readonly isAttributeEvent: true;
    constructor(value: string | RegExp, documentation?: string);
}
export declare class TextEvent extends ValueEvent<"text"> {
    readonly isAttributeEvent: false;
    constructor(value: string | RegExp, documentation?: string);
}
export declare type Events = EnterStartTagEvent | LeaveStartTagEvent | EndTagEvent | AttributeNameEvent | AttributeValueEvent | TextEvent;
