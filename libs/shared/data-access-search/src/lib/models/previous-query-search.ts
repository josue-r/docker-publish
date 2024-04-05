import { QueryPage, QuerySort, SearchLine } from '@vioc-angular/shared/common-api-models';

/**
 * Keeps track of the state of the previous user query details.
 */
export interface PreviousQuerySearch {
    /**
     * All of the query restrictions used in the previous search.
     */
    filters: SearchLine[];

    /**
     * The page details of the previous search.
     */
    page: QueryPage;

    /**
     * The previous sort applied to the search.
     */
    sort: QuerySort;
}
