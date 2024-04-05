import { QuerySearch } from '@vioc-angular/shared/common-api-models';
import { ResponseEntity } from '@vioc-angular/shared/util-api';
import { Observable } from 'rxjs';

/**
 * Interface to be used to other facades that need to implement the search method to be used in the `SearchFacade`.
 */
export interface Searchable<T> {
    /**
     * Using the `QuerySearch` make an api call to return `ResponseEntity` content.
     */
    search(querySearch: QuerySearch): Observable<ResponseEntity<T>>;
}
