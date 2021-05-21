"use strict";
/**
 * Implementation of the XMLSchema datatypes.
 * @author Louis-Dominique Dubeau
 * @license MPL 2.0
 * @copyright Mangalam Research Center for Buddhist Languages
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.xmlschema = void 0;
const tslib_1 = require("tslib");
const errors_1 = require("./errors");
const regexp = tslib_1.__importStar(require("./regexp"));
const xmlcharacters_1 = require("./xmlcharacters");
// tslint:disable: no-reserved-keywords
/**
 * Convert a number to an internal representation. This takes care of the
 * differences between JavaScript and XML Schema (e.g. "Infinity" vs "INF").
 *
 * @param value The value as expressed in an XML file or schema.
 *
 * @returns The number, in its internal representation.
 */
function convertToInternalNumber(value) {
    if (value === "INF") {
        return Infinity;
    }
    if (value === "-INF") {
        return -Infinity;
    }
    return Number(value);
}
/**
 * Convert an internal representation of a number to a string. This takes care
 * of the differences between JavaScript and XML Schema. For instance, a value
 * of ``Infinity`` will be represented as the string ``"INF"``.
 *
 * @param number The internal representation.
 *
 * @returns The string representation.
 */
function convertInternalNumberToString(value) {
    if (value === Infinity) {
        return "INF";
    }
    if (value === -Infinity) {
        return "-INF";
    }
    return value.toString();
}
class NumericParameter {
    convert(value) {
        return convertToInternalNumber(value);
    }
}
class NonNegativeIntegerParameter extends NumericParameter {
    isInvalidParam(value, name) {
        const asNum = Number(value);
        if (Number.isInteger(asNum) && asNum >= 0) {
            return false;
        }
        return new errors_1.ParamError(`${name} must have a non-negative integer value`);
    }
}
class LengthP extends NonNegativeIntegerParameter {
    constructor() {
        super(...arguments);
        this.name = "length";
        this.repeatable = false;
    }
    isInvalidValue(value, param, type) {
        if (type.valueLength(value) === param) {
            return false;
        }
        return new errors_1.ValueError(`length of value should be ${param}`);
    }
}
const lengthP = new LengthP();
class MinLengthP extends NonNegativeIntegerParameter {
    constructor() {
        super(...arguments);
        this.name = "minLength";
        this.repeatable = false;
    }
    isInvalidValue(value, param, type) {
        if (type.valueLength(value) >= param) {
            return false;
        }
        return new errors_1.ValueError("length of value should be greater than " +
            `or equal to ${param}`);
    }
}
const minLengthP = new MinLengthP();
class MaxLengthP extends NonNegativeIntegerParameter {
    constructor() {
        super(...arguments);
        this.name = "maxLength";
        this.repeatable = false;
    }
    isInvalidValue(value, param, type) {
        if (type.valueLength(value) <= param) {
            return false;
        }
        return new errors_1.ValueError("length of value should be less than " +
            `or equal to ${param}`);
    }
}
const maxLengthP = new MaxLengthP();
//
// pattern is special. It converts the param value found in the RNG file into an
// object with two fields: ``rng`` and ``internal``. RNG is the string value
// from the RNG file, and ``internal`` is a representation internal to salve. We
// use ``internal`` for performing the validation but present ``rng`` to the
// user. Note that if pattern appears multiple times as a parameter, the two
// values are the result of the concatenation of all the instance of the pattern
// parameter. (Why this? Because it would be confusing to show the internal
// value in error messages to the user.)
//
/**
 * A mapping of raw schema values to the corresponding ``RegExp`` object.
 */
const reCache = Object.create(null);
class PatternP {
    constructor() {
        this.name = "pattern";
        this.repeatable = true;
    }
    convert(value) {
        let internal = reCache[value];
        if (internal === undefined) {
            internal = reCache[value] = regexp.parse(value);
        }
        return {
            rng: value,
            internal,
        };
    }
    isInvalidParam(value) {
        try {
            this.convert(value);
        }
        catch (ex) {
            // Convert the error into something that makes sense for salve.
            if (ex instanceof regexp.SalveParsingError) {
                return new errors_1.ParamError(ex.message);
            }
            // Rethrow
            throw ex;
        }
        return false;
    }
    isInvalidValue(value, param) {
        if (param instanceof Array) {
            let failedOn;
            for (const p of param) {
                if (!p.internal.test(value)) {
                    failedOn = p;
                    break;
                }
            }
            if (failedOn === undefined) {
                return false;
            }
            return new errors_1.ValueError(`value does not match the pattern ${failedOn.rng}`);
        }
        if (param.internal.test(value)) {
            return false;
        }
        return new errors_1.ValueError(`value does not match the pattern ${param.rng}`);
    }
}
const patternP = new PatternP();
class TotalDigitsP extends NumericParameter {
    constructor() {
        super(...arguments);
        this.name = "totalDigits";
        this.repeatable = false;
    }
    isInvalidParam(value, name) {
        const asNum = Number(value);
        if (Number.isInteger(asNum) && asNum > 0) {
            return false;
        }
        return new errors_1.ParamError(`${name} must have a positive value`);
    }
    isInvalidValue(value, param) {
        const str = String(Number(value)).replace(/[-+.]/g, "");
        if (str.length > param) {
            return new errors_1.ValueError(`value must have at most ${param} digits`);
        }
        return false;
    }
}
const totalDigitsP = new TotalDigitsP();
class FractionDigitsP extends NonNegativeIntegerParameter {
    constructor() {
        super(...arguments);
        this.name = "fractionDigits";
        this.repeatable = false;
    }
    isInvalidValue(value, param) {
        const str = String(Number(value)).replace(/^.*\./, "");
        if (str.length > param) {
            return new errors_1.ValueError(`value must have at most ${param} fraction digits`);
        }
        return false;
    }
}
class NumericTypeDependentParameter extends NumericParameter {
    isInvalidParam(value, name, type) {
        const errors = type.disallows(value, type.defaultParams);
        if (!errors) {
            return false;
        }
        // Support for multiple value errors is mainly so that we can report if a
        // value violates multiple param specifications. When we check a param in
        // isolation, it is unlikely that we'd get multiple errors. If we do, we
        // narrow it to the first error and convert the ValueError to a ParamError.
        return new errors_1.ParamError(errors[0].message);
    }
}
const fractionDigitsP = new FractionDigitsP();
class MaxInclusiveP extends NumericTypeDependentParameter {
    constructor() {
        super(...arguments);
        this.name = "maxInclusive";
        this.repeatable = false;
    }
    isInvalidValue(value, param) {
        if ((isNaN(value) !== isNaN(param)) || value > param) {
            const repr = convertInternalNumberToString(param);
            return new errors_1.ValueError(`value must be less than or equal to ${repr}`);
        }
        return false;
    }
}
const maxInclusiveP = new MaxInclusiveP();
class MaxExclusiveP extends NumericTypeDependentParameter {
    constructor() {
        super(...arguments);
        this.name = "maxExclusive";
        this.repeatable = false;
    }
    isInvalidValue(value, param) {
        // The negation of a less-than test allows handling a parameter value of NaN
        // automatically.
        if (!(value < param)) {
            const repr = convertInternalNumberToString(param);
            return new errors_1.ValueError(`value must be less than ${repr}`);
        }
        return false;
    }
}
const maxExclusiveP = new MaxExclusiveP();
class MinInclusiveP extends NumericTypeDependentParameter {
    constructor() {
        super(...arguments);
        this.name = "minInclusive";
        this.repeatable = false;
    }
    isInvalidValue(value, param) {
        if ((isNaN(value) !== isNaN(param)) || value < param) {
            const repr = convertInternalNumberToString(param);
            return new errors_1.ValueError(`value must be greater than or equal to ${repr}`);
        }
        return false;
    }
}
const minInclusiveP = new MinInclusiveP();
class MinExclusiveP extends NumericTypeDependentParameter {
    constructor() {
        super(...arguments);
        this.name = "minExclusive";
        this.repeatable = false;
    }
    isInvalidValue(value, param) {
        // The negation of a greater-than test allows handling a parameter value of
        // NaN automatically.
        if (!(value > param)) {
            const repr = convertInternalNumberToString(param);
            return new errors_1.ValueError(`value must be greater than ${repr}`);
        }
        return false;
    }
}
const minExclusiveP = new MinExclusiveP();
/**
 * A mapping of parameter names to parameter objects.
 */
