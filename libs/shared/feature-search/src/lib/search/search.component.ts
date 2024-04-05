import { SelectionModel } from '@angular/cdk/collections';
import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
    TemplateRef,
    ViewChild,
} from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { QueryPage, QuerySearch, QuerySort, SearchLine } from '@vioc-angular/shared/common-api-models';
import { isNullOrUndefined } from '@vioc-angular/shared/common-functionality';
import { Loggers } from '@vioc-angular/shared/common-logging';
import { MessageFacade } from '@vioc-angular/shared/data-access-message';
import { SearchFacade } from '@vioc-angular/shared/data-access-search';
import { GridComponent } from '@vioc-angular/shared/ui-grid';
import { PaginatorComponent } from '@vioc-angular/shared/ui-paginator';
import { EntityPatch, ResponseEntity } from '@vioc-angular/shared/util-api';
import { AbstractDropdownColumn, Column, Columns } from '@vioc-angular/shared/util-column';
import { FormFactory, FormFactoryOptions, TypedFormGroup } from '@vioc-angular/shared/util-form';
import { Observable, ReplaySubject, forkJoin } from 'rxjs';
import { take } from 'rxjs/operators';
import { SearchChip } from '../models/search-chip';
import { SearchFilterComponent } from '../search-filter/search-filter.component';

