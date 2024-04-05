import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { SearchLine } from '@vioc-angular/shared/common-api-models';
import { isNullOrUndefined } from '@vioc-angular/shared/common-functionality';
import { Loggers } from '@vioc-angular/shared/common-logging';
import {
    Column,
    Comparator,
    Comparators,
    CustomType,
    DynamicDropdownColumn,
    instanceOfDefaultSearch,
    Searchable,
} from '@vioc-angular/shared/util-column';
import { TypedFormGroup } from '@vioc-angular/shared/util-form';
import { ReplaySubject } from 'rxjs';
import { pairwise, startWith, takeUntil } from 'rxjs/operators';

/**
 * Component used to create search filters. Using the `searchableColumns`, it will load a list of supported `Comparator`s
 * that will be used to equate against the `value`(s). The `value`(s) are loaded as either basic inputs or as dropdowns depending
 * on if the `column` is a dropdown column or not.
 *
 * @example
 * <vioc-angular-search-line
 *  [searchLineForm]="form"
 *  [searchableColumns]="searchableColumns">
 * </vioc-angular-search-line>
 */
@Component({
    selector: 'vioc-angular-search-line',
    templateUrl: './search-line.component.html',
    styleUrls: ['./search-line.component.scss'],
})
export class SearchLineComponent implements OnInit, OnDestroy {
    private readonly logger = Loggers.get('feature-search', 'SearchLineComponent');

    /**
     * `Column`s that can be used to apply search filters.
     */
    @Input() set searchableColumns(columns: Column[]) {
        this._searchableColumns = [...columns];
        this._searchableColumns.sort((column1, column2) => column1.name.localeCompare(column2.name));
    }
    get searchableColumns() {
        return this._searchableColumns;
    }
    private _searchableColumns: Column[];
    /**
     * `FormGroup` used to contain the `SearchLine` values for `column`, `comparator` and `value`.
     */
    @Input() searchLineForm: TypedFormGroup<SearchLine>;

    /**
     * A list of supported `Comparator`s for the selected `Column`.
     */
    comparators: Comparator[] = null;

    inputType: string;

    private readonly _destroyed = new ReplaySubject(1);

    ngOnInit(): void {
        // if we already have a column, update it to make sure that it is the exact object that is present in the dropdown options
        let column = this.searchLineForm.getControlValue('column');
        let comparator = this.searchLineForm.getControlValue('comparator');
        if (column) {
            column = this.searchableColumns.find((c) => c.name === column.name) || null;
            this.searchLineForm.setControlValue('column', column, { emitEvent: false });
            if (column) {
                this.comparators = this.buildComparators();
            }

            // if we still have a column (invalid one was not passed) and we have a comparator, update the comparator so that it is the
            //  exact object that is present in the dropdown options.
            if (column && comparator) {
                comparator = this.comparators.find((c) => c.value === comparator.value) || null;
            } else {
                comparator = null;
            }
            this.searchLineForm.setControlValue('comparator', comparator, { emitEvent: false });
        }

        if (column && column.isRequired) {
            this.searchLineForm.get('column').setValidators(Validators.required);
            this.searchLineForm.get('column').disable();
            this.searchLineForm.get('comparator').setValidators(Validators.required);
            this.searchLineForm.get('value').setValidators(Validators.required);
        }

        // set up for default searchline values and change values
        this.configureDefaultValues();
        this.configureValueChange();
        this.inputType = this.determineInputType();
    }

    /**
     * Checks if column has comparators; if the selected column has default criteria and is required or searched by default,
     * default criteria will be assigned; if the first comparator requires data, and then assigns the first comparator to the column.
     */
    private configureDefaultValues(): void {
        if (this.comparators && !this.searchLineForm.get('comparator').value) {
            const column = this.searchLineForm.getControlValue('column');
            if (column.isSearchedByDefault) {
                const defaultSearch = (column.searchable as Searchable).defaultSearch;
                const comparator = instanceOfDefaultSearch(defaultSearch)
                    ? this.comparators.find((c) => c.value === defaultSearch.comparator.value)
                    : this.comparators[0];
                const value = instanceOfDefaultSearch(defaultSearch) ? defaultSearch.value : null;
                if (comparator) {
                    this.searchLineForm.setControlValue('comparator', comparator);
                    this.searchLineForm.setControlValue('value', value);
                } else {
                    throw new Error(`Column: ${JSON.stringify(column)} assigned an unsupported comparator`);
                }
            } else if (this.comparators[0].requiresData !== false) {
                this.searchLineForm.get('comparator').setValue(this.comparators[0]);
            }
            this.searchLineForm.get('column').markAsUntouched();
        }
        this.searchLineForm.get('column').updateValueAndValidity();
    }

