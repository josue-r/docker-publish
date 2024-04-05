import { Searchable } from '@vioc-angular/shared/data-access-search';
import { EntityPatch } from '@vioc-angular/shared/util-api';
import { Observable } from 'rxjs';

export interface SearchPageFacade<T> extends Searchable<T> {
    /**
     * Updates the list of entities based on the values and fields passed in the `EntityPatch`.
     */
    entityPatch(patches: EntityPatch<any>[]): Observable<Object>;

    /**
     * Triggers a dataSync for the passed in IDs.
     */
    dataSync(ids: any[]): Observable<number>;
}
