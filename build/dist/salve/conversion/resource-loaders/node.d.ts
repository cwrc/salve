import { Resource, ResourceLoader } from "../resource-loader";
export declare class NodeResource implements Resource {
    readonly url: URL;
    private readonly text;
    constructor(url: URL, text: string);
    getText(): Promise<string>;
}
/**
 * A resource loader that loads resources using Node's ``fs`` facilities or
 * ``fetch``.
 *
 * URLs with the file: protocol are loaded through Node's ``fs``
 * facilities. Otherwise, fetch is used.
 */
export declare class NodeResourceLoader implements ResourceLoader {
    private readonly fetchLoader;
    load(url: URL): Promise<Resource>;
}
