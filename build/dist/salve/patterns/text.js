"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Text = void 0;
/**
 * Pattern and walker for RNG's ``text`` elements.
 * @author Louis-Dominique Dubeau
 * @license MPL 2.0
 * @copyright Mangalam Research Center for Buddhist Languages
 */
const events_1 = require("../events");
const base_1 = require("./base");
/**
 * Pattern for ``<text/>``.
 */
class Text extends base_1.Pattern {
    hasEmptyPattern() {
        // A text node may always be a zero-length node, which mean that we
        // effectively allow the container to be empty.
        return true;
    }
    newWalker() {
        // tslint:disable-next-line:no-use-before-declare
        return singleton;
    }
}
exports.Text = Text;
/**
 *
 * Walker for [[Text]]
 *
 */
class TextWalker {
    /**
     * @param el The pattern for which this walker was constructed.
     */
    constructor(el) {
        this.el = el;
        this.canEnd = true;
        this.canEndAttribute = true;
    }
    // Since TextWalker is a singleton, the cloning operation just
    // returns the original walker.
    clone() {
        return this;
    }
    possible() {
        return new Set([TextWalker._textEvent]);
    }
    possibleAttributes() {
        return new Set();
    }
    fireEvent(name) {
        return new base_1.InternalFireEventResult(name === "text");
    }
    end() {
        return false;
    }
    endAttributes() {
        return false;
    }
}
TextWalker._textEvent = new events_1.TextEvent(/^[^]*$/);
const singleton = new TextWalker(new Text("FAKE ELEMENT"));
//  LocalWords:  RNG's MPL possibleCached
//# sourceMappingURL=text.js.map