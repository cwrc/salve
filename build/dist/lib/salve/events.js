"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextEvent = exports.AttributeValueEvent = exports.ValueEvent = exports.AttributeNameEvent = exports.EndTagEvent = exports.LeaveStartTagEvent = exports.EnterStartTagEvent = exports.NamePatternEvent = exports.Event = void 0;
/**
 * This is the class that events **returned** by salve derive from. This class
 * is entirely abstract but it can still be use for instanceof tests.
 */
class Event {
}
exports.Event = Event;
/**
 * A class for events that take a name pattern as parameter.
 */
class NamePatternEvent extends Event {
    constructor(name, namePattern) {
        super();
        this.name = name;
        this.namePattern = namePattern;
    }
    get param() {
        return this.namePattern;
    }
    get params() {
        return [this.name, this.namePattern];
    }
    equals(other) {
        return this.name === other.name && this.namePattern.toString() ===
            other.namePattern.toString();
    }
    toString() {
        return `Event: ${this.name}, ${this.namePattern}`;
    }
}
exports.NamePatternEvent = NamePatternEvent;
class EnterStartTagEvent extends NamePatternEvent {
    constructor(namePattern) {
        super("enterStartTag", namePattern);
        this.isAttributeEvent = false;
    }
}
exports.EnterStartTagEvent = EnterStartTagEvent;
class LeaveStartTagEvent extends Event {
    constructor() {
        super(...arguments);
        this.name = "leaveStartTag";
        this.isAttributeEvent = false;
        this.param = null;
    }
    get params() {
        return ["leaveStartTag"];
    }
    equals(other) {
        return this.name === other.name;
    }
    toString() {
        return `Event: ${this.name}`;
    }
}
exports.LeaveStartTagEvent = LeaveStartTagEvent;
class EndTagEvent extends NamePatternEvent {
    constructor(namePattern) {
        super("endTag", namePattern);
        this.isAttributeEvent = false;
    }
}
exports.EndTagEvent = EndTagEvent;
class AttributeNameEvent extends NamePatternEvent {
    constructor(namePattern) {
        super("attributeName", namePattern);
        this.isAttributeEvent = true;
    }
}
exports.AttributeNameEvent = AttributeNameEvent;
/**
 * A class for events that take a string or regexp value as parameter.
 */
class ValueEvent extends Event {
    constructor(name, value, documentation) {
        super();
        this.name = name;
        this.value = value;
        this.documentation = documentation;
    }
    get params() {
        return [this.name, this.value];
    }
    get param() {
        return this.value;
    }
    equals(other) {
        return this.name === other.name && this.value.toString() ===
            other.value.toString();
    }
    toString() {
        return `Event: ${this.name}, ${this.value}`;
    }
}
exports.ValueEvent = ValueEvent;
class AttributeValueEvent extends ValueEvent {
    constructor(value, documentation) {
        super("attributeValue", value, documentation);
        this.isAttributeEvent = true;
    }
}
exports.AttributeValueEvent = AttributeValueEvent;
class TextEvent extends ValueEvent {
    constructor(value, documentation) {
        super("text", value, documentation);
        this.isAttributeEvent = false;
    }
}
exports.TextEvent = TextEvent;
//# sourceMappingURL=events.js.map