"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalSimplifier = void 0;
const tslib_1 = require("tslib");
/**
 * A simplifier implemented in TypeScript (thus internal to Salve).
 *
 * @author Louis-Dominique Dubeau
 * @license MPL 2.0
 * @copyright Mangalam Research Center for Buddhist Languages
 */
const saxes_1 = require("saxes");
const datatypes_1 = require("../../datatypes");
const default_name_resolver_1 = require("../../default_name_resolver");
const read_1 = require("../../json-format/read");
const patterns_1 = require("../../patterns");
const relaxng = tslib_1.__importStar(require("../../schemas/relaxng.json"));
const parser_1 = require("../parser");
const schema_simplification_1 = require("../schema-simplification");
const schema_validation_1 = require("../schema-validation");
const simplifier = tslib_1.__importStar(require("../simplifier"));
const util_1 = require("../simplifier/util");
const base_1 = require("./base");
const common_1 = require("./common");
function makeNamePattern(el) {
    switch (el.local) {
        case "name":
            return new patterns_1.Name(el.mustGetAttribute("ns"), el.text, el.documentation);
        case "choice":
            return new patterns_1.NameChoice(makeNamePattern(el.children[0]), makeNamePattern(el.children[1]));
        case "anyName": {
            const first = el.children[0];
            return new patterns_1.AnyName(first !== undefined ? makeNamePattern(first) :
                undefined);
        }
        case "nsName": {
            const first = el.children[0];
            return new patterns_1.NsName(el.mustGetAttribute("ns"), first !== undefined ? makeNamePattern(first) :
                undefined);
        }
        case "except":
            return makeNamePattern(el.children[0]);
        default:
            throw new Error(`unexpected element in name pattern ${el.local}`);
    }
}
class ProhibitedPath extends schema_validation_1.SchemaValidationError {
    constructor(path) {
        super(`prohibited path: ${path}`);
    }
}
class ProhibitedAttributePath extends schema_validation_1.SchemaValidationError {
    constructor(name) {
        super(`attribute//${name}`);
    }
}
class ProhibitedListPath extends schema_validation_1.SchemaValidationError {
    constructor(name) {
        super(`list//${name}`);
    }
}
class ProhibitedStartPath extends schema_validation_1.SchemaValidationError {
    constructor(name) {
        super(`start//${name}`);
    }
}
class ProhibitedDataExceptPath extends schema_validation_1.SchemaValidationError {
    constructor(name) {
        super(`data/except//${name}`);
    }
}
const EMPTY_ELEMENT_ARRAY = [];
const EMPTY_NAME_ARRAY = [];
const TEXT_RESULT = {
    contentType: 1 /* COMPLEX */,
    occurringAttributeNames: EMPTY_NAME_ARRAY,
    occurringRefs: EMPTY_ELEMENT_ARRAY,
    occurringTexts: true,
};
const EMPTY_RESULT = {
    contentType: 0 /* EMPTY */,
    occurringAttributeNames: EMPTY_NAME_ARRAY,
    occurringRefs: EMPTY_ELEMENT_ARRAY,
    occurringTexts: false,
};
const DATA_RESULT = {
    contentType: 2 /* SIMPLE */,
    occurringAttributeNames: EMPTY_NAME_ARRAY,
    occurringRefs: EMPTY_ELEMENT_ARRAY,
    occurringTexts: false,
};
const LIST_RESULT = DATA_RESULT;
const VALUE_RESULT = DATA_RESULT;
const NOT_ALLOWED_RESULT = {
    contentType: null,
    occurringAttributeNames: EMPTY_NAME_ARRAY,
    occurringRefs: EMPTY_ELEMENT_ARRAY,
    occurringTexts: false,
};
const FORBIDDEN_IN_START = ["attribute", "data", "value", "text", "list",
    "group", "interleave", "oneOrMore", "empty"];
/**
 * Perform the final constraint checks, and record some information
 * for checkInterleaveRestriction.
 */
