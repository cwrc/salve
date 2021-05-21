"use strict";
/**
 * @author Louis-Dominique Dubeau
 * @license MPL 2.0
 * @copyright Mangalam Research Center for Buddhist Languages
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnyName = exports.NsName = exports.NameChoice = exports.Name = exports.isAnyName = exports.isNsName = exports.isNameChoice = exports.isName = exports.Base = void 0;
function escapeString(str) {
    return str.replace(/(["\\])/g, "\\$1");
}
/**
 * Base class for all name patterns.
 */
class Base {
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
    getNamespaces() {
        const namespaces = new Set();
        this._recordNamespaces(namespaces, true);
        return Array.from(namespaces);
    }
    /**
     * Alias of [[Base.toObject]].
     *
     * ``toJSON`` is a misnomer, as the data returned is not JSON but a JavaScript
     * object. This method exists so that ``JSON.stringify`` can use it.
     */
    toJSON() {
        return this.toObject();
    }
    /**
     * Stringify the pattern to a JSON string.
     *
     * @returns The stringified instance.
     */
    toString() {
        // Profiling showed that caching the string representation helps
        // performance.
        if (this._asString === undefined) {
            this._asString = this.asString();
        }
        return this._asString;
    }
}
exports.Base = Base;
function isName(name) {
    return name.kind === "Name";
}
exports.isName = isName;
function isNameChoice(name) {
    return name.kind === "NameChoice";
}
exports.isNameChoice = isNameChoice;
function isNsName(name) {
    return name.kind === "NsName";
}
exports.isNsName = isNsName;
function isAnyName(name) {
    return name.kind === "AnyName";
}
exports.isAnyName = isAnyName;
/**
 * Models the Relax NG ``<name>`` element.
 *
 */
class Name extends Base {
    /**
     * @param ns The namespace URI for this name. Corresponds to the
     * ``ns`` attribute in the simplified Relax NG syntax.
     *
     * @param name The name. Corresponds to the content of ``<name>``
     * in the simplified Relax NG syntax.
     *
     * @param documentation Attached documentation if available.
     */
    constructor(ns, name, documentation) {
        super();
        this.ns = ns;
        this.name = name;
        this.documentation = documentation;
        this.kind = "Name";
    }
    match(ns, name) {
        return this.name === name && this.ns === ns;
    }
    intersects(other) {
        return isName(other) ? this.match(other.ns, other.name) :
            // Delegate to the other classes.
            other.intersects(this);
    }
    intersection(other) {
        if (other === 0) {
            return 0;
        }
        if (isName(other)) {
            return this.match(other.ns, other.name) ? this : 0;
        }
        // Delegate to the other classes.
        return other.intersection(this);
    }
    // @ts-ignore
    wildcardMatch(ns, name) {
        return false; // This is not a wildcard.
    }
    toObject() {
        return {
            ns: this.ns,
            name: this.name,
            documentation: this.documentation,
        };
    }
    asString() {
        // We don't need to escape this.name because names cannot contain
        // things that need escaping.
        const doc = this.documentation ?
            `,"documentation":"${this.documentation}"` : "";
        return `{"ns":"${escapeString(this.ns)}","name":"${this.name}"${doc}}`;
    }
    simple() {
        return true;
    }
    toArray() {
        return [this];
    }
    _recordNamespaces(namespaces, recordEmpty) {
        if (this.ns === "" && !recordEmpty) {
            return;
        }
        namespaces.add(this.ns);
    }
}
exports.Name = Name;
/**
 * Models the Relax NG ``<choice>`` element when it appears in a name
 * class.
 */