const PARAM_NAME_TO_OBJ = Object.create(null);
for (const param of [lengthP, minLengthP, maxLengthP, patternP, totalDigitsP,
    fractionDigitsP, minExclusiveP, minInclusiveP,
    maxExclusiveP, maxInclusiveP]) {
    PARAM_NAME_TO_OBJ[param.name] = param;
}
const EMPTY_PARAMS = Object.create(null);
/**
 * The structure that all datatype implementations in this module share.
 *
 * @private
 *
 */
class Base {
    /**
     * The default parameters if none are specified.
     */
    get defaultParams() {
        return EMPTY_PARAMS;
    }
    /**
     * Computes the value's length. This may differ from the value's length, as it
     * appears in the XML document it comes from.
     *
     * @param value The value from the XML document.
     *
     * @returns The length.
     */
    valueLength(value) {
        return value.length;
    }
    parseValue(location, value, context) {
        const errors = this.disallows(value, this.defaultParams, context);
        if (errors) {
            throw new errors_1.ValueValidationError(location, errors);
        }
        const result = this.convertValue(value, context);
        if (result instanceof Array) {
            throw new errors_1.ValueValidationError(location, result);
        }
        return { value: result };
    }
    // tslint:disable-next-line: max-func-body-length
    parseParams(location, params) {
        const ret = Object.create(null);
        if (params === undefined) {
            return ret;
        }
        const errors = [];
        for (const x of params) {
            const { name, value } = x;
            const prop = PARAM_NAME_TO_OBJ[name];
            // Do we know this parameter?
            if (prop === undefined || !this.validParams.includes(prop)) {
                errors.push(new errors_1.ParamError(`unexpected parameter: ${name}`));
                continue;
            }
            // Is the value valid at all?
            const invalid = prop.isInvalidParam(value, name, this);
            if (invalid) {
                errors.push(invalid);
            }
            else {
                const converted = prop.convert(value);
                const values = ret[name];
                // We gather all the values in a map of name to value.
                if (values === undefined) {
                    ret[name] = converted;
                }
                else {
                    if (!prop.repeatable) {
                        errors.push(new errors_1.ParamError(`cannot repeat parameter ${name}`));
                    }
                    if (Array.isArray(values)) {
                        values.push(converted);
                    }
                    else {
                        ret[name] = [values, converted];
                    }
                }
            }
        }
        if (errors.length !== 0) {
            throw new errors_1.ParameterParsingError(location, errors);
        }
        // Inter-parameter checks. There's no point in trying to generalize
        // this.
        const { minLength, maxLength, maxInclusive, maxExclusive, minInclusive, minExclusive } = ret;
        if (minLength > maxLength) {
            errors.push(new errors_1.ParamError("minLength must be less than or equal to maxLength"));
        }
        if (ret.length !== undefined) {
            if (minLength !== undefined) {
                errors.push(new errors_1.ParamError("length and minLength cannot appear together"));
            }
            if (maxLength !== undefined) {
                errors.push(new errors_1.ParamError("length and maxLength cannot appear together"));
            }
        }
        if (maxInclusive !== undefined) {
            if (maxExclusive !== undefined) {
                errors.push(new errors_1.ParamError("maxInclusive and maxExclusive cannot appear together"));
            }
            // maxInclusive, minExclusive
            if (minExclusive >= maxInclusive) {
                errors.push(new errors_1.ParamError("minExclusive must be less than maxInclusive"));
            }
        }
        if (minInclusive !== undefined) {
            if (minExclusive !== undefined) {
                errors.push(new errors_1.ParamError("minInclusive and minExclusive cannot appear together"));
            }
            // maxInclusive, minInclusive
            if (minInclusive > maxInclusive) {
                errors.push(new errors_1.ParamError("minInclusive must be less than or equal to maxInclusive"));
            }
            // maxExclusive, minInclusive
            if (minInclusive >= maxExclusive) {
                errors.push(new errors_1.ParamError("minInclusive must be less than maxExclusive"));
            }
        }
        // maxExclusive, minExclusive
        if (minExclusive > maxExclusive) {
            errors.push(new errors_1.ParamError("minExclusive must be less than or equal to maxExclusive"));
        }
        if (errors.length !== 0) {
            throw new errors_1.ParameterParsingError(location, errors);
        }
        return ret;
    }
    equal(value, schemaValue, context) {
        const converted = this.convertValue(value, context);
        return converted instanceof Array ? false :
            converted === schemaValue.value;
    }
    disallows(value, params, context) {
        if (!this.regexp.test(value)) {
            return [new errors_1.ValueError(this.typeErrorMsg)];
        }
        const paramNames = Object.keys(params);
        if (paramNames.length === 0) {
            return false;
        }
        const converted = this.convertValue(value, context);
        if (converted instanceof Array) {
            return converted;
        }
        const errors = [];
        for (const name of paramNames) {
            const param = PARAM_NAME_TO_OBJ[name];
            const err = param.isInvalidValue(converted, params[name], this);
            if (err) {
                errors.push(err);
            }
        }
        return (errors.length !== 0) ? errors : false;
    }
}
//
// String family
//
class CommonStringBased extends Base {
    convertValue(value) {
        return value.trim().replace(/\s+/g, " ");
    }
}
/* tslint:disable:class-name */
class string_ extends CommonStringBased {
    constructor() {
        super(...arguments);
        this.name = "string";
        this.typeErrorMsg = "value is not a string";
        this.validParams = [lengthP, minLengthP, maxLengthP,
            patternP];
        this.needsContext = false;
        // [^] means "any character". The dot would exclude line terminators (\r\n,
        // etc.).
        this.regexp = /^[^]*$/;
    }
    convertValue(value) {
        return value;
    }
    // This is a specialized version of disallows that avoids bothering with tests
    // that don't affect the results. string and some of its immediate derivates
    // are not affected by their regexp, nor do they have default parameters that
    // affect what values are allowed.
    disallows(value, params) {
        if (Object.keys(params).length === 0) {
            // The default params don't disallow anything.
            return false;
        }
        const converted = this.convertValue(value);
        const errors = [];
        // We use Object.keys because we don't know the precise type of params.
        for (const name of Object.keys(params)) {
            const param = PARAM_NAME_TO_OBJ[name];
            const err = param.isInvalidValue(converted, params[name], this);
            if (err) {
                errors.push(err);
            }
        }
        return (errors.length !== 0) ? errors : false;
    }
}
class normalizedString extends string_ {
    constructor() {
        super(...arguments);
        this.name = "normalizedString";
        this.typeErrorMsg = "string contains a tab, carriage return or newline";
    }
    convertValue(value) {
        return value.replace(/\s+/g, " ");
    }
}
class token extends normalizedString {
    constructor() {
        super(...arguments);
        this.name = "token";
        this.typeErrorMsg = "not a valid token";
    }
    convertValue(value) {
        return value.trim().replace(/\s+/g, " ");
    }
}
class tokenInternal extends token {
    disallows(value, params) {
        if (!this.regexp.test(value)) {
            return [new errors_1.ValueError(this.typeErrorMsg)];
        }
        return super.disallows(value, params);
    }
}
class language extends tokenInternal {
    constructor() {
        super(...arguments);
        this.name = "language";
        this.typeErrorMsg = "not a valid language identifier";
        this.regexp = /^\s*[a-zA-Z]{1,8}(-[a-zA-Z0-9]{1,8})*\s*$/;
    }
}
class Name extends tokenInternal {
    constructor() {
        super(...arguments);
        this.name = "Name";
        this.typeErrorMsg = "not a valid Name";
        this.regexp = xmlcharacters_1.xmlNameRe;
    }
}
class NCName extends Name {
    constructor() {
        super(...arguments);
        this.name = "NCName";
        this.typeErrorMsg = "not a valid NCName";
        this.regexp = xmlcharacters_1.xmlNcnameRe;
    }
}
class NMTOKEN extends tokenInternal {
    constructor() {
        super(...arguments);
        this.name = "NMTOKEN";
        this.typeErrorMsg = "not a valid NMTOKEN";
        this.regexp = new RegExp(`^\\s*[${xmlcharacters_1.xmlNameChar}]+\\s*$`);
    }
}
class NMTOKENS extends NMTOKEN {
    constructor() {
        super(...arguments);
        this.name = "NMTOKENS";
        this.typeErrorMsg = "not a valid NMTOKENS";
        this.regexp = new RegExp(`^\\s*[${xmlcharacters_1.xmlNameChar}]+(?:\\s+[${xmlcharacters_1.xmlNameChar}]+)*\\s*$`);
    }
}
class ID extends NCName {
    constructor() {
        super(...arguments);
        this.name = "ID";
        this.typeErrorMsg = "not a valid ID";
    }
}
class IDREF extends NCName {
    constructor() {
        super(...arguments);
        this.name = "IDREF";
        this.typeErrorMsg = "not a valid IDREF";
    }
}
class IDREFS extends IDREF {
    constructor() {
        super(...arguments);
        this.name = "IDREFS";
        this.typeErrorMsg = "not a valid IDREFS";
        this.regexp = new RegExp(`^\\s*${xmlcharacters_1.xmlNcname}(?:\\s+${xmlcharacters_1.xmlNcname})*\\s*$`);
    }
}
class ENTITY extends NCName {
    constructor() {
        super(...arguments);
        this.name = "ENTITY";
        this.typeErrorMsg = "not a valid ENTITY";
    }
}
class ENTITIES extends ENTITY {
    constructor() {
        super(...arguments);
        this.name = "ENTITIES";
        this.typeErrorMsg = "not a valid ENTITIES";
        this.regexp = new RegExp(`^\\s*${xmlcharacters_1.xmlNcname}(?:\\s+${xmlcharacters_1.xmlNcname})*\\s*$`);
    }
}
//
// Decimal family
//
const decimalPattern = "[-+]?(?!$)\\d*(\\.\\d*)?";
class decimal extends Base {
    constructor() {
        super(...arguments);
        this.name = "decimal";
        this.typeErrorMsg = "value not a decimal number";
        this.regexp = new RegExp(`^\\s*${decimalPattern}\\s*$`);
        this.needsContext = false;
        this.validParams = [
            totalDigitsP, fractionDigitsP, patternP, minExclusiveP, minInclusiveP,
            maxExclusiveP, maxInclusiveP,
        ];
    }
    convertValue(value) {
        // We don't need to do white-space processing on the value.
        return Number(value);
    }
}
const integerPattern = "[-+]?\\d+";
class integer extends decimal {
    constructor() {
        super(...arguments);
        this.name = "integer";
        this.typeErrorMsg = "value is not an integer";
        this.regexp = new RegExp(`^\\s*${integerPattern}\\s*$`);
        this.validParams = [
            totalDigitsP, patternP, minExclusiveP, minInclusiveP, maxExclusiveP,
            maxInclusiveP,
        ];
    }
    get defaultParams() {
        if (this._defaultParams === undefined) {
            const params = this._defaultParams = Object.create(null);
            const { highestVal, lowestVal } = this;
            if (highestVal !== undefined) {
                params.maxInclusive = highestVal;
            }
            if (lowestVal !== undefined) {
                params.minInclusive = lowestVal;
            }
            return params;
        }
        return this._defaultParams;
    }
    parseParams(location, params) {
        const ret = super.parseParams(location, params);
        function fail(message) {
            throw new errors_1.ParameterParsingError(location, [new errors_1.ParamError(message)]);
        }
        const { highestVal, lowestVal } = this;
        if (highestVal !== undefined) {
            const me = ret.maxExclusive;
            if (me !== undefined) {
                if (me > highestVal) {
                    fail(`maxExclusive cannot be greater than ${highestVal}`);
                }
            }
            else {
                const mi = ret.maxInclusive;
                if (mi !== undefined) {
                    if (mi > highestVal) {
                        fail(`maxInclusive cannot be greater than ${highestVal}`);
                    }
                }
                else {
                    ret.maxInclusive = highestVal;
                }
            }
        }
        if (lowestVal !== undefined) {
            const me = ret.minExclusive;
            if (me !== undefined) {
                if (me < lowestVal) {
                    fail(`minExclusive cannot be lower than ${this.lowestVal}`);
                }
            }
            else {
                const mi = ret.minInclusive;
                if (mi !== undefined) {
                    if (mi < lowestVal) {
                        fail(`minInclusive cannot be lower than ${this.lowestVal}`);
                    }
                }
                else {
                    ret.minInclusive = lowestVal;
                }
            }
        }
        return ret;
    }
}
class nonPositiveInteger extends integer {
    constructor() {
        super(...arguments);
        this.name = "nonPositiveInteger";
        this.typeErrorMsg = "value is not a nonPositiveInteger";
        this.regexp = /^\s*\+?0+|-\d+\s*$/;
        this.highestVal = 0;
        this.validParams = [
            totalDigitsP, patternP, minExclusiveP, minInclusiveP, maxExclusiveP,
            maxInclusiveP,
        ];
    }
}
class negativeInteger extends nonPositiveInteger {
    constructor() {
        super(...arguments);
        this.name = "negativeInteger";
        this.typeErrorMsg = "value is not a negativeInteger";
        this.regexp = /^\s*-\d+\s*$/;
        this.highestVal = -1;
        this.validParams = [
            totalDigitsP, patternP, minExclusiveP, minInclusiveP, maxExclusiveP,
            maxInclusiveP,
        ];
    }
}
class nonNegativeInteger extends integer {
    constructor() {
        super(...arguments);
        this.name = "nonNegativeInteger";
        this.typeErrorMsg = "value is not a nonNegativeInteger";
        this.regexp = /^\s*(\+?\d+|-0)\s*$/;
        this.lowestVal = 0;
        this.validParams = [
            totalDigitsP, patternP, minExclusiveP, minInclusiveP, maxExclusiveP,
            maxInclusiveP,
        ];
    }
}
class positiveInteger extends nonNegativeInteger {
    constructor() {
        super(...arguments);
        this.name = "positiveInteger";
        this.typeErrorMsg = "value is not a positiveInteger";
        this.regexp = /^\s*\+?\d+\s*$/;
        this.lowestVal = 1;
        this.validParams = [
            totalDigitsP, patternP, minExclusiveP, minInclusiveP, maxExclusiveP,
            maxInclusiveP,
        ];
    }
}
class long_ extends integer {
    constructor() {
        super(...arguments);
        this.name = "long";
        this.typeErrorMsg = "value is not a long";
        this.highestVal = 9223372036854775807;
        this.lowestVal = -9223372036854775808;
        this.validParams = [
            totalDigitsP, patternP, minExclusiveP, minInclusiveP, maxExclusiveP,
            maxInclusiveP,
        ];
    }
}
class int_ extends long_ {
    constructor() {
        super(...arguments);
        this.name = "int";
        this.typeErrorMsg = "value is not an int";
        this.highestVal = 2147483647;
        this.lowestVal = -2147483648;
    }
}
class short_ extends int_ {
    constructor() {
        super(...arguments);
        this.name = "short";
        this.typeErrorMsg = "value is not a short";
        this.highestVal = 32767;
        this.lowestVal = -32768;
    }
}
class byte_ extends short_ {
    constructor() {
        super(...arguments);
        this.name = "byte";
        this.typeErrorMsg = "value is not a byte";
        this.highestVal = 127;
        this.lowestVal = -128;
    }
}
class unsignedLong extends nonNegativeInteger {
    constructor() {
        super(...arguments);
        this.name = "unsignedLong";
        this.typeErrorMsg = "value is not an unsignedLong";
        this.highestVal = 18446744073709551615;
        this.validParams = [
            totalDigitsP, patternP, minExclusiveP, minInclusiveP, maxExclusiveP,
            maxInclusiveP,
        ];
    }
}
class unsignedInt extends unsignedLong {
    constructor() {
        super(...arguments);
        this.name = "unsignedInt";
        this.typeErrorMsg = "value is not an unsignedInt";
        this.highestVal = 4294967295;
        this.validParams = [
            totalDigitsP, patternP, minExclusiveP, minInclusiveP, maxExclusiveP,
            maxInclusiveP,
        ];
    }
}
class unsignedShort extends unsignedInt {
    constructor() {
        super(...arguments);
        this.name = "unsignedShort";
        this.typeErrorMsg = "value is not an unsignedShort";
        this.highestVal = 65535;
        this.validParams = [
            totalDigitsP, patternP, minExclusiveP, minInclusiveP, maxExclusiveP,
            maxInclusiveP,
        ];
    }
}
class unsignedByte extends unsignedShort {
    constructor() {
        super(...arguments);
        this.name = "unsignedByte";
        this.typeErrorMsg = "value is not an unsignedByte";
        this.highestVal = 255;
        this.validParams = [
            totalDigitsP, patternP, minExclusiveP, minInclusiveP, maxExclusiveP,
            maxInclusiveP,
        ];
    }
}
class boolean_ extends Base {
    constructor() {
        super(...arguments);
        this.name = "boolean";
        this.typeErrorMsg = "not a valid boolean";
        this.regexp = /^\s*(1|0|true|false)\s*$/;
        this.validParams = [patternP];
        this.needsContext = false;
    }
    convertValue(value) {
        return (value === "1" || value === "true");
    }
}
const B04 = "[AQgw]";
const B16 = "[AEIMQUYcgkosw048]";
const B64 = "[A-Za-z0-9+/]";
const B64S = `(?:${B64}\\s*)`;
const B16S = `(?:${B16}\\s*)`;
const B04S = `(?:${B04}\\s*)`;
const base64BinaryRe = new RegExp(`^\\s*(?:(?:${B64S}{4})*(?:(?:${B64S}{3}${B64})|(?:${B64S}{2}${B16S}=)|(?:` +
    `${B64S}${B04S}= ?=)))?\\s*$`);
