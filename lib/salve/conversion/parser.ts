/**
 * This module contains classes for a conversion parser.
 * @author Louis-Dominique Dubeau
 * @license MPL 2.0
 * @copyright Mangalam Research Center for Buddhist Languages
 */

import * as sax from "sax";

/**
 * A base class for classes that perform parsing based on SAX parsers.
 *
 * Derived classes should add methods named ``on<eventname>`` so as to form a
 * full name which matches the ``on<eventname>`` methods supported by SAX
 * parsers. The constructor will attach these methods to the SAX parser passed
 * and bind them so in them ``this`` is the ``Parser`` object. This allows
 * neatly packaged methods and private parameters.
 *
 */
export class Parser {
  /**
   * @param saxParser A parser created by the ``sax-js`` library or something
   * compatible.
   */
  constructor(readonly saxParser: sax.SAXParser) {
    for (const name in this) {
      if (name.lastIndexOf("on", 0) === 0) {
        (this.saxParser as any)[name] = (this as any)[name].bind(this);
      }
    }
  }
}

/**
 * An Element produced by [[Parser]].
 *
 * This constructor will insert the created object into the parent automatically
 * if the parent is provided.
 */
export class Element {
  /**
   * The children of this element.
   */
  readonly children: (Element|string)[] = [];

  /**
   * The path of the element in its tree.
   */
  path: string | undefined;

  /**
   * @param parent The parent element, or a undefined if this is the root
   * element.
   *
   * @param node The value of the ``node`` created by the SAX parser.
   */
  constructor(readonly parent: Element | undefined,
              readonly node: sax.QualifiedTag) {
    if (parent !== undefined) {
      parent.children.push(this);
    }
  }

  makePath(): void {
    if (this.path !== undefined) {
      return;
    }

    let pPath: string = "";
    if (this.parent !== undefined) {
      this.parent.makePath();
      // this.parent.path cannot be undefined here because we just ran makePath.
      pPath = this.parent.path as string;
    }

    this.path = `${pPath}/${this.node.local}`;

    if ("name" in this.node.attributes) {
      // tslint:disable-next-line:no-string-literal
      this.path += `[@name='${this.node.attributes["name"].value}']`;
    }

    for (const child of this.children) {
      if (child instanceof Element && child.node.local === "name") {
        const val: string = child.children.join("");
        this.path += `[@name='${val}']`;
        break;
      }
    }
  }
}

/**
 * A simple parser used for loading a XML document into memory.  Parsers of this
 * class use [[Element]] objects to represent the tree of nodes.
 */
export class ConversionParser extends Parser {
  /**
   * The stack of elements. At the end of parsing, there should be only one
   * element on the stack, the root. This root is not an element that was in
   * the XML file but a holder for the tree of elements. It has a single child
   * which is the root of the actual file parsed.
   */
  readonly stack: Element[] = [];

  /**
   * The root recorded during parsing. This is ``undefined`` before parsing. We
   * don't allow direct access because getting the root is only meaningful after
   * parsing.
   */
  protected _recordedRoot: Element | undefined;

  /**
   * The root of the parsed XML.
   */
  get root(): Element {
    if (this._recordedRoot === undefined) {
      throw new Error("cannot get root");
    }

    return this._recordedRoot;
  }

  onopentag(node: sax.QualifiedTag): void {
    // tslint:disable-next-line: no-http-string
    if (node.uri !== "http://relaxng.org/ns/structure/1.0") {
      throw new Error(`node in unexpected namespace: ${node.uri}`);
    }

    const parent: Element | undefined = this.stack[0];

    const me: Element = new Element(parent, node);

    this.stack.unshift(me);

    if (parent === undefined) {
      this._recordedRoot = me;
    }
  }

  onclosetag(name: sax.QualifiedTag): void {
    this.stack.shift();
  }

  ontext(text: string): void {
    const top: Element | undefined = this.stack[0];
    if (top === undefined) {
      return;
    }

    const local = top.node.local;

    // This parser is specifically dedicated to the task of reading Relax NG
    // schemas. In a Relax NG schema, text nodes that consist entirely of white
    // space are expandable, except in the ``param`` and ``value`` elements,
    // where they do potentially carry significant information.
    //
    // We strip nodes that consist entirely of white space because this
    // simplifies code that needs to process the resulting tree, but preserve
    // those nodes that are potentially significant.
    //
    // The parser does not allow non-RNG nodes, so we don't need to check the
    // namespace.
    const keepWhitespaceNodes = local === "param" || local === "value";

    if (keepWhitespaceNodes || text.trim() !== "") {
      top.children.push(text);
    }
  }
}

//  LocalWords:  MPL NG param RNG