class NameChoice extends Base {
    /**
     * @param a The first choice.
     *
     * @param b The second choice.
     */
    constructor(a, b) {
        super();
        this.a = a;
        this.b = b;
        this.kind = "NameChoice";
    }
    /**
     * Makes a tree of NameChoice objects out of a list of names.
     *
     * @param names The names from which to build a tree.
     *
     * @return If the list is a single name, then just that name. Otherwise,
     * the names from the list in a tree of [[NameChoice]].
     */
    static makeTree(names) {
        if (names.length === 0) {
            throw new Error("trying to make a tree out of nothing");
        }
        let ret;
        if (names.length > 1) {
            // More than one name left. Convert them to a tree.
            let top = new NameChoice(names[0], names[1]);
            for (let ix = 2; ix < names.length; ix++) {
                top = new NameChoice(top, names[ix]);
            }
            ret = top;
        }
        else {
            // Only one name: we can use it as-is.
            ret = names[0];
        }
        return ret;
    }
    match(ns, name) {
        return this.a.match(ns, name) || this.b.match(ns, name);
    }
    intersects(other) {
        return this.a.intersects(other) || this.b.intersects(other);
    }
    intersection(other) {
        if (other === 0) {
            return 0;
        }
        const a = this.a.intersection(other);
        const b = this.b.intersection(other);
        return a === 0 ? b : (b === 0 ? a : new NameChoice(a, b));
    }
    /**
     * Recursively apply a transformation to a NameChoice tree.
     *
     * @param fn The transformation to apply. It may return 0 to indicate that the
     * child has been transformed to the empty set.
     *
     * @returns The transformed tree, or 0 if the tree has been transformed to
     * nothing.
     */
    applyRecursively(fn) {
        const { a, b } = this;
        const newA = isNameChoice(a) ? a.applyRecursively(fn) : fn(a);
        const newB = isNameChoice(b) ? b.applyRecursively(fn) : fn(b);
        return newA === 0 ? newB :
            (newB === 0 ? newA : new NameChoice(newA, newB));
    }
    wildcardMatch(ns, name) {
        return this.a.wildcardMatch(ns, name) || this.b.wildcardMatch(ns, name);
    }
    toObject() {
        return {
            a: this.a.toObject(),
            b: this.b.toObject(),
        };
    }
    asString() {
        return `{"a":${this.a.toString()},"b":${this.b.toString()}}`;
    }
    simple() {
        return this.a.simple() && this.b.simple();
    }
    toArray() {
        const aArr = this.a.toArray();
        if (aArr === null) {
            return null;
        }
        const bArr = this.b.toArray();
        return bArr === null ? null : aArr.concat(bArr);
    }
    _recordNamespaces(namespaces, recordEmpty) {
        this.a._recordNamespaces(namespaces, recordEmpty);
        this.b._recordNamespaces(namespaces, recordEmpty);
    }
}
exports.NameChoice = NameChoice;
/**
 * Models the Relax NG ``<nsName>`` element.
 */
class NsName extends Base {
    /**
     * @param ns The namespace URI for this name. Corresponds to the ``ns``
     * attribute in the simplified Relax NG syntax.
     *
     * @param except Corresponds to an ``<except>`` element appearing as a child
     * of the ``<nsName>`` element in the Relax NG schema.
     */
    constructor(ns, except) {
        super();
        this.ns = ns;
        this.except = except;
        this.kind = "NsName";
    }
    match(ns, name) {
        return this.ns === ns && !(this.except !== undefined &&
            this.except.match(ns, name));
    }
    intersects(other) {
        if (isName(other)) {
            return this.ns === other.ns &&
                (this.except === undefined || !other.intersects(this.except));
        }
        return isNsName(other) ? this.ns === other.ns :
            // Delegate the logic to the other classes.
            other.intersects(this);
    }
    intersection(other) {
        if (other === 0) {
            return 0;
        }
        if (isName(other)) {
            if (this.ns !== other.ns) {
                return 0;
            }
            if (this.except !== undefined) {
                // We're computing other - other ^ this.except
                //
                // Since other is a single name, there are only two possible values for
                // other ^ this.except: other and 0.
                //
                // Consequently the whole equation can also only resolve to other and 0.
                return other.intersection(this.except) === 0 ? other : 0;
            }
            return other;
        }
        if (isNsName(other)) {
            if (this.ns !== other.ns) {
                return 0;
            }
            if (this.except !== undefined && other.except !== undefined) {
                // We have to create a new except that does not duplicate exceptions.
                // For instance if this excepts {q}foo and other excepts {q}foo too, we
                // don't want to have an exception that has {q}foo twice.
                // Due to Relax NG restrictions on NsName, both excepts necessarily
                // contain only Name or NameChoice elements.
                const theseNames = this.except.toArray();
                const otherNames = other.except.toArray();
                // And so these cannot be null.
                if (theseNames === null || otherNames === null) {
                    throw new Error("complex pattern found in NsName except");
                }
                // Find the unique names.
                const names = Array.from(new Map(theseNames.concat(otherNames)
                    .map(name => [`{${name.ns}}${name.name}`, name])).values());
                return new NsName(this.ns, NameChoice.makeTree(names));
            }
            return (other.except !== undefined) ? other : this;
        }
        // Delegate the logic to the other classes.
        return other.intersection(this);
    }
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
    subtract(other) {
        if (isNameChoice(other)) {
            // x - (a U b) = x - a U x - b
            return other.applyRecursively(child => {
                if (!(isName(child) || isNsName(child))) {
                    throw new Error("child is not Name or NsName");
                }
                return this.subtract(child);
            });
        }
        if (this.ns !== other.ns) {
            return this;
        }
        if (isName(other)) {
            return new NsName(this.ns, this.except === undefined ?
                other :
                new NameChoice(this.except, other));
        }
        if (other.except === undefined) {
            return 0;
        }
        if (this.except === undefined) {
            return other.except;
        }
        // Otherwise, return other.except - this.except. Yes, the order is
        // correct.
        // Due to Relax NG restrictions on NsName, both excepts may contain only
        // Name or NameChoice, so only simple patterns that can be converted to
        // arrays.
        const theseNames = this.except.toArray();
        const otherNames = other.except.toArray();
        if (theseNames === null || otherNames === null) {
            throw new Error("NsName contains an except pattern which is not simple.");
        }
        const result = otherNames
            .filter(name => !theseNames.some(thisName => name.ns === thisName.ns &&
            name.name === thisName.name));
        return result.length === 0 ? 0 : NameChoice.makeTree(result);
    }
    wildcardMatch(ns, name) {
        return this.match(ns, name);
    }
    toObject() {
        const ret = {
            ns: this.ns,
        };
        if (this.except !== undefined) {
            ret.except = this.except.toObject();
        }
        return ret;
    }
    asString() {
        const except = this.except === undefined ? "" :
            `,"except":${this.except.toString()}`;
        return `{"ns":"${escapeString(this.ns)}"${except}}`;
    }
    simple() {
        return false;
    }
    toArray() {
        return null;
    }
    _recordNamespaces(namespaces, recordEmpty) {
        if (this.ns !== "" || recordEmpty) {
            namespaces.add(this.ns);
        }
        if (this.except !== undefined) {
            namespaces.add("::except");
        }
    }
}
exports.NsName = NsName;
/**
 * Models the Relax NG ``<anyName>`` element.
 */