class GeneralChecker {
    constructor() {
        this.defineNameToElementNames = new Map();
        this.typeWarnings = [];
    }
    check(el) {
        const { children } = el;
        const definesByName = new Map();
        for (let ix = 1; ix < children.length; ++ix) {
            const child = children[ix];
            definesByName.set(child.mustGetAttribute("name"), child);
        }
        this.definesByName = definesByName;
        const start = children[0];
        const found = util_1.findMultiDescendantsByLocalName(start, FORBIDDEN_IN_START);
        for (const forbidden of FORBIDDEN_IN_START) {
            if (found[forbidden].length !== 0) {
                throw new ProhibitedStartPath(forbidden);
            }
        }
        const state = {
            inAttribute: false,
            inList: false,
            inDataExcept: false,
            inOneOrMore: false,
            inOneOrMoreGroup: false,
            inOneOrMoreInterleave: false,
            inInterlave: false,
            inGroup: false,
        };
        // The first child of <grammar> is necessarily <start>. So we handle
        // start here.
        this._check(start.children[0], state);
        // The other children are necessarily <define>.
        for (let ix = 1; ix < children.length; ++ix) {
            // <define> elements necessarily have a single child which is an
            // <element>.
            const element = children[ix].children[0];
            // The first child is the name class, which we do not need to walk.
            const pattern = element.children[1];
            const { contentType } = this._check(pattern, state);
            if (contentType === null && pattern.local !== "notAllowed") {
                throw new schema_validation_1.SchemaValidationError(`definition ${el.mustGetAttribute("name")} violates the constraint \
on string values (section 7.2)`);
            }
        }
    }
    _check(el, state) {
        return this[`${el.local}Handler`]
            .call(this, el, state);
    }
    attributeHandler(el, state) {
        if (state.inOneOrMoreGroup) {
            throw new ProhibitedPath("oneOrMore//group//attribute");
        }
        if (state.inOneOrMoreInterleave) {
            throw new ProhibitedPath("oneOrMore//interleave//attribute");
        }
        if (state.inAttribute) {
            throw new ProhibitedAttributePath(el.local);
        }
        if (state.inList) {
            throw new ProhibitedListPath(el.local);
        }
        if (state.inDataExcept) {
            throw new ProhibitedDataExceptPath(el.local);
        }
        const [first, second] = el.children;
        const name = makeNamePattern(first);
        if (!state.inOneOrMore && !name.simple()) {
            throw new schema_validation_1.SchemaValidationError("an attribute with an infinite name \
class must be a descendant of oneOrMore (section 7.3)");
        }
        // The first child is the name class, which we do not need to walk.
        this._check(second, Object.assign(Object.assign({}, state), { inAttribute: true }));
        return {
            contentType: 0 /* EMPTY */,
            occurringAttributeNames: [name],
            occurringRefs: EMPTY_ELEMENT_ARRAY,
            occurringTexts: false,
        };
    }
    oneOrMoreHandler(el, state) {
        if (state.inDataExcept) {
            throw new ProhibitedDataExceptPath(el.local);
        }
        const { contentType, occurringAttributeNames, occurringRefs, occurringTexts } = this._check(el.children[0], Object.assign(Object.assign({}, state), { inOneOrMore: true }));
        // The test would be
        //
        // ct !== null && groupable(ct, ct)
        //
        // but the only thing not groupable with itself is ContentType.SIMPLE
        // and if ct === null then forcibly ct !== ContentType.SIMPLE
        // is true so we can simplify to the following.
        return {
            contentType: contentType !== 2 /* SIMPLE */ ? contentType : null,
            occurringAttributeNames,
            occurringRefs,
            occurringTexts,
        };
    }
    groupHandler(el, state) {
        if (state.inDataExcept) {
            throw new ProhibitedDataExceptPath(el.local);
        }
        return this.groupInterleaveHandler(el.children, Object.assign(Object.assign({}, state), { inGroup: true, inOneOrMoreGroup: state.inOneOrMore }), false);
    }
    interleaveHandler(el, state) {
        if (state.inList) {
            throw new ProhibitedListPath(el.local);
        }
        if (state.inDataExcept) {
            throw new ProhibitedDataExceptPath(el.local);
        }
        return this.groupInterleaveHandler(el.children, Object.assign(Object.assign({}, state), { inInterlave: true, inOneOrMoreInterleave: state.inOneOrMore }), true);
    }
    choiceHandler(el, state) {
        const { contentType: firstCt, occurringAttributeNames: firstAttributes, occurringRefs: firstRefs, occurringTexts: firstTexts } = this._check(el.children[0], state);
        const { contentType: secondCt, occurringAttributeNames: secondAttributes, occurringRefs: secondRefs, occurringTexts: secondTexts } = this._check(el.children[1], state);
        return {
            contentType: firstCt !== null && secondCt !== null ?
                (firstCt > secondCt ? firstCt : secondCt) : null,
            occurringAttributeNames: firstAttributes.concat(secondAttributes),
            occurringRefs: firstRefs.concat(secondRefs),
            occurringTexts: firstTexts || secondTexts,
        };
    }
    listHandler(el, state) {
        if (state.inList) {
            throw new ProhibitedListPath(el.local);
        }
        if (state.inDataExcept) {
            throw new ProhibitedDataExceptPath(el.local);
        }
        this._check(el.children[0], Object.assign(Object.assign({}, state), { inList: true }));
        return LIST_RESULT;
    }
    dataHandler(el, state) {
        const typeAttr = el.mustGetAttribute("type");
        const libname = el.mustGetAttribute("datatypeLibrary");
        const lib = datatypes_1.registry.find(libname);
        if (lib === undefined) {
            throw new datatypes_1.ValueValidationError(el.path, [new datatypes_1.ValueError(`unknown datatype library: ${libname}`)]);
        }
        const datatype = lib.types[typeAttr];
        if (datatype === undefined) {
            throw new datatypes_1.ValueValidationError(el.path, [new datatypes_1.ValueError(`unknown datatype ${typeAttr} in \
${(libname === "") ? "default library" : `library ${libname}`}`)]);
        }
        const { children } = el;
        if (children.length !== 0) {
            const last = children[children.length - 1];
            // We only need to scan the possible except child, which is necessarily
            // last.
            const hasExcept = last.local === "except";
            const limit = hasExcept ? children.length - 1 : children.length;
            // Running parseParams if we have no params is expensive. And if there are
            // no params, there's nothing to check so don't run parseParams without
            // params.
            if (limit > 0) {
                const params = [];
                for (let ix = 0; ix < limit; ++ix) {
                    const child = children[ix];
                    params.push({
                        name: child.mustGetAttribute("name"),
                        value: child.text,
                    });
                }
                datatype.parseParams(el.path, params);
            }
            if (hasExcept) {
                this._check(last.children[0], state.inDataExcept ? state : Object.assign(Object.assign({}, state), { inDataExcept: true }));
            }
        }
        // tslint:disable-next-line: no-http-string
        if (libname === "http://www.w3.org/2001/XMLSchema-datatypes" &&
            (typeAttr === "ENTITY" || typeAttr === "ENTITIES")) {
            this.typeWarnings.push(`WARNING: ${el.path} uses the ${typeAttr} type in library \
${libname}`);
        }
        return DATA_RESULT;
    }
    valueHandler(el, state) {
        const typeAttr = el.mustGetAttribute("type");
        const libname = el.mustGetAttribute("datatypeLibrary");
        let ns = el.mustGetAttribute("ns");
        const lib = datatypes_1.registry.find(libname);
        if (lib === undefined) {
            throw new datatypes_1.ValueValidationError(el.path, [new datatypes_1.ValueError(`unknown datatype library: ${libname}`)]);
        }
        const datatype = lib.types[typeAttr];
        if (datatype === undefined) {
            throw new datatypes_1.ValueValidationError(el.path, [new datatypes_1.ValueError(`unknown datatype ${typeAttr} in \
${(libname === "") ? "default library" : `library ${libname}`}`)]);
        }
        let value = el.text;
        let context;
        if (datatype.needsContext) {
            // Change ns to the namespace we need.
            ns = common_1.fromQNameToURI(value, el);
            value = common_1.localName(value);
            el.setAttribute("ns", ns);
            el.replaceContent([new parser_1.Text(value)]);
            const nr = new default_name_resolver_1.DefaultNameResolver();
            nr.definePrefix("", ns);
            context = { resolver: nr };
        }
        datatype.parseValue(el.path, value, context);
        // tslint:disable-next-line: no-http-string
        if (libname === "http://www.w3.org/2001/XMLSchema-datatypes" &&
            (typeAttr === "ENTITY" || typeAttr === "ENTITIES")) {
            this.typeWarnings.push(`WARNING: ${el.path} uses the ${typeAttr} type in library \
${libname}`);
        }
        return VALUE_RESULT;
    }
    textHandler(el, state) {
        if (state.inList) {
            throw new ProhibitedListPath(el.local);
        }
        if (state.inDataExcept) {
            throw new ProhibitedDataExceptPath(el.local);
        }
        return TEXT_RESULT;
    }
    refHandler(el, state) {
        if (state.inList) {
            throw new ProhibitedListPath(el.local);
        }
        if (state.inAttribute) {
            throw new ProhibitedAttributePath(el.local);
        }
        if (state.inDataExcept) {
            throw new ProhibitedDataExceptPath(el.local);
        }
        return {
            contentType: 1 /* COMPLEX */,
            occurringAttributeNames: EMPTY_NAME_ARRAY,
            occurringRefs: [el],
            occurringTexts: false,
        };
    }
    emptyHandler(el, state) {
        if (state.inDataExcept) {
            throw new ProhibitedDataExceptPath(el.local);
        }
        return EMPTY_RESULT;
    }
    notAllowedHandler() {
        return NOT_ALLOWED_RESULT;
    }
    getElementNamesForDefine(name) {
        let pattern = this.defineNameToElementNames.get(name);
        if (pattern === undefined) {
            const def = this.definesByName.get(name);
            // tslint:disable-next-line:no-non-null-assertion
            const element = def.children[0];
            const namePattern = element.children[0];
            pattern = makeNamePattern(namePattern);
            this.defineNameToElementNames.set(name, pattern);
        }
        return pattern;
    }
    groupInterleaveHandler(children, newState, isInterleave) {
        const { contentType: firstCt, occurringAttributeNames: firstAttributes, occurringRefs: firstRefs, occurringTexts: firstTexts } = this._check(children[0], newState);
        const { contentType: secondCt, occurringAttributeNames: secondAttributes, occurringRefs: secondRefs, occurringTexts: secondTexts } = this._check(children[1], newState);
        for (const attr1 of firstAttributes) {
            for (const attr2 of secondAttributes) {
                if (attr1.intersects(attr2)) {
                    throw new schema_validation_1.SchemaValidationError(`the name classes of two attributes in the same group or
interleave intersect (section 7.3): ${attr1} and ${attr2}`);
                }
            }
        }
        if (isInterleave) {
            if (firstTexts && secondTexts) {
                throw new schema_validation_1.SchemaValidationError("text present in both patterns of an interleave (section 7.4)");
            }
            for (const ref1 of firstRefs) {
                const name1 = this.getElementNamesForDefine(ref1.mustGetAttribute("name"));
                for (const ref2 of secondRefs) {
                    const name2 = this.getElementNamesForDefine(ref2.mustGetAttribute("name"));
                    if (name1.intersects(name2)) {
                        throw new schema_validation_1.SchemaValidationError(`name classes of elements in both \
patterns of an interleave intersect (section 7.4): ${name1} and ${name2}`);
                    }
                }
            }
        }
        // These tests combine the groupable(firstCt, secondCt) test together with
        // the requirement that we return the content type which is the greatest.
        let contentType;
        if (firstCt === 1 /* COMPLEX */ && secondCt === 1 /* COMPLEX */) {
            contentType = 1 /* COMPLEX */;
        }
        else if (firstCt === 0 /* EMPTY */) {
            contentType = secondCt;
        }
        else {
            contentType = (secondCt === 0 /* EMPTY */) ? firstCt : null;
        }
        return {
            contentType,
            occurringAttributeNames: firstAttributes.concat(secondAttributes),
            occurringRefs: firstRefs.concat(secondRefs),
            occurringTexts: firstTexts || secondTexts,
        };
    }
}
let cachedGrammar;
function getGrammar() {
    if (cachedGrammar === undefined) {
        cachedGrammar = read_1.readTreeFromJSON(relaxng);
    }
    return cachedGrammar;
}
/**
 * A simplifier implemented in TypeScript (thus internal to Salve).
 */
