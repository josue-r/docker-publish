import { SortDirection } from '@angular/material/sort';
import { Described } from '@vioc-angular/shared/common-functionality';

/** Represents a sort field and direction to be used when searching for a Described object. */
export class DescribedSort {
    static byCode = new DescribedSort(['code']);
    static byDescription = new DescribedSort(['description', 'id']);

    /** The field being sorted on.  */
    fields: Array<keyof Described>;

    /** The direction to sort the fields. */
    direction: SortDirection;

    constructor(fields: Array<keyof Described>, direction: SortDirection = 'asc') {
        if (!fields?.length) {
            throw new Error('Must supply an array of fields to sort by');
        }
        this.fields = fields;
        this.direction = direction;
    }

    /** Convenience getter for applying the sort to the search url. */
    get sortParameter(): string {
        return `${this.fields.join(',')},${this.direction}`;
    }
}
