import { SelectionModel } from '@angular/cdk/collections';
import { Directive, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { SearchComponent } from '@vioc-angular/shared/feature-search';
import { takeUntil } from 'rxjs/operators';
import { SearchPage } from '../search-page';

/**
 * Extend this class to create an *Selection component that can then be used in the mass add/update process.
 *
 * Reimplementation of the `BaseSelectionComponent`.
 */
@Directive() // Directive decorator required for angular functionality (OnInit)
// tslint:disable-next-line: directive-class-suffix (ignoring directive suffix for abstract component class)
export abstract class SearchSelection<T> extends SearchPage implements OnInit {
    @ViewChild('search', { static: true }) searchComponent: SearchComponent;

    /** FormControl backed by an array of T.  Should be set in html. */
    @Input() control: FormControl;

    @Input() multiple = true;

    /** Used for single selection checkbox when true else multiple selection allowed. */
    @Input() singleSelection = false;

    get selection(): SelectionModel<T> {
        return this.searchComponent.selection;
    }

    ngOnInit(): void {
        if (!this.control) {
            throw new Error('The "control" input must be set');
        }
        this.selection.changed
            .pipe(takeUntil(this._destroyed))
            .subscribe((e) => this.control.setValue(e.source.selected));
    }

    selectRow(row: T): void {
        if (!this.multiple && !this.selection.isEmpty()) {
            this.selection.clear();
        }
        this.selection.toggle(row);
    }

    /** Open the search filter back up and clear out selections and the search filter chips. */
    clear(): void {
        this.searchComponent.clear();
    }

    /** @see DataModifyingComponent */
    get unsavedChanges(): boolean {
        return this.control.dirty;
    }
}