class InternalSimplifier extends base_1.BaseSimplifier {
    constructor(options) {
        super(options);
        this.manifestPromises = [];
        if (options.timing) {
            options.verbose = true;
        }
    }
    parse(filePath) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const schemaResource = yield this.options.resourceLoader.load(filePath);
            const schemaText = yield schemaResource.getText();
            const fileName = filePath.toString();
            const saxesParser = new saxes_1.SaxesParser({ xmlns: true,
                position: false,
                fileName });
            let validator;
            if (this.options.validate) {
                validator = new parser_1.Validator(getGrammar(), saxesParser);
            }
            const parser = new parser_1.BasicParser(saxesParser, validator);
            parser.saxesParser.write(schemaText);
            parser.saxesParser.close();
            if (validator !== undefined) {
                if (validator.errors.length !== 0) {
                    const message = validator.errors.map(x => x.toString()).join("\n");
                    throw new schema_validation_1.SchemaValidationError(message);
                }
            }
            if (this.options.createManifest) {
                const algo = this.options.manifestHashAlgorithm;
                if (typeof algo === "string") {
                    this.manifestPromises.push((() => tslib_1.__awaiter(this, void 0, void 0, function* () {
                        const digest = 
                        // tslint:disable-next-line:await-promise
                        yield crypto.subtle.digest(algo, new TextEncoder().encode(schemaText));
                        const arr = new Uint8Array(digest);
                        let hash = `${algo}-`;
                        for (const x of arr) {
                            const hex = x.toString(16);
                            hash += x > 0xF ? hex : `0${hex}`;
                        }
                        return { filePath: fileName, hash };
                    }))());
                }
                else {
                    this.manifestPromises.push((() => tslib_1.__awaiter(this, void 0, void 0, function* () {
                        const hash = yield algo(schemaResource);
                        return { filePath: fileName, hash };
                    }))());
                }
            }
            return parser.root;
        });
    }
    stepStart(no) {
        this.stepTiming();
        if (this.options.verbose) {
            // tslint:disable-next-line:no-console
            console.log(`Simplification step ${no}`);
        }
    }
    stepTiming() {
        if (!this.options.timing) {
            return;
        }
        if (this.lastStepStart !== undefined) {
            // tslint:disable-next-line:no-console
            console.log(`${Date.now() - this.lastStepStart}ms`);
            this.lastStepStart = undefined;
        }
        this.lastStepStart = Date.now();
    }
    simplify(schemaPath) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let startTime;
            if (this.options.verbose) {
                // tslint:disable-next-line:no-console
                console.log("Simplifying...");
                if (this.options.timing) {
                    startTime = Date.now();
                }
            }
            let warnings = [];
            let tree;
            if (this.options.simplifyTo >= 1) {
                this.stepStart(1);
                tree = yield this.parse(schemaPath);
                tree = yield simplifier.step1(schemaPath, tree, this.parse.bind(this));
            }
            if (this.options.simplifyTo >= 4) {
                this.stepStart(4);
                tree = simplifier.step4(tree);
            }
            if (this.options.simplifyTo >= 6) {
                this.stepStart(6);
                tree = simplifier.step6(tree);
            }
            if (this.options.simplifyTo >= 9) {
                this.stepStart(9);
                tree = simplifier.step9(tree);
            }
            if (this.options.simplifyTo >= 10) {
                this.stepStart(10);
                tree = simplifier.step10(tree, this.options.validate);
            }
            if (this.options.simplifyTo >= 14) {
                this.stepStart(14);
                tree = simplifier.step14(tree);
            }
            if (this.options.simplifyTo >= 15) {
                this.stepStart(15);
                tree = simplifier.step15(tree);
            }
            if (this.options.simplifyTo >= 16) {
                this.stepStart(16);
                tree = simplifier.step16(tree);
            }
            if (this.options.simplifyTo >= 17) {
                this.stepStart(17);
                tree = simplifier.step17(tree);
            }
            if (this.options.simplifyTo >= 18) {
                this.stepStart(18);
                tree = simplifier.step18(tree);
                if (this.options.validate) {
                    let checkStart;
                    if (this.options.timing) {
                        checkStart = Date.now();
                    }
                    const checker = new GeneralChecker();
                    checker.check(tree);
                    warnings = checker.typeWarnings;
                    if (this.options.timing) {
                        // tslint:disable-next-line:no-non-null-assertion no-console
                        console.log(`Step 18 check delta: ${Date.now() - checkStart}`);
                    }
                }
            }
            if (this.options.timing) {
                this.stepTiming(); // Output the last timing.
                // tslint:disable-next-line:no-non-null-assertion no-console
                console.log(`Simplification delta: ${Date.now() - startTime}`);
            }
            return {
                simplified: tree,
                warnings,
                manifest: yield Promise.all(this.manifestPromises),
            };
        });
    }
}
exports.InternalSimplifier = InternalSimplifier;
InternalSimplifier.validates = true;
InternalSimplifier.createsManifest = true;
schema_simplification_1.registerSimplifier("internal", InternalSimplifier);
//# sourceMappingURL=internal.js.map