/**
 * A resource loader that loads resources using ``fetch``.
 *
 * @author Louis-Dominique Dubeau
 * @license MPL 2.0
 * @copyright Mangalam Research Center for Buddhist Languages
 */
import { Resource, ResourceLoader } from "../resource-loader";
export declare class FetchResource implements Resource {
    readonly url: URL;
    readonly response: Response;
    constructor(url: URL, response: Response);
    getText(): Promise<string>;
}
/**
 * A resource loader that loads resources using ``fetch``. It can only be used
 * in an environment where ``fetch`` is native or provided by a polyfill.
 *
 * This loader does not allow loading from ``file://``.
 */
export declare class FetchResourceLoader implements ResourceLoader<FetchResource> {
    load(url: URL): Promise<FetchResource>;
}
