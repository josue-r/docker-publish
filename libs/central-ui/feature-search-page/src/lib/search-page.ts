import { Directive, OnDestroy } from '@angular/core';
import { QuerySearch } from '@vioc-angular/shared/common-api-models';
import { EntityPatch, ResponseEntity } from '@vioc-angular/shared/util-api';
import { DataModifyingComponent } from '@vioc-angular/shared/util-data-modifying';
import { Observable, ReplaySubject } from 'rxjs';

/**
 * An abstract class containing and outlining some required fields/functions for a standard searching page.
 */
@Directive() // Directive decorator required for angular functionality (OnDestroy)
// tslint:disable-next-line: directive-class-suffix (ignoring directive suffix for abstract component class)
export abstract class SearchPage extends DataModifyingComponent implements OnDestroy {
    protected _destroyed = new ReplaySubject();

    /** Function that performs the search based on the given criteria. */
    searchFn: (querySearch: QuerySearch) => Observable<ResponseEntity<any>>;

    /** The response of the grid view save. */
    saveFn: (patches: EntityPatch<any>[]) => Observable<Object>;

    ngOnDestroy(): void {
        this._destroyed.next();
    }
}