class base64Binary extends Base {
    constructor() {
        super(...arguments);
        this.name = "base64Binary";
        this.typeErrorMsg = "not a valid base64Binary";
        this.regexp = base64BinaryRe;
        this.needsContext = false;
        this.validParams = [lengthP, minLengthP, maxLengthP, patternP];
    }
    convertValue(value) {
        // We don't need to actually decode it.
        return value.replace(/\s/g, "");
    }
    valueLength(value) {
        // Length of the decoded value.
        return Math.floor((value.replace(/[\s=]/g, "").length * 3) / 4);
    }
}
class hexBinary extends Base {
    constructor() {
        super(...arguments);
        this.name = "hexBinary";
        this.typeErrorMsg = "not a valid hexBinary";
        this.regexp = /^\s*(?:[0-9a-fA-F]{2})*\s*$/;
        this.needsContext = false;
        this.validParams = [lengthP, minLengthP, maxLengthP, patternP];
    }
    convertValue(value) {
        return value;
    }
    valueLength(value) {
        // Length of the byte list.
        return value.length / 2;
    }
}
const doubleRe = new RegExp(`^\\s*(?:(?:[-+]?INF)|(?:NaN)|(?:${decimalPattern}\
(?:[Ee]${integerPattern})?))\\s*$`);
class float_ extends Base {
    constructor() {
        super(...arguments);
        this.name = "float";
        this.typeErrorMsg = "not a valid float";
        this.regexp = doubleRe;
        this.needsContext = false;
        this.validParams = [
            patternP, minInclusiveP, minExclusiveP, maxInclusiveP, maxExclusiveP,
        ];
    }
    convertValue(value) {
        return convertToInternalNumber(value);
    }
    equal(value, schemaValue) {
        const converted = this.convertValue(value);
        // In the IEEE 754-1985 standard, which is what XMLSChema 1.0 follows, NaN
        // is equal to NaN. In JavaScript NaN is equal to nothing, not even itself.
        // So we need to handle this difference.
        if (isNaN(converted)) {
            return isNaN(schemaValue.value);
        }
        return converted === schemaValue.value;
    }
}
class double_ extends float_ {
    constructor() {
        super(...arguments);
        this.name = "double";
        this.typeErrorMsg = "not a valid double";
    }
}
class QName extends Base {
    constructor() {
        super(...arguments);
        this.name = "QName";
        this.typeErrorMsg = "not a valid QName";
        this.regexp = new RegExp(`^\\s*(?:${xmlcharacters_1.xmlNcname}:)?${xmlcharacters_1.xmlNcname}\\s*$`);
        this.needsContext = true;
        this.validParams = [patternP, lengthP, minLengthP, maxLengthP];
    }
    disallows(value, params, context) {
        if (!this.regexp.test(value)) {
            return [new errors_1.ValueError(this.typeErrorMsg)];
        }
        const converted = this.convertValue(value, context);
        if (converted instanceof Array) {
            return converted;
        }
        const paramNames = Object.keys(params);
        if (paramNames.length === 0) {
            return false;
        }
        const errors = [];
        for (const name of paramNames) {
            const param = PARAM_NAME_TO_OBJ[name];
            const err = param.isInvalidValue(converted, params[name], this);
            if (err) {
                errors.push(err);
            }
        }
        return (errors.length !== 0) ? errors : false;
    }
    convertValue(value, context) {
        const ret = context.resolver.resolveName(value.trim());
        if (ret === undefined) {
            return [new errors_1.ValueError(`cannot resolve the name ${value}`)];
        }
        return `{${ret.ns}}${ret.name}`;
    }
}
class NOTATION extends Base {
    constructor() {
        super(...arguments);
        this.name = "NOTATION";
        this.typeErrorMsg = "not a valid NOTATION";
        this.regexp = new RegExp(`^\\s*(?:${xmlcharacters_1.xmlNcname}:)?${xmlcharacters_1.xmlNcname}\\s*$`);
        this.needsContext = true;
        this.validParams = [patternP, lengthP, minLengthP, maxLengthP];
    }
    disallows(value, params, context) {
        if (!this.regexp.test(value)) {
            return [new errors_1.ValueError(this.typeErrorMsg)];
        }
        const converted = this.convertValue(value, context);
        if (converted instanceof Array) {
            return converted;
        }
        const paramNames = Object.keys(params);
        if (paramNames.length === 0) {
            return false;
        }
        const errors = [];
        for (const name of paramNames) {
            const param = PARAM_NAME_TO_OBJ[name];
            const err = param.isInvalidValue(converted, params[name], this);
            if (err) {
                errors.push(err);
            }
        }
        return (errors.length !== 0) ? errors : false;
    }
    convertValue(value, context) {
        const ret = context.resolver.resolveName(value.trim());
        if (ret === undefined) {
            return [new errors_1.ValueError(`cannot resolve the name ${value}`)];
        }
        return `{${ret.ns}}${ret.name}`;
    }
}
class duration extends CommonStringBased {
    constructor() {
        super(...arguments);
        this.name = "duration";
        this.typeErrorMsg = "not a valid duration";
        this.regexp = 
        // tslint:disable-next-line:max-line-length
        /^\s*-?P(?!$)(?:\d+Y)?(?:\d+M)?(?:\d+D)?(?:T(?!$)(?:\d+H)?(?:\d+M)?(?:\d+(\.\d+)?S)?)?\s*$/;
        this.validParams = [patternP];
        this.needsContext = false;
    }
}
const yearPattern = "-?(?:[1-9]\\d*)?\\d{4}";
const monthPattern = "[01]\\d";
const domPattern = "[0-3]\\d";
const timePattern = "[012]\\d:[0-5]\\d:[0-5]\\d(?:\\.\\d+)?";
const tzPattern = "(?:[+-][01]\\d:[0-5]\\d|Z)";
const tzRe = new RegExp(`${tzPattern}$`);
function isLeapYear(year) {
    return ((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0);
}
const dateGroupingRe = new RegExp(`^\\s*(${yearPattern})-(${monthPattern})-(${domPattern})T(${timePattern})` +
    `(${tzPattern}?)\\s*$`);
const maxDoms = [undefined, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
function checkDate(value) {
    // The Date.parse method of JavaScript is not reliable.
    const match = value.match(dateGroupingRe);
    if (match === null) {
        return false;
    }
    const year = match[1];
    const leap = isLeapYear(Number(year));
    const month = Number(match[2]);
    if (month === 0 || month > 12) {
        return false;
    }
    const dom = Number(match[3]);
    // We cannot have an undefined value here... so...
    // tslint:disable-next-line:no-non-null-assertion
    let maxDom = maxDoms[month];
    if (month === 2 && !leap) {
        maxDom = 28;
    }
    if (dom === 0 || dom > maxDom) {
        return false;
    }
    const timeParts = match[4].split(":");
    const minutes = Number(timeParts[1]);
    if (minutes > 59) {
        return false;
    }
    const seconds = Number(timeParts[2]);
    if (seconds > 59) {
        return false;
    }
    // 24 is valid if minutes and seconds are at 0, otherwise 23 is the
    // limit.
    const hoursLimit = (minutes === 0 && seconds === 0) ? 24 : 23;
    if (Number(timeParts[0]) > hoursLimit) {
        return false;
    }
    if (match[5] !== undefined && match[5] !== "" && match[5] !== "Z") {
        // We have a TZ
        const tzParts = match[5].split(":");
        // Slice: skip the sign.
        const tzHours = Number(tzParts[0].slice(1));
        if (tzHours > 14) {
            return false;
        }
        const tzSeconds = Number(tzParts[1]);
        if (tzSeconds > 59) {
            return false;
        }
        if (tzHours === 14 && tzSeconds !== 0) {
            return false;
        }
    }
    return true;
}
class dateTime extends CommonStringBased {
    constructor() {
        super(...arguments);
        this.name = "dateTime";
        this.typeErrorMsg = "not a valid dateTime";
        this.regexp = new RegExp(`^\\s*${yearPattern}-${monthPattern}-${domPattern}` +
            `T${timePattern}${tzPattern}?\\s*$`);
        this.needsContext = false;
        this.validParams = [patternP];
    }
    disallows(value, params) {
        const ret = super.disallows(value, params);
        if (ret instanceof Array) {
            return ret;
        }
        if (!checkDate(value)) {
            return [new errors_1.ValueError(this.typeErrorMsg)];
        }
        return false;
    }
}
class time extends CommonStringBased {
    constructor() {
        super(...arguments);
        this.name = "time";
        this.typeErrorMsg = "not a valid time";
        this.regexp = new RegExp(`^\\s*${timePattern}${tzPattern}?\\s*$`);
        this.validParams = [patternP];
        this.needsContext = false;
    }
    disallows(value, params) {
        const ret = super.disallows(value, params);
        if (ret) {
            return ret;
        }
        // Date does not validate times, so set the date to something fake.
        if (!checkDate(`1901-01-01T${value}`)) {
            return [new errors_1.ValueError(this.typeErrorMsg)];
        }
        return false;
    }
}
class date extends CommonStringBased {
    constructor() {
        super(...arguments);
        this.name = "date";
        this.typeErrorMsg = "not a valid date";
        this.regexp = new RegExp(`^\\s*${yearPattern}-${monthPattern}-${domPattern}${tzPattern}?\\s*$`);
        this.needsContext = false;
        this.validParams = [patternP];
    }
    disallows(value, params) {
        const ret = super.disallows(value, params);
        if (ret) {
            return ret;
        }
        // We have to add time for Date() to parse it.
        const match = value.match(tzRe);
        const withTime = match !== null ?
            `${value.slice(0, match.index)}T00:00:00${match[0]}` :
            `${value}T00:00:00`;
        if (!checkDate(withTime)) {
            return [new errors_1.ValueError(this.typeErrorMsg)];
        }
        return false;
    }
}
class gYearMonth extends CommonStringBased {
    constructor() {
        super(...arguments);
        this.name = "gYearMonth";
        this.typeErrorMsg = "not a valid gYearMonth";
        this.regexp = new RegExp(`^\\s*${yearPattern}-${monthPattern}${tzPattern}?\\s*$`);
        this.validParams = [patternP];
        this.needsContext = false;
    }
    disallows(value, params) {
        const ret = super.disallows(value, params);
        if (ret) {
            return ret;
        }
        // We have to add a day and time for Date() to parse it.
        const match = value.match(tzRe);
        const withTime = match !== null ?
            `${value.slice(0, match.index)}-01T00:00:00${match[0]}` :
            `${value}-01T00:00:00`;
        if (!checkDate(withTime)) {
            return [new errors_1.ValueError(this.typeErrorMsg)];
        }
        return false;
    }
}
class gYear extends CommonStringBased {
    constructor() {
        super(...arguments);
        this.name = "gYear";
        this.typeErrorMsg = "not a valid gYear";
        this.regexp = new RegExp(`^\\s*${yearPattern}${tzPattern}?\\s*$`);
        this.needsContext = false;
        this.validParams = [patternP];
    }
    disallows(value, params) {
        const ret = super.disallows(value, params);
        if (ret) {
            return ret;
        }
        // We have to add a month, a day and a time for Date() to parse it.
        const match = value.match(tzRe);
        const withTime = match !== null ?
            `${value.slice(0, match.index)}-01-01T00:00:00${match[0]}` :
            `${value}-01-01T00:00:00`;
        if (!checkDate(withTime)) {
            return [new errors_1.ValueError(this.typeErrorMsg)];
        }
        return false;
    }
}
class gMonthDay extends CommonStringBased {
    constructor() {
        super(...arguments);
        this.name = "gMonthDay";
        this.typeErrorMsg = "not a valid gMonthDay";
        this.regexp = new RegExp(`^\\s*${monthPattern}-${domPattern}${tzPattern}?\\s*$`);
        this.needsContext = false;
        this.validParams = [patternP];
    }
    disallows(value, params) {
        const ret = super.disallows(value, params);
        if (ret) {
            return ret;
        }
        // We have to add a year and a time for Date() to parse it.
        const match = value.match(tzRe);
        const withTime = match !== null ?
            `${value.slice(0, match.index)}T00:00:00${match[0]}` :
            `${value}T00:00:00`;
        // We always add 2000, which is a leap year, so 01-29 won't raise an
        // error.
        if (!checkDate(`2000-${withTime}`)) {
            return [new errors_1.ValueError(this.typeErrorMsg)];
        }
        return false;
    }
}
class gDay extends CommonStringBased {
    constructor() {
        super(...arguments);
        this.name = "gDay";
        this.typeErrorMsg = "not a valid gDay";
        this.regexp = new RegExp(`^\\s*${domPattern}${tzPattern}?\\s*$`);
        this.needsContext = false;
        this.validParams = [patternP];
    }
    disallows(value, params) {
        const ret = super.disallows(value, params);
        if (ret) {
            return ret;
        }
        // We have to add a year and a time for Date() to parse it.
        const match = value.match(tzRe);
        const withTime = match !== null ?
            `${value.slice(0, match.index)}T00:00:00${match[0]}` :
            `${value}T00:00:00`;
        // We always add 2000, which is a leap year, so 01-29 won't raise an
        // error.
        if (!checkDate(`2000-01-${withTime}`)) {
            return [new errors_1.ValueError(this.typeErrorMsg)];
        }
        return false;
    }
}
class gMonth extends CommonStringBased {
    constructor() {
        super(...arguments);
        this.name = "gMonth";
        this.typeErrorMsg = "not a valid gMonth";
        this.regexp = new RegExp(`^\\s*${monthPattern}${tzPattern}?\\s*$`);
        this.needsContext = false;
        this.validParams = [patternP];
    }
    disallows(value, params) {
        const ret = super.disallows(value, params);
        if (ret) {
            return ret;
        }
        // We have to add a year and a time for Date() to parse it.
        const match = value.match(tzRe);
        const withTime = match !== null ?
            `${value.slice(0, match.index)}-01T00:00:00${match[0]}` :
            `${value}-01T00:00:00`;
        // We always add 2000, which is a leap year, so 01-29 won't raise an
        // error.
        if (!checkDate(`2000-${withTime}`)) {
            return [new errors_1.ValueError(this.typeErrorMsg)];
        }
        return false;
    }
}
//
// See
// https://www.w3.org/TR/2012/REC-xmlschema11-2-20120405/datatypes.html#anyURI
//
// Though the specification referred above above does not require any syntactic
// checks, in practice Jing reports errors on malformed URIs. We follow Jing's
// lead.
//
// tslint:disable-next-line:max-line-length
// Derived from https://stackoverflow.com/questions/161738/what-is-the-best-regular-expression-to-check-if-a-string-is-a-valid-url/190405#190405
// tslint:disable-next-line:max-line-length
const reJsRfc3987UriReference = /^\s*(?:[a-z](?:[-a-z0-9\+\.])*:(?:\/\/(?:(?:%[0-9a-f][0-9a-f]|[-a-z0-9\._~\uA0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF\u10000-\u1FFFD\u20000-\u2FFFD\u30000-\u3FFFD\u40000-\u4FFFD\u50000-\u5FFFD\u60000-\u6FFFD\u70000-\u7FFFD\u80000-\u8FFFD\u90000-\u9FFFD\uA0000-\uAFFFD\uB0000-\uBFFFD\uC0000-\uCFFFD\uD0000-\uDFFFD\uE1000-\uEFFFD}!\$&'\(\)\*\+,;=:])*@)?(?:\[(?:(?:(?:[0-9a-f]{1,4}:){6}(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3})|::(?:[0-9a-f]{1,4}:){5}(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3})|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3})|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3})|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3})|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3})|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3})|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|v[0-9a-f]+\.[-a-z0-9\._~!\$&'\(\)\*\+,;=:]+)\]|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3|(?:%[0-9a-f][0-9a-f]|[-a-z0-9\._~\uA0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF\u10000-\u1FFFD\u20000-\u2FFFD\u30000-\u3FFFD\u40000-\u4FFFD\u50000-\u5FFFD\u60000-\u6FFFD\u70000-\u7FFFD\u80000-\u8FFFD\u90000-\u9FFFD\uA0000-\uAFFFD\uB0000-\uBFFFD\uC0000-\uCFFFD\uD0000-\uDFFFD\uE1000-\uEFFFD!\$&'\(\)\*\+,;=])*)(?::[0-9]*)?(?:\/(?:(?:%[0-9a-f][0-9a-f]|[-a-z0-9\._~\uA0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF\u10000-\u1FFFD\u20000-\u2FFFD\u30000-\u3FFFD\u40000-\u4FFFD\u50000-\u5FFFD\u60000-\u6FFFD\u70000-\u7FFFD\u80000-\u8FFFD\u90000-\u9FFFD\uA0000-\uAFFFD\uB0000-\uBFFFD\uC0000-\uCFFFD\uD0000-\uDFFFD\uE1000-\uEFFFD!\$&'\(\)\*\+,;=:@]))*)*|\/(?:(?:(?:(?:%[0-9a-f][0-9a-f]|[-a-z0-9\._~\uA0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF\u10000-\u1FFFD\u20000-\u2FFFD\u30000-\u3FFFD\u40000-\u4FFFD\u50000-\u5FFFD\u60000-\u6FFFD\u70000-\u7FFFD\u80000-\u8FFFD\u90000-\u9FFFD\uA0000-\uAFFFD\uB0000-\uBFFFD\uC0000-\uCFFFD\uD0000-\uDFFFD\uE1000-\uEFFFD!\$&'\(\)\*\+,;=:@]))+)(?:\/(?:(?:%[0-9a-f][0-9a-f]|[-a-z0-9\._~\uA0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF\u10000-\u1FFFD\u20000-\u2FFFD\u30000-\u3FFFD\u40000-\u4FFFD\u50000-\u5FFFD\u60000-\u6FFFD\u70000-\u7FFFD\u80000-\u8FFFD\u90000-\u9FFFD\uA0000-\uAFFFD\uB0000-\uBFFFD\uC0000-\uCFFFD\uD0000-\uDFFFD\uE1000-\uEFFFD!\$&'\(\)\*\+,;=:@]))*)*)?|(?:(?:(?:%[0-9a-f][0-9a-f]|[-a-z0-9\._~\uA0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF\u10000-\u1FFFD\u20000-\u2FFFD\u30000-\u3FFFD\u40000-\u4FFFD\u50000-\u5FFFD\u60000-\u6FFFD\u70000-\u7FFFD\u80000-\u8FFFD\u90000-\u9FFFD\uA0000-\uAFFFD\uB0000-\uBFFFD\uC0000-\uCFFFD\uD0000-\uDFFFD\uE1000-\uEFFFD!\$&'\(\)\*\+,;=:@]))+)(?:\/(?:(?:%[0-9a-f][0-9a-f]|[-a-z0-9\._~\uA0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF\u10000-\u1FFFD\u20000-\u2FFFD\u30000-\u3FFFD\u40000-\u4FFFD\u50000-\u5FFFD\u60000-\u6FFFD\u70000-\u7FFFD\u80000-\u8FFFD\u90000-\u9FFFD\uA0000-\uAFFFD\uB0000-\uBFFFD\uC0000-\uCFFFD\uD0000-\uDFFFD\uE1000-\uEFFFD!\$&'\(\)\*\+,;=:@]))*)*|(?!(?:%[0-9a-f][0-9a-f]|[-a-z0-9\._~\uA0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF\u10000-\u1FFFD\u20000-\u2FFFD\u30000-\u3FFFD\u40000-\u4FFFD\u50000-\u5FFFD\u60000-\u6FFFD\u70000-\u7FFFD\u80000-\u8FFFD\u90000-\u9FFFD\uA0000-\uAFFFD\uB0000-\uBFFFD\uC0000-\uCFFFD\uD0000-\uDFFFD\uE1000-\uEFFFD!\$&'\(\)\*\+,;=:@])))(?:\?(?:(?:%[0-9a-f][0-9a-f]|[-a-z0-9\._~\uA0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF\u10000-\u1FFFD\u20000-\u2FFFD\u30000-\u3FFFD\u40000-\u4FFFD\u50000-\u5FFFD\u60000-\u6FFFD\u70000-\u7FFFD\u80000-\u8FFFD\u90000-\u9FFFD\uA0000-\uAFFFD\uB0000-\uBFFFD\uC0000-\uCFFFD\uD0000-\uDFFFD\uE1000-\uEFFFD!\$&'\(\)\*\+,;=:@])|[\uE000-\uF8FF\uF0000-\uFFFFD\u100000-\u10FFFD\/\?])*)?(?:\#(?:(?:%[0-9a-f][0-9a-f]|[-a-z0-9\._~\uA0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF\u10000-\u1FFFD\u20000-\u2FFFD\u30000-\u3FFFD\u40000-\u4FFFD\u50000-\u5FFFD\u60000-\u6FFFD\u70000-\u7FFFD\u80000-\u8FFFD\u90000-\u9FFFD\uA0000-\uAFFFD\uB0000-\uBFFFD\uC0000-\uCFFFD\uD0000-\uDFFFD\uE1000-\uEFFFD!\$&'\(\)\*\+,;=:@])|[\/\?])*)?|(?:\/\/(?:(?:%[0-9a-f][0-9a-f]|[-a-z0-9\._~\uA0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF\u10000-\u1FFFD\u20000-\u2FFFD\u30000-\u3FFFD\u40000-\u4FFFD\u50000-\u5FFFD\u60000-\u6FFFD\u70000-\u7FFFD\u80000-\u8FFFD\u90000-\u9FFFD\uA0000-\uAFFFD\uB0000-\uBFFFD\uC0000-\uCFFFD\uD0000-\uDFFFD\uE1000-\uEFFFD}!\$&'\(\)\*\+,;=:])*@)?(?:\[(?:(?:(?:[0-9a-f]{1,4}:){6}(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3})|::(?:[0-9a-f]{1,4}:){5}(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3})|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3})|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3})|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3})|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3})|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3})|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|v[0-9a-f]+\.[-a-z0-9\._~!\$&'\(\)\*\+,;=:]+)\]|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3|(?:%[0-9a-f][0-9a-f]|[-a-z0-9\._~\uA0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF\u10000-\u1FFFD\u20000-\u2FFFD\u30000-\u3FFFD\u40000-\u4FFFD\u50000-\u5FFFD\u60000-\u6FFFD\u70000-\u7FFFD\u80000-\u8FFFD\u90000-\u9FFFD\uA0000-\uAFFFD\uB0000-\uBFFFD\uC0000-\uCFFFD\uD0000-\uDFFFD\uE1000-\uEFFFD!\$&'\(\)\*\+,;=])*)(?::[0-9]*)?(?:\/(?:(?:%[0-9a-f][0-9a-f]|[-a-z0-9\._~\uA0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF\u10000-\u1FFFD\u20000-\u2FFFD\u30000-\u3FFFD\u40000-\u4FFFD\u50000-\u5FFFD\u60000-\u6FFFD\u70000-\u7FFFD\u80000-\u8FFFD\u90000-\u9FFFD\uA0000-\uAFFFD\uB0000-\uBFFFD\uC0000-\uCFFFD\uD0000-\uDFFFD\uE1000-\uEFFFD!\$&'\(\)\*\+,;=:@]))*)*|\/(?:(?:(?:(?:%[0-9a-f][0-9a-f]|[-a-z0-9\._~\uA0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF\u10000-\u1FFFD\u20000-\u2FFFD\u30000-\u3FFFD\u40000-\u4FFFD\u50000-\u5FFFD\u60000-\u6FFFD\u70000-\u7FFFD\u80000-\u8FFFD\u90000-\u9FFFD\uA0000-\uAFFFD\uB0000-\uBFFFD\uC0000-\uCFFFD\uD0000-\uDFFFD\uE1000-\uEFFFD!\$&'\(\)\*\+,;=:@]))+)(?:\/(?:(?:%[0-9a-f][0-9a-f]|[-a-z0-9\._~\uA0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF\u10000-\u1FFFD\u20000-\u2FFFD\u30000-\u3FFFD\u40000-\u4FFFD\u50000-\u5FFFD\u60000-\u6FFFD\u70000-\u7FFFD\u80000-\u8FFFD\u90000-\u9FFFD\uA0000-\uAFFFD\uB0000-\uBFFFD\uC0000-\uCFFFD\uD0000-\uDFFFD\uE1000-\uEFFFD!\$&'\(\)\*\+,;=:@]))*)*)?|(?:(?:%[0-9a-f][0-9a-f]|[-a-z0-9\._~\uA0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF\u10000-\u1FFFD\u20000-\u2FFFD\u30000-\u3FFFD\u40000-\u4FFFD\u50000-\u5FFFD\u60000-\u6FFFD\u70000-\u7FFFD\u80000-\u8FFFD\u90000-\u9FFFD\uA0000-\uAFFFD\uB0000-\uBFFFD\uC0000-\uCFFFD\uD0000-\uDFFFD\uE1000-\uEFFFD!\$&'\(\)\*\+,;=@])+)(?:\/(?:(?:%[0-9a-f][0-9a-f]|[-a-z0-9\._~\uA0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF\u10000-\u1FFFD\u20000-\u2FFFD\u30000-\u3FFFD\u40000-\u4FFFD\u50000-\u5FFFD\u60000-\u6FFFD\u70000-\u7FFFD\u80000-\u8FFFD\u90000-\u9FFFD\uA0000-\uAFFFD\uB0000-\uBFFFD\uC0000-\uCFFFD\uD0000-\uDFFFD\uE1000-\uEFFFD!\$&'\(\)\*\+,;=:@]))*)*|(?!(?:%[0-9a-f][0-9a-f]|[-a-z0-9\._~\uA0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF\u10000-\u1FFFD\u20000-\u2FFFD\u30000-\u3FFFD\u40000-\u4FFFD\u50000-\u5FFFD\u60000-\u6FFFD\u70000-\u7FFFD\u80000-\u8FFFD\u90000-\u9FFFD\uA0000-\uAFFFD\uB0000-\uBFFFD\uC0000-\uCFFFD\uD0000-\uDFFFD\uE1000-\uEFFFD!\$&'\(\)\*\+,;=:@])))(?:\?(?:(?:%[0-9a-f][0-9a-f]|[-a-z0-9\._~\uA0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF\u10000-\u1FFFD\u20000-\u2FFFD\u30000-\u3FFFD\u40000-\u4FFFD\u50000-\u5FFFD\u60000-\u6FFFD\u70000-\u7FFFD\u80000-\u8FFFD\u90000-\u9FFFD\uA0000-\uAFFFD\uB0000-\uBFFFD\uC0000-\uCFFFD\uD0000-\uDFFFD\uE1000-\uEFFFD!\$&'\(\)\*\+,;=:@])|[\uE000-\uF8FF\uF0000-\uFFFFD\u100000-\u10FFFD\/\?])*)?(?:\#(?:(?:%[0-9a-f][0-9a-f]|[-a-z0-9\._~\uA0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF\u10000-\u1FFFD\u20000-\u2FFFD\u30000-\u3FFFD\u40000-\u4FFFD\u50000-\u5FFFD\u60000-\u6FFFD\u70000-\u7FFFD\u80000-\u8FFFD\u90000-\u9FFFD\uA0000-\uAFFFD\uB0000-\uBFFFD\uC0000-\uCFFFD\uD0000-\uDFFFD\uE1000-\uEFFFD!\$&'\(\)\*\+,;=:@])|[\/\?])*)?)$/i;
class anyURI extends CommonStringBased {
    constructor() {
        super(...arguments);
        this.name = "anyURI";
        this.typeErrorMsg = "not a valid anyURI";
        this.regexp = reJsRfc3987UriReference;
        this.needsContext = false;
        this.validParams = [patternP, lengthP, minLengthP, maxLengthP];
    }
}
const types = [
    string_,
    normalizedString,
    token,
    language,
    Name,
    NCName,
    NMTOKEN,
    NMTOKENS,
    ID,
    IDREF,
    IDREFS,
    ENTITY,
    ENTITIES,
    decimal,
    integer,
    nonPositiveInteger,
    negativeInteger,
    nonNegativeInteger,
    positiveInteger,
    long_,
    int_,
    short_,
    byte_,
    unsignedLong,
    unsignedInt,
    unsignedShort,
    unsignedByte,
    boolean_,
    base64Binary,
    hexBinary,
    float_,
    double_,
    QName,
    NOTATION,
    duration,
    dateTime,
    time,
    date,
    gYearMonth,
    gYear,
    gMonthDay,
    gDay,
    gMonth,
    anyURI,
];
const library = {
    // tslint:disable-next-line: no-http-string
    uri: "http://www.w3.org/2001/XMLSchema-datatypes",
    types: {},
};
for (const type of types) {
    const instance = new type();
    library.types[instance.name] = instance;
}
/**
 * The XML Schema datatype library.
 */
exports.xmlschema = library;
//  LocalWords:  XMLSchema datatypes MPL whitespace param minLength maxLength
//  LocalWords:  RNG rng failedOn totalDigits fractionDigits ValueError repr zA
//  LocalWords:  ParamError maxInclusive maxExclusive NaN minInclusive params
//  LocalWords:  minExclusive whitespaces parseParams unparsed XMLSChema NCName
//  LocalWords:  normalizedString xmlNameChar NMTOKEN NMTOKENS IDREF xmlNcname
//  LocalWords:  IDREFS decimalPattern integerPattern highestVal lowestVal AQgw
//  LocalWords:  nonPositiveInteger negativeInteger nonNegativeInteger Za fA Ee
//  LocalWords:  positiveInteger unsignedLong unsignedInt unsignedShort QName
//  LocalWords:  unsignedByte AEIMQUYcgkosw hexBinary tzPattern yearPattern TZ
//  LocalWords:  monthPattern domPattern timePattern dateTime gYearMonth gYear
//  LocalWords:  gMonthDay gDay gMonth anyURI withTime
//# sourceMappingURL=xmlschema.js.map