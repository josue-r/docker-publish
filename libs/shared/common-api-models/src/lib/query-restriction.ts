import { Moment } from 'moment';

/**
 * Represents a field operator value restriction to be sent to services for generic searching.
 */
export interface QueryRestriction {
    /**
     * The path of the field being searched on.
     */
    fieldPath: string;

    /**
     * The dataType of the field.
     */
    dataType: string;

    /**
     * The operator being used for comparison in the query.
     */
    operator: string;

    /**
     * The values to be compared against.
     */
    values: (string | Moment | number | boolean)[];

    /**
     * Additional QueryRestriction to or with this one.
     */
    or?: QueryRestriction;
}
