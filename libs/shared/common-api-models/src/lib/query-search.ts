import { QueryPage } from './query-page';
import { QueryRestriction } from './query-restriction';
import { QuerySort } from './query-sort';

/** Standard input for the Central search endpoints. */
export interface QuerySearch {
    queryRestrictions: QueryRestriction[];
    page: QueryPage;
    sort: QuerySort;
    additionalParams?: { [param: string]: string | string[] };
    defaultSorts?: QuerySort[];
}
