import { throwError } from 'rxjs';
import { Column } from '../models/column';
import { DynamicDropdownColumn, SimpleDropdownColumn } from '../models/dropdown-column';
import { Comparators } from './../models/comparators';
import { MockSearchService } from './search.service.mock';

/**
 * Mock column data for testing
 */

export interface Described {
    id: number;
    desc: string;
}

export const stringColumn: Column = Column.of({
    name: 'String',
    apiFieldPath: 'name',
    type: 'string',
    gridUpdatable: true,
    searchable: { defaultSearch: true, required: true },
});

export const booleanColumn: Column = Column.of({
    name: 'Boolean',
    apiFieldPath: 'active',
    type: 'boolean',
    searchable: { defaultSearch: true },
    gridUpdatable: true,
});

export const integerColumn = Column.of({
    name: 'Id',
    apiFieldPath: 'id',
    type: 'integer',
    gridUpdatable: true,
});

export const decimalColumn = Column.of({
    name: 'Decimal',
    apiFieldPath: 'decimal',
    type: 'decimal',
    decimalPlaces: 1,
    gridUpdatable: true,
});

export const currencyColumn = Column.of({
    name: 'Currency',
    apiFieldPath: 'currency',
    type: 'currency',
    decimalPlaces: 2,
    gridUpdatable: true,
});

export const dateColumn = Column.of({
    name: 'Date',
    apiFieldPath: 'date',
    type: 'date',
    gridUpdatable: true,
});

export const simpleStringDropdown: SimpleDropdownColumn<string> = SimpleDropdownColumn.of({
    name: 'Simple String Dropdown',
    apiFieldPath: 'simpleString',
    type: 'string',
    values: ['A', 'B', 'C'],
    hint: 'A, B, or C',
    gridUpdatable: true,
    nullable: true,
});

export const simpleObjectDropdown: SimpleDropdownColumn<Described> = SimpleDropdownColumn.of({
    name: 'Simple Object Dropdown',
    apiFieldPath: 'simpleObject',
    apiSortPath: 'simpleObject.id',
    type: { entityType: 'Store' },
    values: [
        { id: 1, desc: 'ONE' },
        { id: 2, desc: 'TWO' },
    ] as Described[],
    mapToKey: (value) => (value ? value.id : null),
    mapToDropdownDisplay: (value) => `${value.id} - ${value.desc}`,
    mapToFilterDisplay: (value) => value.desc,
    mapToTableDisplay: (value) => `${value.desc}(${value.id})`,
    hint: 'ONE or TWO',
    gridUpdatable: true,
});

export const dynamicStringDropdown: DynamicDropdownColumn<string> = DynamicDropdownColumn.of({
    name: 'Dynamic String Dropdown',
    apiFieldPath: 'dynamicString',
    apiSortPath: 'dynamicString',
    type: 'string',
    minCharactersForSearch: 2,
    maxCharactersForSearch: 3,
    // Stubbed for mocking sake.  Real case would use httpClient to make remote API call
    fetchData: (searchText) => new MockSearchService().searchStrings(searchText),
    hint: 'Store Number',
    gridUpdatable: true,
});

export const errorThrowingDropdown: DynamicDropdownColumn<string> = DynamicDropdownColumn.of({
    name: 'Error Throwing Dropdown',
    apiFieldPath: 'errorString',
    apiSortPath: 'errorString',
    type: 'string',
    minCharactersForSearch: 1,
    maxCharactersForSearch: 3,
    fetchData: () => throwError(new Error('I broke')),
    hint: 'Store Number',
    displayedByDefault: false,
});

export const searchableOnlyColumn: Column = SimpleDropdownColumn.of({
    name: 'SearchableOnly',
    apiFieldPath: 'searchableOnly',
    type: 'integer',
    displayable: false,
    values: [1, 2, 3],
});

export const nestedEntityColumn: SimpleDropdownColumn<Described> = SimpleDropdownColumn.of({
    name: 'Nested Entity Field',
    apiFieldPath: 'parent.child.category',
    apiSortPath: 'parent.child.category.id',
    type: { entityType: 'Category' },
    values: [
        { id: 1, desc: 'CATEGORY 1' },
        { id: 2, desc: 'CATEGORY 2' },
    ] as Described[],
    mapToKey: (value) => (value ? value.id : null),
    mapToDropdownDisplay: (value) => `${value.id} - ${value.desc}`,
    mapToFilterDisplay: (value) => value.desc,
    mapToTableDisplay: (value) => `${value.desc}`,
    hint: 'Category 1 or Category 2',
    displayedByDefault: true,
    // will be determined not be updatable due to fieldPath
    gridUpdatable: true,
});

export const notSearchableColumn: Column = Column.of({
    name: 'Not Searchable',
    apiFieldPath: 'notSearchableString',
    type: 'string',
    searchable: false,
});

export const searchDefaultedColumn: Column = Column.of({
    name: 'Search Defaulted',
    apiFieldPath: 'searchDefaulted',
    type: 'string',
    gridUpdatable: true,
    searchable: { defaultSearch: { comparator: Comparators.equalTo, value: 'test' } },
});

export const disabledColumn: Column = Column.of({
    name: 'Disabled Column',
    apiFieldPath: 'disabledColumn',
    type: 'string',
    searchable: { defaultSearch: { comparator: Comparators.equalTo, value: 'test' }, required: true },
});

export const allColumns: Column[] = [
    stringColumn,
    booleanColumn,
    Column.of(integerColumn),
    Column.of(decimalColumn),
    Column.of(currencyColumn),
    Column.of(dateColumn),
    simpleStringDropdown,
    simpleObjectDropdown,
    dynamicStringDropdown,
    errorThrowingDropdown,
    searchableOnlyColumn,
    nestedEntityColumn,
    disabledColumn,
];
