import { Injectable } from '@angular/core';
import { AbstractDropdownColumn, DynamicDropdownColumn, SimpleDropdownColumn } from '@vioc-angular/shared/util-column';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { DropdownColumnState } from './dropdown-column.state';

/**
 * Providing a Facade to handle the dropdown column value searches.
 */
@Injectable()
export class DropdownColumnFacade {
    constructor(private readonly _state: DropdownColumnState) {}

    /** Verify text length, then check for cached results or search externally. */
    search(column: AbstractDropdownColumn<any>, searchText: string): Observable<any[]> {
        searchText = searchText.toUpperCase();
        let $values: Observable<any[]>;
        if (column instanceof SimpleDropdownColumn) {
            $values = of(column.values);
        } else if (column instanceof DynamicDropdownColumn) {
            if (searchText.length >= column.minCharactersForSearch) {
                if (searchText.length > column.maxCharactersForSearch) {
                    $values = this.search(column, searchText.substring(0, column.maxCharactersForSearch));
                } else {
                    const cachedResults = this._state.getCache(column, searchText);
                    if (cachedResults) {
                        $values = of(cachedResults);
                    } else {
                        $values = this.searchExternal(column, searchText);
                    }
                }
            } else {
                $values = of([]);
            }
        } else {
            throw new Error(`Unsupported column: ${column}`);
        }

        return $values.pipe(
            map((results) => results.filter((r) => column.mapToDropdownDisplay(r).toUpperCase().startsWith(searchText)))
        );
    }
    /** Use the column's api and fetchData function to search for potential values. */
    private searchExternal(column: DynamicDropdownColumn<any>, searchText: string): Observable<any[]> {
        return column
            .fetchData(searchText) //
            .pipe(tap((r) => this._state.cache(column, searchText, r)));
    }
}
