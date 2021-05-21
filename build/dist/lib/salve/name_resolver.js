"use strict";
/**
 * Implements a name resolver for handling namespace changes in XML.
 * @author Louis-Dominique Dubeau
 * @license MPL 2.0
 * @copyright Mangalam Research Center for Buddhist Languages
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.XMLNS_NAMESPACE = exports.XML1_NAMESPACE = void 0;
//
// Both defined at:
// http://www.w3.org/TR/REC-xml-names/#ns-decl
//
/**
 * The namespace URI for the "xml" prefix. This is part of the [XML
 * spec](http://www.w3.org/TR/REC-xml-names/#ns-decl).
 */
// tslint:disable-next-line: no-http-string
exports.XML1_NAMESPACE = "http://www.w3.org/XML/1998/namespace";
/**
 * The namespace URI for the "xmlns" prefix. This is part of the [XML
 * spec](http://www.w3.org/TR/REC-xml-names/#ns-decl).
 */
// tslint:disable-next-line: no-http-string
exports.XMLNS_NAMESPACE = "http://www.w3.org/2000/xmlns/";
//  LocalWords:  unprefixed nameResolver pre definePrefix Unresolves qname vm
//  LocalWords:  redeclarations newID ename lang html NameResolver Mangalam uri
//  LocalWords:  xmlns URI Dubeau resolveName xml MPL unresolving namespace
//# sourceMappingURL=name_resolver.js.map