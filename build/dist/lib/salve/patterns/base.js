"use strict";
/**
 * Classes that model RNG patterns.
 * @author Louis-Dominique Dubeau
 * @license MPL 2.0
 * @copyright Mangalam Research Center for Buddhist Languages
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventsToTreeString = exports.isAttributeEvent = exports.TwoSubpatterns = exports.OneSubpattern = exports.Pattern = exports.BasePattern = exports.InternalFireEventResult = void 0;
class InternalFireEventResult {
    constructor(matched, errors, refs) {
        this.matched = matched;
        this.errors = errors;
        this.refs = refs;
    }
    static fromEndResult(result) {
        return (result === false) ?
            new InternalFireEventResult(true) :
            new InternalFireEventResult(false, result);
    }
    combine(other) {
        if (this.matched) {
            const { refs } = this;
            const oRefs = other.refs;
            return oRefs === undefined ?
                this :
                new InternalFireEventResult(true, undefined, refs === undefined ? oRefs :
                    refs.concat(oRefs));
        }
        const { errors } = this;
        const oErrors = other.errors;
        return oErrors === undefined ?
            this :
            new InternalFireEventResult(false, errors === undefined ? oErrors :
                errors.concat(oErrors), undefined);
    }
}
exports.InternalFireEventResult = InternalFireEventResult;
/**
 * These patterns form a JavaScript representation of the simplified RNG
 * tree. The base class implements a leaf in the RNG tree. In other words, it
 * does not itself refer to children Patterns. (To put it in other words, it has
 * no subpatterns.)
 */
class BasePattern {
    /**
     * @param xmlPath This is a string which uniquely identifies the element from
     * the simplified RNG tree. Used in debugging.
     */
    constructor(xmlPath) {
        this.xmlPath = xmlPath;
    }
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
    // tslint:disable-next-line:no-empty
    _prepare(definitions, namespaces) {
    }
    /**
     * This method tests whether a pattern is an attribute pattern or contains
     * attribute patterns. This method does not cross element boundaries. That is,
     * if element X cannot have attributes of its own but can contain elements
     * that can have attributes, the return value if this method is called on the
     * pattern contained by element X's pattern will be ``false``.
     *
     * @returns True if the pattern is or has attributes. False if not.
     */
    hasAttrs() {
        return false;
    }
    /**
     * This method determines whether a pattern has the ``empty``
     * pattern. Generally, this means that either this pattern is the ``empty``
     * pattern or has ``empty`` as a child.
     */
    hasEmptyPattern() {
        return false;
    }
}
exports.BasePattern = BasePattern;
/**
 * This is the common class from which patterns are derived. Most patterns
 * create a new walker by passing a name resolver. The one exception is
 * [[Grammar]], which creates the name resolver that are used by other
 * patterns. So when calling it we do not need a ``resolver`` parameter and thus
 * it inherits from [[BasePattern]] rather than [[Pattern]].
 */
class Pattern extends BasePattern {
    /**
     * Creates a new walker to walk this pattern.
     *
     * @returns A walker.
     */
    newWalker() {
        // Rather than make it abstract, we provide a default implementation for
        // this method, which throws an exception if called. We could probably
        // reorganize the code to do without but a) we would not gain much b) it
        // would complicate the type hierarchy. The cost is not worth the
        // benefits. There are two patterns that land on this default implementation
        // and neither can have newWalker called on them anyway.
        throw new Error("derived classes must override this");
    }
}
exports.Pattern = Pattern;
/**
 * Pattern objects of this class have exactly one child pattern.
 */
class OneSubpattern extends Pattern {
    constructor(xmlPath, pat) {
        super(xmlPath);
        this.pat = pat;
    }
    _prepare(definitions, namespaces) {
        this.pat._prepare(definitions, namespaces);
        this._cachedHasAttrs = this.pat.hasAttrs();
        this._cachedHasEmptyPattern = this.pat.hasEmptyPattern();
    }
    hasAttrs() {
        // tslint:disable-next-line:no-non-null-assertion
        return this._cachedHasAttrs;
    }
    hasEmptyPattern() {
        // tslint:disable-next-line:no-non-null-assertion
        return this._cachedHasEmptyPattern;
    }
}
exports.OneSubpattern = OneSubpattern;
/**
 * Pattern objects of this class have exactly two child patterns.
 *
 */
class TwoSubpatterns extends Pattern {
    constructor(xmlPath, patA, patB) {
        super(xmlPath);
        this.patA = patA;
        this.patB = patB;
    }
    _prepare(definitions, namespaces) {
        this.patA._prepare(definitions, namespaces);
        this.patB._prepare(definitions, namespaces);
        this._cachedHasAttrs = this.patA.hasAttrs() || this.patB.hasAttrs();
        this._cachedHasEmptyPattern = this._computeHasEmptyPattern();
    }
    hasAttrs() {
        // tslint:disable-next-line:no-non-null-assertion
        return this._cachedHasAttrs;
    }
    hasEmptyPattern() {
        // tslint:disable-next-line:no-non-null-assertion
        return this._cachedHasEmptyPattern;
    }
}
exports.TwoSubpatterns = TwoSubpatterns;
function isAttributeEvent(name) {
    return name === "attributeName" || name === "attributeValue" ||
        name === "attributeNameAndValue";
}
exports.isAttributeEvent = isAttributeEvent;
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
function eventsToTreeString(evs) {
    const eventArray = evs instanceof Set ? Array.from(evs) : evs;
    const hash = new Map();
    for (const { name, param } of eventArray) {
        if (param !== null) {
            let nextNode = hash.get(name);
            if (nextNode === undefined) {
                nextNode = new Map();
                hash.set(name, nextNode);
            }
            nextNode.set(param.toString(), false);
        }
        else {
            hash.set(name, false);
        }
    }
    function dumpTree(toDump, indent) {
        let ret = "";
        const keys = Array.from(toDump.keys());
        keys.sort();
        for (const key of keys) {
            // tslint:disable-next-line:no-non-null-assertion
            const sub = toDump.get(key);
            if (sub !== false) {
                ret += `${indent}${key}:\n`;
                ret += dumpTree(sub, `${indent}    `);
            }
            else {
                ret += `${indent}${key}\n`;
            }
        }
        return ret;
    }
    return dumpTree(hash, "");
    /* tslint:enable */
}
exports.eventsToTreeString = eventsToTreeString;
//  LocalWords:  RNG MPL lookahead xmlns uri CodeMirror tokenizer enterStartTag
//  LocalWords:  EOF attributeName el xmlPath buf nameOrPath util ret EventSet
//  LocalWords:  NameResolver args unshift HashSet subpatterns newID NG vm pre
//  LocalWords:  firstName lastName attributeValue leaveStartTag dumpTree const
//  LocalWords:  dumpTreeBuf subwalker fireEvent suppressAttributes HashMap
//  LocalWords:  ValidationError RefWalker DefineWalker
//# sourceMappingURL=base.js.map