class AnyName extends Base {
    /**
     * @param except Corresponds to an ``<except>`` element appearing as a child
     * of the ``<anyName>`` element in the Relax NG schema.
     */
    constructor(except) {
        super();
        this.except = except;
        this.kind = "AnyName";
    }
    match(ns, name) {
        return (this.except === undefined) || !this.except.match(ns, name);
    }
    intersects(other) {
        if (this.except === undefined || isAnyName(other)) {
            return true;
        }
        if (isName(other)) {
            return !this.except.intersects(other);
        }
        if (isNsName(other)) {
            // Reminder: the except can only be one of three things: Name, NsName or
            // NameChoice so negation can only be 0, Name, NsName or NameChoice.
            const negation = this.except.intersection(other);
            //
            // We've commented out this test. The simplification/validation/checking
            // logic prevents us from failing this test.
            //
            // if (!(negation === 0 || isName(negation) || isNsName(negation) ||
            //       isNameChoice(negation))) {
            //   throw new Error("negation should be 0, Name, NsName or NameChoice");
            // }
            //
            // In the absence of the test above, we must assert the type of negation
            // here.
            return negation === 0 ||
                other.subtract(negation) !== 0;
        }
        throw new Error("cannot compute intersection!");
    }
    intersection(other) {
        if (other === 0) {
            return 0;
        }
        if (this.except === undefined) {
            return other;
        }
        if (isName(other)) {
            return this.except.intersection(other) === 0 ? other : 0;
        }
        if (isNsName(other)) {
            // Reminder: the except can only be one of three things: Name, NsName or
            // NameChoice so negation can only be 0, Name, NsName or NameChoice.
            const negation = this.except.intersection(other);
            //
            // We've commented out this test. The simplification/validation/checking
            // logic prevents us from failing this test.
            //
            // if (!(negation === 0 || isName(negation) || isNsName(negation) ||
            //       isNameChoice(negation))) {
            //   throw new Error("negation should be 0, Name, NsName or NameChoice");
            // }
            //
            // In the absence of the test above, we must assert the type of negation
            // here.
            return negation === 0 ? other :
                other.subtract(negation);
        }
        if (isAnyName(other)) {
            if (other.except !== undefined && this.except !== undefined) {
                return new AnyName(new NameChoice(this.except, other.except));
            }
            return (other.except !== undefined) ? other : this;
        }
        throw new Error("cannot compute intersection!");
    }
    wildcardMatch(ns, name) {
        return this.match(ns, name);
    }
    toObject() {
        const ret = {
            pattern: "AnyName",
        };
        if (this.except !== undefined) {
            ret.except = this.except.toObject();
        }
        return ret;
    }
    asString() {
        const except = this.except === undefined ? "" :
            `,"except":${this.except.toString()}`;
        return `{"pattern":"AnyName"${except}}`;
    }
    simple() {
        return false;
    }
    toArray() {
        return null;
    }
    _recordNamespaces(namespaces, _recordEmpty) {
        namespaces.add("*");
        if (this.except !== undefined) {
            namespaces.add("::except");
        }
    }
}
exports.AnyName = AnyName;
//  LocalWords:  MPL NG Stringify stringified AnyName
//# sourceMappingURL=name_patterns.js.map