/**
 * Class representing page information to be used for pagination in searches.
 */
export class QueryPage {
    /** The index number of the page. */
    index: number;

    /** The size of the page. */
    size: number;

    constructor(index: number, size: number) {
        this.index = index;
        this.size = size;
    }

    /**
     * Gets the index as a string to be used for service calls.
     */
    get indexParameter(): string {
        return this.index.toString();
    }

    /** Gets the size as a string to be used for service calls. */
    get sizeParameter(): string {
        return this.size.toString();
    }
}
