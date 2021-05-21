"use strict";
/**
 * This module contains classes for writing salve's internal schema format.
 *
 * @author Louis-Dominique Dubeau
 * @license MPL 2.0
 * @copyright Mangalam Research Center for Buddhist Languages
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeTreeToJSON = void 0;
const parser_1 = require("../conversion/parser");
const common_1 = require("./common");
const NAME_TO_METHOD_NAME = {
    __proto__: null,
    group: "_group",
    interleave: "_interleave",
    choice: "_choice",
    oneOrMore: "_oneOrMore",
    element: "_element",
    attribute: "_attribute",
    ref: "_ref",
    define: "_define",
    value: "_value",
    data: "_data",
    list: "_list",
    notAllowed: "_notAllowed",
    empty: "_empty",
    text: "_text",
    name: "_name",
    nameChoice: "_nameChoice",
    nsName: "_nsName",
    anyName: "_anyName",
}; // Unfortunately __proto__ requires ``as any``.
class RNGToJSONConverter {
    /**
     * @param version The version of the format to produce.
     *
     * @param nameMap A map for renaming named elements.
     *
     * @param includePaths Whether to include paths in the output.
     *
     * @param verbose Whether to output verbosely.
     *
     * @throws {Error} If the version requested in ``version`` is not supported.
     */
    constructor(version, nameMap, includePaths, verbose) {
        this.nameMap = nameMap;
        this.includePaths = includePaths;
        this.verbose = verbose;
        this._output = "";
        this._firstItem = true;
        if (version !== 3) {
            throw new Error("DefaultConversionWalker only supports version 3");
        }
        this.arrayStart = this.verbose ? "\"Array\"" : 0;
    }
    /** The output of the conversion. */
    get output() {
        return this._output;
    }
    /**
     * Resets the walker to a blank state. This allows using the same walker for
     * multiple walks.
     */
    reset() {
        this._output = "";
        this._firstItem = true;
    }
    /**
     * Opens a construct in the output.
     *
     * @param open The opening string.
     *
     * @param close The closing string. This will be used to check that the
     * construct is closed properly.
     */
    openConstruct(open) {
        this.newItem();
        this._firstItem = true;
        this._output += open;
    }
    /**
     * Indicates that a new item is about to start in the current construct.
     * Outputs a separator (",") if this is not the first item in the construct.
     */
    newItem() {
        if (this._firstItem) {
            this._firstItem = false;
            return;
        }
        this._output += ",";
    }
    /**
     * Outputs an item in the current construct. Outputs a separator (",") if this
     * is not the first item in the construct.
     *
     * @param item The item to output.
     */
    outputItem(item) {
        this.newItem();
        this._output += (typeof item === "number") ? item.toString() : item;
    }
    /**
     * Outputs a string in the current construct. Outputs a separator (",") if
     * this is not the first item in the construct. The double-quotes in the
     * string will be escaped and the string will be surrounded by double quotes
     * in the output.
     *
     * @param thing The string to output.
     */
    outputAsString(thing) {
        this.newItem();
        const text = thing.replace(/(["\\])/g, "\\$1");
        this._output += `"${text}"`;
    }
    /**
     * Open an array in the output.
     */
    openArray() {
        this.openConstruct("[");
        this.outputItem(this.arrayStart);
    }
    convert(el) {
        if (el.local !== "grammar") {
            throw new Error("top level element must be grammar");
        }
        this.openConstruct("{");
        this.outputItem(`"v":3,"o":${this.includePaths ? 0 :
            common_1.OPTION_NO_PATHS},"d":`);
        const code = common_1.nameToCode.grammar;
        if (code === undefined) {
            throw new Error("can't find constructor for grammar");
        }
        this._firstItem = true;
        this.openConstruct("[");
        if (this.verbose) {
            this.outputAsString("Grammar");
        }
        else {
            this.outputItem(code);
        }
        if (this.includePaths) {
            this.outputAsString(el.path);
        }
        // el.children[0] is a start element: walk start's children.
        this.walkChildren(el.children[0]);
        this.openArray();
        // Walk the definitions...
        this.walkChildren(el, 1);
        this._output += "]]}";
    }
    // tslint:disable-next-line: max-func-body-length
    walk(el) {
        const { local } = el;
        const code = common_1.nameToCode[local];
        if (code === undefined) {
            throw new Error(`can't find constructor for ${local}`);
        }
        this.openConstruct("[");
        if (this.verbose) {
            this.outputAsString(local[0].toUpperCase() + local.slice(1));
        }
        else {
            this.outputItem(code);
        }
        if (this.includePaths) {
            this.outputAsString(el.path);
        }
        const handler = this[NAME_TO_METHOD_NAME[local]];
        if (handler === undefined) {
            throw new Error(`did not expect an element with name ${local} here`);
        }
        handler.call(this, el);
        this._output += "]";
    }
    // @ts-ignore
    _group(el) {
        this.openArray();
        this.walkChildren(el);
        this._output += "]";
    }
    // @ts-ignore
    _interleave(el) {
        this.openArray();
        this.walkChildren(el);
        this._output += "]";
    }
    // @ts-ignore
    _choice(el) {
        this.openArray();
        this.walkChildren(el);
        this._output += "]";
    }
    // @ts-ignore
    _oneOrMore(el) {
        this.openArray();
        this.walkChildren(el);
        this._output += "]";
    }
    // @ts-ignore
    _element(el) {
        // The first element of `<element>` is necessarily a name class. Note that
        // there is no need to worry about recursion since it is not possible to get
        // here recursively from the `this.walk` call that follows. (A name class
        // cannot contain `<element>`.)
        this.walkNameClass(el.children[0]);
        this.openArray();
        this.walkChildren(el, 1);
        this._output += "]";
    }
    // @ts-ignore
    _attribute(el) {
        // The first element of `<attribute>` is necessarily a name class. Note that
        // there is no need to worry about recursion since it is not possible to get
        // here recursively from the `this.walk` call that follows. (A name class
        // cannot contain `<attribute>`.)
        this.walkNameClass(el.children[0]);
        this.openArray();
        this.walkChildren(el, 1);
        this._output += "]";
    }
    // @ts-ignore
    _ref(el) {
        const name = el.mustGetAttribute("name");
        if (this.nameMap !== undefined) {
            // tslint:disable-next-line:no-non-null-assertion
            this.outputItem(this.nameMap.get(name));
        }
        else {
            this.outputAsString(name);
        }
    }
    // @ts-ignore
    _define(el) {
        const name = el.mustGetAttribute("name");
        if (this.nameMap !== undefined) {
            // tslint:disable-next-line:no-non-null-assertion
            this.outputItem(this.nameMap.get(name));
        }
        else {
            this.outputAsString(name);
        }
        this.openArray();
        this.walkChildren(el);
        this._output += "]";
    }
    // @ts-ignore
    _value(el) {
        // Output a variable number of items.
        // Suppose item 0 is called it0 and so forth. Then:
        //
        // Number of items  value  type    datatypeLibrary  ns
        // 1                it0    "token" ""               ""
        // 2                it0     it1    ""               ""
        // 3                it0     it1    it2              ""
        // 4                it0     it1    it2              it3
        //
        this.outputAsString(el.text);
        const typeAttr = el.mustGetAttribute("type");
        const datatypeLibraryAttr = el.mustGetAttribute("datatypeLibrary");
        const nsAttr = el.mustGetAttribute("ns");
        if (typeAttr !== "token" || datatypeLibraryAttr !== "" || nsAttr !== "") {
            this.outputAsString(typeAttr);
            if (datatypeLibraryAttr !== "" || nsAttr !== "") {
                this.outputAsString(datatypeLibraryAttr);
                // No value === empty string.
                if (nsAttr !== "") {
                    this.outputAsString(nsAttr);
                }
            }
        }
    }
    // @ts-ignore
    _data(el) {
        // Output a variable number of items.
        // Suppose item 0 is called it0 and so forth. Then:
        //
        // Number of items  type    datatypeLibrary params except
        // 0                "token" ""              {}     undefined
        // 1                it0     ""              {}     undefined
        // 2                it0     it1             {}     undefined
        // 3                it0     it1             it2    undefined
        // 4                it0     it1             it2    it3
        //
        // Parameters are necessarily first among the children.
        const { children } = el;
        const { length } = children;
        const hasParams = (length !== 0 &&
            (children[0].local === "param"));
        // Except is necessarily last.
        const hasExcept = (length !== 0 && children[length - 1].local === "except");
        const typeAttr = el.mustGetAttribute("type");
        const datatypeLibraryAttr = el.mustGetAttribute("datatypeLibrary");
        if (typeAttr !== "token" || datatypeLibraryAttr !== "" || hasParams ||
            hasExcept) {
            this.outputAsString(typeAttr);
            if (datatypeLibraryAttr !== "" || hasParams || hasExcept) {
                this.outputAsString(datatypeLibraryAttr);
                if (hasParams || hasExcept) {
                    this.openArray();
                    if (hasParams) {
                        const limit = hasExcept ? length - 1 : children.length;
                        for (let paramIx = 0; paramIx < limit; ++paramIx) {
                            const param = children[paramIx];
                            this.outputAsString(param.mustGetAttribute("name"));
                            this.outputAsString(param.children[0].text);
                        }
                    }
                    this._output += "]";
                    if (hasExcept) {
                        this.walkChildren(children[length - 1]);
                    }
                }
            }
        }
    }
    // @ts-ignore
    _list(el) {
        this.walkChildren(el);
    }
    // @ts-ignore
    // tslint:disable-next-line:no-empty
    _notAllowed(el) { }
    // @ts-ignore
    // tslint:disable-next-line:no-empty
    _empty(el) { }
    // @ts-ignore
    // tslint:disable-next-line:no-empty
    _text(el) { }
    // tslint:disable-next-line: max-func-body-length
    walkNameClass(el) {
        let { local } = el;
        if (local === "choice") {
            local = "nameChoice";
        }
        const code = common_1.nameToCode[local];
        if (code === undefined) {
            throw new Error(`can't find constructor for ${local}`);
        }
        this.openConstruct("[");
        if (this.verbose) {
            this.outputAsString(local[0].toUpperCase() + local.slice(1));
        }
        else {
            this.outputItem(code);
        }
        if (this.includePaths) {
            this.outputAsString(el.path);
        }
        const handler = this[NAME_TO_METHOD_NAME[local]];
        if (handler === undefined) {
            throw new Error(`did not expect an element with name ${local} here`);
        }
        handler.call(this, el);
        this._output += "]";
    }
    // @ts-ignore
    _name(el) {
        this.outputAsString(el.mustGetAttribute("ns"));
        this.outputAsString(el.text);
    }
    // @ts-ignore
    _nameChoice(el) {
        this.openArray();
        for (const child of el.children) {
            this.walkNameClass(child);
        }
        this._output += "]";
    }
    // @ts-ignore
    _nsName(el) {
        this.outputAsString(el.mustGetAttribute("ns"));
        this._anyName(el);
    }
    _anyName(el) {
        // There can only be at most one child, and it has to be "except".
        if (el.children.length > 0) {
            const except = el.children[0];
            // We do not output anything for this element itself but instead go
            // straight to its children.
            for (const child of except.children) {
                this.walkNameClass(child);
            }
        }
    }
    /**
     * Walks an element's children.
     *
     * @param el The element whose children must be walked.
     *
     * @param startAt Index at which to start walking.
     */
    walkChildren(el, startAt = 0) {
        const children = el.children;
        const limit = children.length;
        if (limit < startAt) {
            throw new Error("invalid parameters passed");
        }
        for (let i = startAt; i < limit; ++i) {
            const child = children[i];
            if (parser_1.isElement(child)) {
                this.walk(child);
            }
        }
    }
}
function gatherNamed(el, all) {
    for (const child of el.children) {
        if (!parser_1.isElement(child)) {
            continue;
        }
        if (child.local === "define" || child.local === "ref") {
            const name = child.mustGetAttribute("name");
            let count = all.get(name);
            if (count === undefined) {
                count = 0;
            }
            all.set(name, ++count);
        }
        gatherNamed(child, all);
    }
}
function writeTreeToJSON(tree, formatVersion, includePaths = false, verbose = false, rename = true) {
    let nameMap;
    if (rename) {
        const names = new Map();
        gatherNamed(tree, names);
        // Now assign new names with shorter new names being assigned to those
        // original names that are most frequent.
        const sorted = Array.from(names.entries());
        // Yes, we want to sort in reverse order of frequency, highest first.
        sorted.sort(([_keyA, freqA], [_keyB, freqB]) => freqB - freqA);
        let id = 1;
        nameMap = new Map();
        for (const [key] of sorted) {
            nameMap.set(key, id++);
        }
    }
    const walker = new RNGToJSONConverter(formatVersion, nameMap, includePaths, verbose);
    walker.convert(tree);
    return walker.output;
}
exports.writeTreeToJSON = writeTreeToJSON;
//# sourceMappingURL=write.js.map