    /**
     * Creates pipe maps and subscriptions to the `Column` and `Comparator` form value changes. If the column value
     * changes, filter the list of available columns until one is selected, then trigger the method to configure the
     * comparator field. If the comparator value changes, filter the available comparators until one is
     * selected, then trigger to configure the value field.
     */
    private configureValueChange(): void {
        this.searchLineForm
            .get('column')
            .valueChanges.pipe(takeUntil(this._destroyed))
            .subscribe(() => this.columnSelect());

        // Setup the comparator value change logic, this tracks the previous and newly selected comparator
        this.searchLineForm
            .getControl('comparator')
            .valueChanges.pipe(
                takeUntil(this._destroyed),
                startWith(this.searchLineForm.getControlValue('comparator')),
                pairwise()
            )
            .subscribe(([oldComparator, newComparator]) => this.comparatorSelect(oldComparator, newComparator));
    }

    private buildComparators(): Comparator[] {
        if (!this.searchLineForm.getControlValue('column')) {
            throw new Error('Column must be selected to build comparators!');
        }
        return Comparators.for(this.searchLineForm.getControlValue('column'));
    }

    columnToName(col: Column) {
        return col.name;
    }

    private columnSelect(): void {
        this.logger.debug('columnSelect: selected', this.searchLineForm.getControlValue('column'));
        this.comparators = this.buildComparators();
        this.searchLineForm.get('comparator').setValue((this.comparators && this.comparators[0]) || null);
        this.searchLineForm.get('comparator').markAsUntouched();
        this.searchLineForm.get('value').setValue(null);
        this.searchLineForm.get('value').markAsUntouched();
        this.inputType = this.determineInputType();
    }

    comparatorToDisplayValue(comparator: Comparator) {
        return comparator.displayValue;
    }

    comparatorSelect(oldComparator: Comparator, newComparator: Comparator): void {
        this.logger.debug('comparatorSelect: selected', newComparator);
        // Reset the value field if selected comparator (like is-blank and is-not-blank) does not require data or if switching
        // from a date range to a single date (and vice versa).
        if (
            newComparator?.requiresData === false ||
            Comparators.isDateRangeComparator(oldComparator) !== Comparators.isDateRangeComparator(newComparator)
        ) {
            this.searchLineForm.setControlValue('value', null);
        }
    }

    get isDropdown(): boolean {
        const column = this.searchLineForm.getControlValue('column');
        return column !== null && column.isDropdown === true; // return true/false instead of truthy/falsey
    }

    get selectedColumnAsDropdown(): DynamicDropdownColumn<any> {
        return this.searchLineForm.getControlValue('column') as DynamicDropdownColumn<any>;
    }

    get requiresData(): boolean {
        return (
            !isNullOrUndefined(this.searchLineForm.get('comparator').value) &&
            this.searchLineForm.get('comparator').value.requiresData !== false
        );
    }

    get isMultiValue(): boolean {
        return this.searchLineForm.get('comparator') && this.searchLineForm.get('comparator').value.multiValue;
    }

    /** Check if the selected column is a date or date time and requires a date range. */
    get isDateRange(): boolean {
        const columnType = this.searchLineForm.getControlValue('column')?.type;
        return (
            (columnType === 'date' || columnType === 'dateTime') &&
            Comparators.isDateRangeComparator(this.searchLineForm.getControlValue('comparator'))
        );
    }

    determineInputType() {
        if (!this.searchLineForm.getControlValue('column')) {
            // No column has been selected so no inputType yet
            return undefined;
        } else if (this.isDropdown) {
            return 'select-dropdown';
        } else {
            const jsType =
                (this.searchLineForm.getControlValue('column').type as CustomType).inputType != null
                    ? (this.searchLineForm.getControlValue('column').type as CustomType).inputType
                    : this.searchLineForm.getControlValue('column').type;
            switch (jsType) {
                case 'decimal':
                case 'integer':
                    return 'number';
                case 'date':
                case 'dateTime':
                    return 'date';
                case 'string':
                    return 'text';
                case 'boolean':
                    return 'boolean';
                default:
                    this.logger.warn('Unsupported input type in', this.searchLineForm.getControlValue('column'));
                    return 'text';
            }
        }
    }

    ngOnDestroy(): void {
        this._destroyed.next();
    }
}
