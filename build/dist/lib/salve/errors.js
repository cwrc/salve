"use strict";
/**
 * Validation errors.
 * @author Louis-Dominique Dubeau
 * @license MPL 2.0
 * @copyright Mangalam Research Center for Buddhist Languages
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChoiceError = exports.ElementNameError = exports.AttributeValueError = exports.AttributeNameError = exports.SingleNameError = exports.ValidationError = void 0;
/**
 * The ``fireEvent`` methods return an array of objects of this class to
 * notify the caller of errors in the file being validated.
 *
 * Note that these error objects do not record what (element, attribute, text,
 * etc.) in the XML document was responsible for the error. It is the
 * responsibility of the code that uses salve to combine the error message with
 * an object that points into the document being validated.
 *
 * This is particularly important when considering the equality of errors. Two
 * errors are considered equal if their messages (with names) are the
 * same. *They could still be associated with two different locations in the
 * document being validated.* The code calling salve must distinguish such
 * cases.
 */
class ValidationError {
    /**
     *
     * @param msg The error message.
     */
    constructor(msg) {
        this.msg = msg;
        // May be useful for debugging:
        // this.stack_trace = new Error().stack;
    }
    /**
     * The default implementation is to return the value of calling
     * ``this.toStringWithNames(this.getNames())``.
     *
     * @returns The text representation of the error.
     */
    toString() {
        return this.toStringWithNames(this.getNames());
    }
    /**
     * This method provides the caller with the list of all names that are used in
     * the error message.
     *
     * @returns The list of names used in the error message.
     */
    getNames() {
        return [];
    }
    /**
     * This method transforms this object to a string but uses the names in the
     * parameter passed to it to format the string.
     *
     * Since salve does not work with namespace prefixes, someone using salve
     * would typically use this method so as to replace the name patterns passed
     * in error messages with qualified names.
     *
     * @param names The array of names to use. This should be an array of the same
     * length as that returned by [[getNames]] . Each element of the array
     * corresponds to each name in [[getNames]] and should be something that can
     * be converted to a meaningful string.
     *
     * @returns The object formatted as a string.
     */
    toStringWithNames(names) {
        // We do not have names in ValidationError
        return this.msg;
    }
    /**
     * Two [[ValidationError]] objects are considered equal if the values returned
     * by [[toString]] are equal.
     *
     * @param other The other validation error to compare against.
     *
     * @returns Whether ``this`` and ``other`` are equal.
     */
    equals(other) {
        return (this === other) || (this.toString() === other.toString());
    }
}
exports.ValidationError = ValidationError;
/**
 * This class serves as a base for all those errors that have only
 * one name involved.
 */
class SingleNameError extends ValidationError {
    /**
     * @param msg The error message.
     *
     * @param name The name of the XML entity at stake.
     */
    constructor(msg, name) {
        super(msg);
        this.name = name;
    }
    getNames() {
        return [this.name];
    }
    toStringWithNames(names) {
        return `${this.msg}: ${names[0].toString()}`;
    }
}
exports.SingleNameError = SingleNameError;
/**
 * Error returned when an attribute name is invalid.
 */
class AttributeNameError extends SingleNameError {
}
exports.AttributeNameError = AttributeNameError;
/**
 * Error returned when an attribute value is invalid.
 */
class AttributeValueError extends SingleNameError {
}
exports.AttributeValueError = AttributeValueError;
/**
 * Error returned when an element is invalid.
 */
class ElementNameError extends SingleNameError {
}
exports.ElementNameError = ElementNameError;
/**
 * Error returned when choice was not satisfied.
 */
class ChoiceError extends ValidationError {
    /**
     * @param namesA The names of the first XML entities at stake.
     *
     * @param namesB The names of the second XML entities at stake.
     */
    constructor(namesA, namesB) {
        super("");
        this.namesA = namesA;
        this.namesB = namesB;
    }
    getNames() {
        return this.namesA.concat(this.namesB);
    }
    toStringWithNames(names) {
        const first = names.slice(0, this.namesA.length);
        const second = names.slice(this.namesA.length);
        return `must choose either ${first.join(", ")} or ${second.join(", ")}`;
    }
}
exports.ChoiceError = ChoiceError;
//  LocalWords:  MPL ValidationError toStringWithNames getNames toString
//# sourceMappingURL=errors.js.map