"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.step15 = void 0;
/**
 * Simplification step 15.
 * @author Louis-Dominique Dubeau
 * @license MPL 2.0
 * @copyright 2013, 2014 Mangalam Research Center for Buddhist Languages
 */
const parser_1 = require("../parser");
const schema_validation_1 = require("../schema-validation");
const util_1 = require("./util");
class GrammarNode {
    constructor(id, grammar) {
        this.id = id;
        this.grammar = grammar;
        this.childGrammars = [];
        this.defines = [];
        this.refs = [];
        this.parentRefs = [];
        this.refNames = new Set();
        this.parentRefNames = new Set();
        this.defineNames = new Set();
    }
}
function gatherGrammars(el, state) {
    const { local } = el;
    const { stack } = state;
    const top = stack[stack.length - 1];
    let pop = false;
    switch (local) {
        case "ref":
            top.refs.push(el);
            top.refNames.add(el.mustGetAttribute("name"));
            break;
        case "define":
            top.defines.push(el);
            top.defineNames.add(el.mustGetAttribute("name"));
            break;
        case "grammar":
            pop = true;
            const thisGrammar = new GrammarNode(++state.latestId, el);
            stack.push(thisGrammar);
            if (top !== undefined) {
                top.childGrammars.push(thisGrammar);
            }
            break;
        case "parentRef":
            top.parentRefs.push(el);
            top.parentRefNames.add(el.mustGetAttribute("name"));
            break;
        default:
            if (state.root === null) {
                stack.push(new GrammarNode(++state.latestId, el));
                pop = true;
            }
    }
    if (state.root === null) {
        // We have to acquire it from stack[0] and not from the variable top.
        state.root = stack[0];
    }
    for (const child of el.children) {
        if (!parser_1.isElement(child)) {
            continue;
        }
        gatherGrammars(child, state);
    }
    if (pop) {
        stack.pop();
    }
}
function transformGrammars(multiple, root, parent, grammar) {
    for (const name of grammar.refNames) {
        if (!grammar.defineNames.has(name)) {
            throw new schema_validation_1.SchemaValidationError(`dangling ref: ${name}`);
        }
    }
    if (parent === null && grammar.parentRefNames.size !== 0) {
        throw new schema_validation_1.SchemaValidationError("top-level grammar contains parentRef!");
    }
    for (const name of grammar.parentRefNames) {
        // The test above ensures parent is not null.
        // tslint:disable-next-line:no-non-null-assertion
        if (!parent.defineNames.has(name)) {
            throw new schema_validation_1.SchemaValidationError(`dangling parentRef: ${name}`);
        }
    }
    const toRename = grammar.defines.concat(grammar.refs, ...grammar.childGrammars.map(x => x.parentRefs));
    const suffix = `-gr-${grammar.id}`;
    // Make all names unique globally.
    for (const el of toRename) {
        el.setAttribute("name", el.mustGetAttribute("name") + suffix);
    }
    // Move the ``define`` elements to the root grammar. We do this on the root
    // grammar too so that the ``define`` elements are moved after ``start``.
    root.grammar.appendChildren(grammar.defines);
    for (const child of grammar.childGrammars) {
        transformGrammars(multiple, root, grammar, child);
    }
    // Rename all parentRef elements to ref elements.
    for (const parentRef of grammar.parentRefs) {
        parentRef.local = "ref";
    }
    const start = grammar.grammar.children[0];
    if (start.local !== "start") {
        throw new Error("there should be a single start element in the grammar!");
    }
    if (grammar !== root) {
        // Remove the remaining ``grammar`` and ``start`` elements.
        grammar.grammar.parent.replaceChildWith(grammar.grammar, start.children[0]);
    }
}
/**
 * Implements step 15 of the XSL pipeline. Namely:
 *
 * - Rename each ``define`` element so as to make it unique across the
 *   schema. We do this by giving a unique id to each ``grammar`` element, which
 *   is the number of ``grammar`` elements before it, in document reading order,
 *   plus 1. Then we add to ``define/@name`` the string ``-gr-{id}`` where
 *   ``{id}`` is the grammar's id of the grammar to which the ``define``
 *   belongs. NOTE: this pattern was selected to avoid a clash with step 16,
 *   which creates new ``define`` elements.
 *
 * - Rename each ``ref`` and ``parentRef`` to preserve the references the
 *   establish to ``define`` elements.
 *
 * - Create a top level ``grammar/start`` structure, if necessary.
 *
 * - Move all ``define`` elements to the top ``grammar``.
 *
 * - Rename all ``parentRef`` elements to ``ref``.
 *
 * - Replace all ``grammar/start`` elements with the expression contained
 *   therein, except for the top level ``grammar/start``.
 *
 * @param el The tree to process. It is modified in-place.
 *
 * @returns The new tree root.
 */
function step15(el) {
    let root = el;
    if (el.local !== "grammar") {
        root = parser_1.Element.makeElement("grammar", [parser_1.Element.makeElement("start", [el])]);
        root.setXMLNS(util_1.RELAXNG_URI);
        el.removeAttribute("xmlns");
    }
    const state = {
        latestId: 0,
        root: null,
        stack: [],
    };
    gatherGrammars(root, state);
    const multiple = state.latestId !== 1;
    // tslint:disable-next-line:no-non-null-assertion
    const grammar = state.root;
    if (multiple) {
        transformGrammars(multiple, grammar, null, grammar);
    }
    else {
        // If we have only a single grammar, we can reduce the work to this.
        for (const name of grammar.refNames) {
            if (!grammar.defineNames.has(name)) {
                throw new schema_validation_1.SchemaValidationError(`dangling ref: ${name}`);
            }
        }
        if (grammar.parentRefNames.size !== 0) {
            throw new schema_validation_1.SchemaValidationError("top-level grammar contains parentRef!");
        }
        let start = grammar.grammar.children[0];
        if (start.local !== "start") {
            // The first element is not start. Move the defines around.
            grammar.grammar.appendChildren(grammar.defines);
            start = grammar.grammar.children[0];
            if (start.local !== "start") {
                // Somehow it did not work!
                throw new Error("there should be a single start element in the \
grammar!");
            }
        }
    }
    return root;
}
exports.step15 = step15;
//# sourceMappingURL=step15.js.map