@Component({
    selector: 'vioc-angular-search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit, AfterViewInit, OnDestroy {
    private readonly logger = Loggers.get('feature-search', 'SearchComponent');
    protected readonly _destroyed = new ReplaySubject(1);

    /** Component used to create search restrictions for the results returned to the search page. */
    @ViewChild('searchFilter', { static: true }) searchFilter: SearchFilterComponent;

    @ViewChild('paginator', { static: true }) paginator: PaginatorComponent;

    @ViewChild('grid') grid: GridComponent;

    /** Used for allowing to select multiple rows if true and only single row if false */
    @Input() multiple = true;

    /** Used for allow only single selection of row when true else multiple rows when false */
    @Input() singleSelection = false;

    /** Current sorting of the table. Defaults to whatever is passed in. */
    @Input() sort: QuerySort;

    /** Page configuration of the table. Defaults to first page with 20 items per page. */
    @Input() page = new QueryPage(0, 20);

    /**
     * Determines if checkboxes should be shown for selections.
     * * If selectable is set to `true`, selection will always be displayed regardless of actions.
     * * If selectable is set to `false`, selection will only be show if selection actions are present.
     */
    @Input() selectable: boolean;

    /** Result size options for the paginator. Defaults to a max of 10, 20 or 50 items per page. */
    @Input() pageSizeOptions = [10, 20, 50];

    /** Disables/enables the previous search logic. */
    @Input() previousSearchEnabled = true;

    /** Controls whether the loading overlay shows. */
    @Input() isLoading = false;

    /** All of the applicable columns available to the component. */
    @Input() set columns(columns: Columns) {
        this._columns = columns;
        this.columnsArray = Columns.toColumnArray(columns);
        this.displayableColumns = this.columnsArray.filter((column) => column.displayable);
        this.displayedColumns = this.columnsArray
            .filter((column) => column.displayedByDefault && column.displayable)
            .map((column) => column.name);
    }
    get columns(): Columns {
        return this._columns;
    }
    private _columns: Columns;

    /** Function that performs the search based on the given criteria. */
    @Input() searchFn: (querySearch: QuerySearch) => Observable<ResponseEntity<any>>;

    /**
     * String definition of the type of entity that each row represents. The entity must have an id field and a form
     * creator function is expected to be registered in the formFactory for this entity.
     */
    @Input() entityType: string;

    /** Flag for enabling grid functionality. The grid view won't be an option if this is false. */
    @Input() gridModeEnabled = false;

    /** Additional options used by the `FormFactory` when creating the `TypedFormGroup` for the grid view. */
    @Input() formOptions: FormFactoryOptions = {};

    /** Function that performs the save for the grid view's changes. */
    @Input() saveFn: (patches: EntityPatch<any>[]) => Observable<Object>;

    /** Template that should house the actions for the table header. */
    @Input() actionsTemplate: TemplateRef<any>;

    /** Template that should house the actions for the table header when there is a selection. */
    @Input() selectionActionsTemplate: TemplateRef<any>;

    /** Template that should house other actions that will show up in the vertical menu. */
    @Input() menuItemsTemplate: TemplateRef<any>;

    /** Outputs the row selected data from the table component. */
    @Output() rowSelect = new EventEmitter<any>();

    /** Columns input as an array of `Column`s */
    columnsArray: Column[];

    /** All of the columns being show on the component table. */
    displayedColumns: string[];

    /** All of the displayable columns available to the component. */
    displayableColumns: Column[];

    /** Content to be displayed in the table or grid view. */
    content: any[] = [];

    /** Total number of elements returned by the search. */
    totalElements: number;

    /** Form for the search filter section. */
    searchForm: TypedFormGroup<{ lines: SearchLine[] }>;

    /** Chips containing the search criteria displayed at the top of the filter area. */
    searchChips: SearchChip[] = [];

    /** `FormGroup` used to update the row records in the grid view. */
    gridForm: FormGroup;

    /** Flag indicating if the results table is in grid mode or not. */
    set gridMode(gridMode: boolean) {
        // Before disabling grid mode, ensure the user is ok with losing any unsaved changes
        if (this.hasGridChangesToKeep) {
            this.logger.debug('Cancelling disable grid view to keep changes');
            return;
        }
        this._gridMode = gridMode;
        this.initializeGridForm(); // update the form as grid mode is turned on/off
        this.selection.clear(); // clear any selected values, grid and table selection values don't mix
    }
    get gridMode(): boolean {
        return this._gridMode;
    }
    private _gridMode = false;

    /** Current table rows selection used by the table components. */
    selection = new SelectionModel<any>(true, [], true);

    constructor(
        readonly searchFacade: SearchFacade,
        private readonly formFactory: FormFactory,
        readonly changeDetectorRef: ChangeDetectorRef,
        private readonly messageFacade: MessageFacade
    ) {}

    ngOnInit(): void {
        // build the initial search filter form
        this.initializeSearchFilterForm();
        // default sort to first column if not set - moved into function to avoid duplicate code
        this.setSearchSort(this.sort || new QuerySort(this.columnsArray[0]));
        // select box column required if there are selection actions passed in
        this.selectable = this.selectable || !isNullOrUndefined(this.selectionActionsTemplate);
    }

    ngAfterViewInit(): void {
        if (this.previousSearchEnabled) {
            this.triggerPreviousSearch();
            // manual change detection required for changes in ngAfterViewInit (https://github.com/angular/angular/issues/10131)
            this.changeDetectorRef.detectChanges();
        }
    }

    /** Performs a search and updates the displayed columns if there are any saved previous configurations. */
    triggerPreviousSearch(): void {
        forkJoin([
            this.searchFacade.getPreviousDisplayedColumns().pipe(take(1)),
            this.searchFacade.getPreviousSearch().pipe(take(1)),
        ]).subscribe(([previousDisplayedColumns, previousQuerySearch]) => {
            if (previousDisplayedColumns && previousDisplayedColumns.length > 0) {
                this.displayedColumns = previousDisplayedColumns;
            }
            if (previousQuerySearch) {
                // reset searchForm/lines/chips etc.
                this.initializeSearchFilterForm(previousQuerySearch.filters);
                // reset page state
                this.setSearchSort(previousQuerySearch.sort);
                this.page = previousQuerySearch.page;
                // fetch data
                this.logger.debug('Search triggered by previous search logic');
                this.search();
            }
        });
    }

    /** Build the search filter form. Defaults filter values based on the columns input. */
    initializeSearchFilterForm(searchLines = SearchLine.defaults(this.columnsArray)): void {
        this.logger.debug('Building search filter form with lines:', searchLines);
        this.searchForm = this.formFactory.searchFilter(searchLines);
    }

    /**
     * Sets the sort value. Defaults active sort to the first table column if an invalid sort is received.
     * A sort with no "direction" is considered to be an invalid sort value.
     * This prevents an empty sort (no "direction" defined) from being sent to the APIs,
     * as well as making sure there's always an active (and valid) sort.
     * Currently the default sort is the same as the one being defined in the "ngOnInit" (first column).
     * If no sort is passed (such as on a pagination event) nothing will happen, to preserve the active sort
     *
     * @param sort QuerySort new sort value for the search
     */
    setSearchSort(sort: QuerySort): void {
        // No sort (pagination event), should ignore sort
        if (!sort) return;
        // Sort has direction (normal sort event), should assign sort
        if (sort?.direction) {
            this.sort = sort;
        } else {
            // Sort has no direction ("no sort" event, should reset sort)
            this.sort = new QuerySort(this.columnsArray[0]);
        }
    }

    /** Reset the search filter to only the required columns. */
    clearSearchFilterForm(): void {
        this.initializeSearchFilterForm(SearchLine.requiredLines(this.columnsArray));
    }

    /** Adds a search line to the search filter. */
    addLine(): void {
        this.searchForm.getArray('lines').push(this.formFactory.searchFilterLine(new SearchLine()));
    }

    /** Removes a search line from the search filter. */
    removeLine(index: number): void {
        this.searchForm.getArray('lines').controls.splice(index, 1);
    }

    /** Handles page index, page size, and sorting changes. Which may result in a search. */
    pageChange(pageIndex?: number, pageSize?: number, sort?: QuerySort): void {
        // Before updating the page, check to see if there are changes in the grid data the user wants to keep
        if (this.hasGridChangesToKeep) {
            this.logger.debug('Cancelling page change to keep changes');
            // Internal component values for the cancelled pagination and sort events have already been updated at this point
            // because that is what triggered this `pageChange` call. The next functions are meant to refresh those internal
            // components with the correct page values from before the cancelled event.
            // It will probably be worth double checking this is still necessary with future angular material updates.
            this.grid.refreshSortValues();
            this.paginator.refreshPageValues();
            return;
        }
        // update page values
        if (!isNullOrUndefined(pageIndex)) {
            this.page.index = pageIndex;
        }
        if (!isNullOrUndefined(pageSize)) {
            this.page.size = pageSize;
        }
        // Removed validation to allow the removal of invalid sort values (i.e. sort with no "direction")
        this.setSearchSort(sort);
        // Since this method only gets called when the page index, page size, or sorting changes, a new search is only necessary
        // if there's any actual data. Otherwise, the user will click the 'Search' button which calls 'search' directly.
        if (this.totalElements > 0) {
            this.logger.debug('Search triggered by a page change event');
            this.search(true); // ignoring unsaved changes since the user would have already indicated it's ok to lose them
        }
    }

    /** Sets the currently displayed columns. */
    applyColumnChanges(displayedColumns: string[]): void {
        this.displayedColumns = displayedColumns;
        // save current column choices for user convenience if they navigate back
        if (this.previousSearchEnabled) {
            this.searchFacade.savePreviousDisplayedColumns(this.displayedColumns);
        }
    }

    /** Triggers the search and saves the search parameters if `previousSearchEnabled`. */
    search(ignoreUnsavedChanges = false): void {
        // We'll want to ignore the unsaved changes warning if we're searching from a page change event (because
        // the check has already happened once) or when searching after a save (because the changes have already
        // been saved). Otherwise, check with the user that the search is ok if there's unsaved changes.
        if (!ignoreUnsavedChanges && this.hasGridChangesToKeep) {
            this.logger.debug('Cancelling search to keep changes');
            return;
        }
        this.isLoading = true; // trigger loading overlay
        this.selection.clear(); // clear any old row selections
        const searchLines = this.searchLinesFromForm();
        const queryRestrictions = searchLines
            .filter((searchLine) => searchLine.populated)
            .map((searchLine) => searchLine.toQueryRestriction());
        const querySearch = { queryRestrictions, sort: this.sort, page: this.page };
        this.logger.debug('Searching for:', querySearch);
        // perform the search
        this.searchFn(querySearch).subscribe(
            (response) => {
                this.logger.debug('Search results:', response);
                this.content = response.content;
                this.totalElements = response.totalElements;
                this.initializeGridForm(); // update grid's form if necessary
                this.isLoading = false; // remove loading overlay
                // update chips displayed at the top of the filter
                this.updateSearchChips(searchLines);
                // save search configuration of last successful search for user convenience
                if (this.previousSearchEnabled) {
                    this.searchFacade.savePreviousSearch({
                        filters: searchLines,
                        sort: this.sort,
                        page: this.page,
                    });
                }
            },
            (e) => {
                this.isLoading = false; // remove loading overlay
                this.logger.error('Error performing search:', querySearch, e);
                throw e; // rethrow and let the global error handler handle it
            }
        );
    }

    /** Checks if the user has changes to grid data that they don't want to lose. */
    private get hasGridChangesToKeep(): boolean {
        return (
            this.unsavedChanges && !confirm('You have unsaved changes. If you continue, those changes will be lost.')
        );
    }

    /** Build an array of SearchLines from the searchForm values. */
    private searchLinesFromForm(): SearchLine[] {
        return this.searchForm
            .getArray('lines')
            .controls // cast to SearchLine for field access, rawValue instead of value to get disabled fields
            .map((control) => (control as FormGroup).getRawValue() as SearchLine)
            .map((searchLine) => new SearchLine(searchLine.column, searchLine.comparator, searchLine.value));
    }

    /** Build an array of SearchChips that will be displayed at the top of the filter area. */
    private updateSearchChips(searchLines: SearchLine[]): void {
        this.searchChips = searchLines
            .filter((searchLine) => searchLine.populated)
            .map((searchLine) => {
                if (searchLine.column.isDropdown) {
                    const dropdown = searchLine.column as AbstractDropdownColumn<any>;
                    return new SearchChip(searchLine, dropdown.mapToDropdownDisplay);
                } else {
                    return new SearchChip(searchLine, searchLine.column.mapToFilterDisplay);
                }
            });
    }

    /** Builds a grid form if gridMode is enabled. Clears it out otherwise. */
    private initializeGridForm(): void {
        if (this.gridMode) {
            this.logger.debug('Building a grid form for:', this.entityType);
            this.gridForm = this.formFactory.grid(this.entityType, this.content, this._destroyed, {
                scope: 'GRID',
                changeDetector: this.changeDetectorRef,
                selectionModel: this.selection,
                ...this.formOptions,
            });
        } else {
            this.gridForm = null;
        }
    }

    /** Save the records that were updated in the grid view. */
    save(): void {
        this.isLoading = true; // trigger loading overlay
        const patches: EntityPatch<any>[] = (this.gridForm.get('data') as FormArray).controls
            .filter((row: FormGroup, index: number) => this.selection.isSelected(index) && row.valid)
            .map((row) => {
                const rootIndex = 0; // root/parent field of an apiFieldPath e.g. costAccount.code apiFieldPath.split('.')[rootIndex] => costAccount

                const fields = this.columnsArray
                    // filter down to gridUpdatable and displayed columns
                    .filter((column) => column.gridUpdatable && this.displayedColumns.includes(column.name))
                    // only include field roots e.g. costAccount.code => costAccount
                    .map((column) => column.apiFieldPath);

                // all of the root/parent fields to be used when updating the entity
                // you cannot update costAccount.code and most pass the root (costAccount) to the api with the updated value
                const rootFields = fields
                    .map((field) => field.split('.')[rootIndex])
                    // only include dirty fields
                    .filter((field) => row.get(field).dirty);

                // update the field value(s) when updating a child value to null
                fields.forEach((field) => {
                    const rootField = field.split('.')[rootIndex];
                    // cannot pass e.g. `{ id: null, code: null, description: null, version: null }` to the api, must be just `null`
                    row.value[rootField] = isNullOrUndefined(row.get(field.split('.')).value)
                        ? null
                        : row.value[rootField];
                });
                return { id: row.value.id, updateValues: row.value, fields: rootFields } as EntityPatch<any>;
            });
        this.logger.debug('Saving:', patches);
        // perform the save
        this.saveFn(patches).subscribe(
            (count: number) => {
                this.messageFacade.addSaveCountMessage(count, 'updated');
                // resetting to first page and retriggering search (grid update could invalidate search criteria)
                this.page.index = 0;
                this.search(true); // ignoring unsaved changes since they are no longer unsaved
            },
            (e) => {
                this.isLoading = false;
                this.messageFacade.addMessage({
                    severity: 'error',
                    message: 'Failed to update selected item(s).',
                    hasTimeout: true,
                });
                this.logger.error('Failed to update grid rows:', e);
            }
        );
    }

    /** Clear out search results and open the filter back up. Useful for resetting a selection component's state. */
    clear(): void {
        this.selection.clear();
        this.content = [];
        this.totalElements = 0;
        this.searchFilter.open();
        this.searchChips = [];
    }

    /** @see DataModifier.unsavedChanges */
    get unsavedChanges(): boolean {
        return this.gridForm && this.gridForm.dirty;
    }

    ngOnDestroy(): void {
        this._destroyed.next();
    }
}
