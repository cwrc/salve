/**
 * Simplification step 17.
 * @author Louis-Dominique Dubeau
 * @license MPL 2.0
 * @copyright 2013, 2014 Mangalam Research Center for Buddhist Languages
 */
import { Element } from "../parser";
import { removeUnreferencedDefs } from "./util";

// These are elements that cannot contain notAllowed and cannot contain
// references.
const skip = new Set(["name", "anyName", "nsName", "param", "empty",
                      "text", "value", "notAllowed", "ref"]);

function attributeHandler(el: Element): void {
  // An attribute (or list, group, interleave, oneOrMore) with at least one
  // notAllowed is replaced with notAllowed.
  el.replaceWith(Element.makeElement("notAllowed", true));
}
const handlers = {
  choice(el: Element, firstNA: boolean, secondNA: boolean): void {
    if (firstNA && secondNA) {
      // A choice with two notAllowed is replaced with notAllowed.
      el.replaceWith(Element.makeElement("notAllowed", true));
    }
    else {
      // A choice with exactly one notAllowed is replaced with the other child
      // of the choice.
      el.replaceWith(el.children[firstNA ? 1 : 0] as Element);
    }
  },
  attribute: attributeHandler,
  list: attributeHandler,
  group: attributeHandler,
  interleave: attributeHandler,
  oneOrMore: attributeHandler,
  except(el: Element): void {
    // An except with notAllowed is removed.
    el.remove();
  },
};

function walk(el: Element): void {
  const local = el.local;

  // Since we walk the children first, all the transformations that pertain to
  // the children are applied before we deal with the parent, and there should
  // not be any need to process the tree multiple times.
  for (const child of el.elements) {
    // Skip those elements that cannot contain notAllowed.
    if (skip.has(child.local)) {
      continue;
    }

    walk(child);
  }

  // Elements may be removed in the above loop.
  if (el.children.length === 0) {
    return;
  }

  const handler = (handlers as any)[local];

  if (!handler) {
    return;
  }

  const firstNA = (el.children[0] as Element).local === "notAllowed";
  const second = el.children[1] as Element;
  const secondNA = second !== undefined && second.local === "notAllowed";

  if (!(firstNA || secondNA)) {
    return;
  }

  handler(el, firstNA, secondNA);
}

function recordReferences(el: Element, refs: Set<string>): void {
  if (el.local === "ref") {
    refs.add(el.mustGetAttribute("name"));

    return; // A ref does not have children.
  }

  // Skip those elements that cannot contain refs.
  if (skip.has(el.local)) {
    return;
  }

  for (const child of el.elements) {
    recordReferences(child, refs);
  }
}

/**
 * Implements step 17 of the XSL pipeline. Namely:
 *
 * - All ``attribute``, ``list``, ``group``, ``interleave``, and ``oneOrMore``
 *   elements having a ``notAllowed`` child are replaced with a ``notAllowed``
 *   element.
 *
 * - A ``choice`` element with two ``notAllowed`` children is replaced with a
 *   ``notAllowed`` element.
 *
 * - A ``choice`` element with a single ``notAllowed`` child is replaced with
 *   the other child.
 *
 * - An ``except`` element with a ``notAllowed`` child is removed.
 *
 * These transformations are repeated until they no longer modify the tree. (The
 * way we apply the transformations obviates the need to repeat them.)
 *
 * Any ``define`` element that becomes unreachable after transformation is
 * removed.
 *
 * @param tree The tree to process. It is modified in-place.
 *
 * @returns The new root of the tree.
 */
export function step17(tree: Element): Element {
  walk(tree);

  const refs = new Set();
  recordReferences(tree, refs);
  removeUnreferencedDefs(tree, refs);

  return tree;
}