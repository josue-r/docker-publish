import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
// TODO: 04/03/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
// tslint:disable-next-line: nx-enforce-module-boundaries
import { MenuItem } from '@vioc-angular/central-ui/data-access-menu';
import { Observable, ReplaySubject } from 'rxjs';
import { map, startWith, takeUntil } from 'rxjs/operators';
import { NavSearchOption } from './nav-search-option';
import { expandSideBarItem } from './nav-search.animations';

/**
 * The component that handles the search functionality of the sidenav. It uses an autocomplete and
 * provides matches based on the given menuItems.
 */
@Component({
    selector: 'vioc-angular-nav-search',
    templateUrl: './nav-search.component.html',
    styleUrls: ['./nav-search.component.scss'],
    animations: [expandSideBarItem],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavSearchComponent implements OnInit, OnDestroy {
    private readonly _destroyed = new ReplaySubject(1);

    @Input() set menu(menu: MenuItem[]) {
        // The menuItems can change as the user's roles get updated
        this.options = this.buildSearchOptions(menu);
    }

    @Output() searchResultSelected = new EventEmitter<string>();

    /** Form control for the nav search filter input */
    searchControl = new FormControl('');

    /** Used as an input styleClass variable for a material component. */
    readonly searchResultsClass = 'nav-search-results';

    /** The searchable options list */
    options = new Array<NavSearchOption>();

    /** The result list */
    filteredOptions: Observable<NavSearchOption[]>;

    navSearchFocused = false;

    constructor() {}

    ngOnInit(): void {
        // update the filtered options as the nav-search value changes
        this.filteredOptions = this.searchControl.valueChanges.pipe(
            takeUntil(this._destroyed), // TODO: I think this isn't necessary
            startWith<string | NavSearchOption>(''),
            // Treat null/undefined as empty string
            map((value) => (value === null || typeof value === 'undefined' ? '' : value)),
            // Support submiting either the string value of the input box or the NavSearchOption value of the autocomplete dropdown.
            map((value) => (typeof value === 'string' ? value : value.name)),
            // Only filtering the nav results if there are at least 2 characters entered
            map((name) => (name && name.length >= 2 ? this.filter(name) : new Array<NavSearchOption>()))
        );
    }

    // Used to initialize the nav search options list
    buildSearchOptions(menuItems: MenuItem[]) {
        const newOptions: NavSearchOption[] = [];
        menuItems.forEach((item) => {
            if (this.hasChildren(item)) {
                newOptions.push(...this.buildSearchOptions(item.subMenus));
            } else {
                newOptions.push({ name: item.name, path: item.path, index: -1 } as NavSearchOption);
            }
        });
        return newOptions;
    }

    /** Filter and sort the options list based on the filter input. */
    private filter(name: string): NavSearchOption[] {
        return (
            this.options //
                .map((option) => {
                    // update the option with the new matching indexes
                    option.index = option.name.toLowerCase().indexOf(name.toLowerCase());
                    return option;
                }) //
                // remove unmatched options
                .filter((option) => option.index !== -1) //
                // Sort search results in alphabetical order
                .sort((o1, o2) => o1.name.localeCompare(o2.name))
        );
    }

    /** Function to control how each option is displayed in the autocomplete dropdown */
    displayOption(option?: NavSearchOption): string | undefined {
        return option ? option.name : undefined;
    }

    /** Emits selected options path and deselects it */
    optionSelected(event: MatAutocompleteSelectedEvent) {
        this.searchResultSelected.emit(event.option.value.path);
        this.navSearchFocus(false);
    }

    hasChildren(item: MenuItem) {
        return Array.isArray(item.subMenus) && item.subMenus.length;
    }

    /** Applies the classes required to have the nav-search extend out of the side-bar */
    navSearchFocus(focused: boolean) {
        this.navSearchFocused = focused;
        if (focused) {
            document.querySelector('.app-sidenav').classList.add('overflowed');
        } else {
            document.querySelector('.app-sidenav').classList.remove('overflowed');
        }
    }

    /** Apply focus and select all existing text for easy deletion. */
    afterIfWork(searchInput: HTMLInputElement) {
        searchInput.focus();
        searchInput.select();
    }

    ngOnDestroy(): void {
        this._destroyed.next();
        this._destroyed.unsubscribe();
    }
}
