import { Element } from "../parser";
export declare function localName(value: string): string;
export declare function fromQNameToURI(value: string, el: Element): string;
/**
 * This walker checks that the types used in the tree can be used, and does
 * special processing for ``QName`` and ``NOTATION``.
 */
export declare class DatatypeProcessor {
    /**
     * The warnings generated during the walk. This array is populated while
     * walking.
     */
    readonly warnings: string[];
    walk(el: Element): void;
}
