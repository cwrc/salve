/**
 * Facilities for loading resources.
 *
 * @author Louis-Dominique Dubeau
 * @license MPL 2.0
 * @copyright Mangalam Research Center for Buddhist Languages
 */
export interface Resource {
    /** The URL for this resource. */
    url: URL;
    /** Get the resource as a string. */
    getText(): Promise<string>;
}
export interface ResourceLoader<R extends Resource = Resource> {
    /**
     * @param path The path from which to load the resource. ``file://`` paths are
     * understood to be pointing into the filesystem local to the JavaScript
     * virtual machine executing this code. Note that some resource loaders may be
     * incapable of loading specific URLs. For instance a browser-based resource
     * loader will normally refuse loading files from the local file system.
     *
     * @returns The resource.
     */
    load(path: URL): Promise<R>;
}
export declare function makeResourceLoader(): ResourceLoader;
