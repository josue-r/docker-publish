import { SelectionModel } from '@angular/cdk/collections';
import { Component, EventEmitter, Input, Output, TemplateRef, Type } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { PageEvent } from '@angular/material/paginator';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { QueryPage, QuerySearch, QuerySort, SearchLine } from '@vioc-angular/shared/common-api-models';
import { MessageFacade } from '@vioc-angular/shared/data-access-message';
import { PreviousQuerySearch, SearchFacade } from '@vioc-angular/shared/data-access-search';
import { UiLoadingMockModule } from '@vioc-angular/shared/ui-loading';
import { EntityPatch } from '@vioc-angular/shared/util-api';
import {
    booleanColumn,
    Column,
    Columns,
    Comparators,
    disabledColumn,
    integerColumn,
    simpleStringDropdown,
    stringColumn,
} from '@vioc-angular/shared/util-column';
import { FormFactory } from '@vioc-angular/shared/util-form';
import { of, throwError } from 'rxjs';
import { MockSearchFilterComponent } from '../mocks/search-filter.component.mock';
import { SearchChip } from './../models/search-chip';
import { SearchComponent } from './search.component';

describe('SearchComponent', () => {
    @Component({
        selector: 'vioc-angular-table-header',
        template: '',
    })
    class MockTableHeaderComponent {
        @Input() selection: SelectionModel<any>;
        @Input() actionsTemplate: TemplateRef<any>;
        @Input() selectionActionsTemplate: TemplateRef<any>;
        @Input() menuItemsTemplate: TemplateRef<any>;
    }
    @Component({
        selector: 'vioc-angular-manage-columns',
        template: '',
    })
    class MockManageColumnsComponent {
        @Input() columns: Columns;
        @Input() displayedColumns: string[];
        @Output() apply: EventEmitter<any> = new EventEmitter();
        openDialog = jest.fn();
    }
    @Component({
        selector: 'vioc-angular-table',
        template: '',
    })
    class MockTableComponent {
        @Input() data: any[];
        @Input() columns: Column[];
        @Input() displayedColumns: string[];
        @Input() selection: SelectionModel<any>;
        @Input() multiple: boolean;
        @Input() sort: QuerySort;
        @Output() sortChange: EventEmitter<any> = new EventEmitter();
        @Output() rowSelect: EventEmitter<any> = new EventEmitter();
        @Input() singleSelection: boolean;
    }
    @Component({
        selector: 'vioc-angular-grid',
        template: '',
    })
    class MockGridComponent {
        @Input() form: FormGroup;
        @Input() columns: Column[];
        @Input() displayedColumns: string[];
        @Input() selection = new SelectionModel<any>();
        @Input() sort: QuerySort;
        @Output() sortChange: EventEmitter<any> = new EventEmitter();
        refreshSortValues = jest.fn();
    }
    @Component({
        selector: 'vioc-angular-paginator',
        template: '',
    })
    class MockPaginatorComponent {
        @Input() index = 0;
        @Input() size = 20;
        @Input() length = 0;
        @Input() sizeOptions: number[] = [10, 20, 50];
        @Output() pageChange = new EventEmitter<PageEvent>();
        refreshPageValues = jest.fn();
    }

    let component: SearchComponent;
    let fixture: ComponentFixture<SearchComponent>;

    const mockSearchFacade = {
        savePreviousDisplayedColumns: jest.fn(),
        savePreviousSearch: jest.fn(),
        getPreviousDisplayedColumns: jest.fn(() => of()),
        getPreviousSearch: jest.fn(() => of()),
    };
    const mockMessageFacade = {
        addMessage: jest.fn(),
        addSaveCountMessage: jest.fn(),
    };
    const mockSearchFn = jest.fn();
    const mockSaveFn = jest.fn();
    const testColumns: Columns = {
        id: integerColumn,
        active: booleanColumn,
        name: stringColumn,
    };
    const testEntityType = 'TestEntity';
    const testGridForm = {
        get: () => {
            return { controls: [] };
        },
        dirty: false,
    } as unknown as FormGroup;

    let formFactory: FormFactory;

    const verifyEventHandler = (
        handler: any,
        childComponent: Type<any>,
        event: string,
        eventValue: any,
        expectedArgs: any[]
    ) => {
        jest.spyOn(component, handler).mockImplementation();
        fixture.debugElement.query(By.directive(childComponent)).triggerEventHandler(event, eventValue);
        expect(component[handler]).toHaveBeenCalledWith(...expectedArgs);
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                ReactiveFormsModule,
                NoopAnimationsModule,
                MatMenuModule,
                MatIconModule,
                MatButtonModule,
                UiLoadingMockModule,
            ],
            declarations: [
                SearchComponent,
                MockSearchFilterComponent,
                MockTableHeaderComponent,
                MockManageColumnsComponent,
                MockTableComponent,
                MockGridComponent,
                MockPaginatorComponent,
            ],
            providers: [
                { provide: SearchFacade, useValue: mockSearchFacade },
                FormFactory,
                { provide: MessageFacade, useValue: mockMessageFacade },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        jest.clearAllMocks();
        fixture = TestBed.createComponent(SearchComponent);
        component = fixture.componentInstance;
        formFactory = TestBed.inject(FormFactory);
        jest.spyOn(formFactory, 'grid').mockReturnValue(testGridForm);
        component.columns = testColumns;
        component.searchFn = mockSearchFn;
        component.saveFn = mockSaveFn;
        component.entityType = testEntityType;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('inputs', () => {
        describe('columns', () => {
            const filterableColumns = {
                notDisplayable: Column.of({
                    apiFieldPath: 'notDisplayable',
                    name: 'notDisplayable',
                    type: 'string',
                    displayable: false,
                }),
                displayable: Column.of({
                    apiFieldPath: 'displayable',
                    name: 'displayable',
                    type: 'string',
                    displayable: true,
                    displayedByDefault: false,
                }),
                displayed: Column.of({
                    apiFieldPath: 'displayed',
                    name: 'displayed',
                    type: 'string',
                    displayable: true,
                    displayedByDefault: true,
                }),
            };

            it('should update columnsArray, displayableColumns, and displayedColumns', () => {
                component.columns = filterableColumns;
                expect(component.columnsArray).toEqual([
                    filterableColumns.notDisplayable,
                    filterableColumns.displayable,
                    filterableColumns.displayed,
                ]);
                expect(component.displayableColumns).toEqual([
                    filterableColumns.displayable,
                    filterableColumns.displayed,
                ]);
                expect(component.displayedColumns).toEqual([filterableColumns.displayed.name]);
            });
        });
    });

    describe.each`
        gridMode | hasChanges | confirmResponse | expectedResult
        ${true}  | ${true}    | ${true}         | ${false}
        ${true}  | ${true}    | ${false}        | ${true}
        ${true}  | ${false}   | ${true}         | ${false}
        ${true}  | ${false}   | ${false}        | ${false}
        ${false} | ${true}    | ${true}         | ${true}
        ${false} | ${true}    | ${false}        | ${false}
        ${false} | ${false}   | ${true}         | ${true}
        ${false} | ${false}   | ${false}        | ${true}
    `('gridMode', ({ gridMode, hasChanges, confirmResponse, expectedResult }) => {
        it(`should be ${expectedResult} if gridMode=${gridMode}, hasChanges=${hasChanges}, and confirmResponse=${confirmResponse}`, () => {
            component.selection.select({ id: 1, name: 'name', active: true });
            component['_gridMode'] = gridMode;
            component.gridForm = { dirty: hasChanges } as unknown as FormGroup;
            jest.spyOn(window, 'confirm').mockReturnValueOnce(confirmResponse);
            component.gridMode = !gridMode; // toggle grid mode
            expect(component.gridMode).toEqual(expectedResult);
            if (expectedResult !== gridMode) {
                // if toggle succesfful
                if (expectedResult) {
                    expect(formFactory.grid).toHaveBeenCalled();
                }
                expect(component.selection.isEmpty()).toBeTruthy();
            } else {
                // toggle cancelled
                expect(formFactory.grid).not.toHaveBeenCalled();
                expect(component.selection.isEmpty()).toBeFalsy();
            }
        });
    });

    describe.each`
        field           | defaultValue                    | dependentField                | dependentValue
        ${'sort'}       | ${new QuerySort(integerColumn)} | ${'sort'}                     | ${undefined}
        ${'sort'}       | ${new QuerySort(stringColumn)}  | ${'sort'}                     | ${new QuerySort(stringColumn)}
        ${'selectable'} | ${true}                         | ${'selectable'}               | ${true}
        ${'selectable'} | ${false}                        | ${'selectable'}               | ${false}
        ${'selectable'} | ${true}                         | ${'selectionActionsTemplate'} | ${{} as unknown as TemplateRef<any>}
        ${'selectable'} | ${false}                        | ${'selectionActionsTemplate'} | ${undefined}
    `('ngOnInit', ({ field, defaultValue, dependentField, dependentValue }) => {
        it(`should initialize & set ${field} to ${defaultValue} if ${dependentField} is ${dependentValue}`, () => {
            jest.spyOn(component, 'initializeSearchFilterForm').mockImplementation();
            jest.spyOn(component, 'setSearchSort');
            component[dependentField] = dependentValue;
            component.ngOnInit();
            expect(component[field]).toEqual(defaultValue);
            expect(component.initializeSearchFilterForm).toHaveBeenCalled();
            expect(component.setSearchSort).toHaveBeenCalled();
        });
    });

    describe.each`
        previousSearch
        ${true}
        ${false}
    `('ngAfterViewInit', ({ previousSearch }) => {
        it(`should ${previousSearch ? '' : 'not '} search if previousSearchEnabled=${previousSearch}`, () => {
            jest.spyOn(component.changeDetectorRef, 'detectChanges').mockImplementation();
            jest.spyOn(component, 'triggerPreviousSearch').mockImplementation();
            component.previousSearchEnabled = previousSearch;
            component.ngAfterViewInit();
            if (previousSearch) {
                expect(component.changeDetectorRef.detectChanges).toHaveBeenCalled();
                expect(component.triggerPreviousSearch).toHaveBeenCalled();
            } else {
                expect(component.triggerPreviousSearch).not.toHaveBeenCalled();
            }
        });
    });

    describe('triggerPreviousSearch', () => {
        const mockPreviousSearchCalls = (previousColumns: string[], previousSearch: PreviousQuerySearch): void => {
            mockSearchFacade.getPreviousDisplayedColumns.mockReturnValueOnce(of(previousColumns));
            mockSearchFacade.getPreviousSearch.mockReturnValueOnce(of(previousSearch));
        };

        beforeEach(() => jest.spyOn(component, 'search').mockImplementation());

        describe.each`
            currentColumns                              | previousColumns                             | expectedColumns
            ${[integerColumn.name, booleanColumn.name]} | ${[integerColumn.name]}                     | ${[integerColumn.name]}
            ${[integerColumn.name, booleanColumn.name]} | ${undefined}                                | ${[integerColumn.name, booleanColumn.name]}
            ${undefined}                                | ${[integerColumn.name, booleanColumn.name]} | ${[integerColumn.name, booleanColumn.name]}
            ${[integerColumn.name]}                     | ${[]}                                       | ${[integerColumn.name]}
        `('previousDisplayedColumns', ({ currentColumns, previousColumns, expectedColumns }) => {
            it(`should have displayedColumns=${expectedColumns} if currentColumns=${currentColumns} and previousColumns=${previousColumns}`, fakeAsync(() => {
                component.displayedColumns = currentColumns;
                mockPreviousSearchCalls(previousColumns, undefined);
                component.triggerPreviousSearch();
                flush();
                expect(component.displayedColumns).toEqual(expectedColumns);
            }));
        });

        describe('previousQuerySearch', () => {
            it('should search with previous search configuration', fakeAsync(() => {
                const testQuerySearch = {
                    filters: [new SearchLine(integerColumn, Comparators.equalTo, 4)],
                    page: new QueryPage(0, 10),
                    sort: new QuerySort(integerColumn),
                } as PreviousQuerySearch;
                mockPreviousSearchCalls(undefined, testQuerySearch);
                jest.spyOn(component, 'initializeSearchFilterForm').mockImplementation();
                component.triggerPreviousSearch();
                flush();
                expect(component.initializeSearchFilterForm).toHaveBeenCalledWith(testQuerySearch.filters);
                expect(component.sort).toEqual(testQuerySearch.sort);
                expect(component.page).toEqual(testQuerySearch.page);
                expect(component.search).toHaveBeenCalled();
            }));
            it('should not search if no previous search configuration', fakeAsync(() => {
                mockPreviousSearchCalls(undefined, undefined);
                component.triggerPreviousSearch();
                flush();
                expect(component.search).not.toHaveBeenCalled();
            }));
        });
    });

    describe('initializeSearchFilterForm', () => {
        const requiredColumn = Column.of({ ...stringColumn, searchable: { required: true } });

        beforeEach(() => jest.spyOn(formFactory, 'searchFilter'));

        it('should build a form out of the default column configuration', () => {
            const expectedSearchLines = [new SearchLine(integerColumn, Comparators.equalTo, 4), new SearchLine()];
            jest.spyOn(SearchLine, 'defaults').mockReturnValueOnce(expectedSearchLines);
            component.initializeSearchFilterForm();
            expect(SearchLine.defaults).toHaveBeenCalled();
            expect(formFactory.searchFilter).toHaveBeenCalledWith(expectedSearchLines);
        });
        it('should build a form out of the provided searchLines', () => {
            const expectedSearchLines = [new SearchLine(), new SearchLine()];
            component.initializeSearchFilterForm(expectedSearchLines);
            expect(formFactory.searchFilter).toHaveBeenCalledWith(expectedSearchLines);
        });

        describe.each`
            event            | expectedArgs
            ${'clearFilter'} | ${[[new SearchLine(requiredColumn)]]}
            ${'resetFilter'} | ${[]}
        `('as event handler', ({ event, expectedArgs }) => {
            it(`should be called when SearchFilterComponent has a ${event} event`, () => {
                component.columnsArray = [integerColumn, booleanColumn, requiredColumn];
                verifyEventHandler('initializeSearchFilterForm', MockSearchFilterComponent, event, {}, expectedArgs);
            });
        });
    });

    describe('setSearchSort', () => {
        const booleanSort = new QuerySort(booleanColumn);
        const integerSort = new QuerySort(integerColumn);
        const invalidSort = new QuerySort(stringColumn, null);

        beforeEach(() => jest.spyOn(component, 'setSearchSort'));

        describe.each`
            previousSort   | sort           | expectedSort
            ${integerSort} | ${booleanSort} | ${booleanSort}
            ${booleanSort} | ${integerSort} | ${integerSort}
            ${booleanSort} | ${undefined}   | ${booleanSort}
            ${integerSort} | ${null}        | ${integerSort}
            ${booleanSort} | ${booleanSort} | ${booleanSort}
            ${booleanSort} | ${invalidSort} | ${integerSort}
        `('variable updating', ({ previousSort, sort, expectedSort }) => {
            it(`should correctly update sort values`, () => {
                component.setSearchSort(previousSort);
                component.setSearchSort(sort);
                expect(component.sort).toEqual(expectedSort);
            });
        });
    });

    describe('addLine', () => {
        it('should add a search line to the searchForm', () => {
            component.searchForm = formFactory.searchFilter([new SearchLine()]);
            component.addLine();
            expect(component.searchForm.getArray('lines').length).toEqual(2);
            component.addLine();
            expect(component.searchForm.getArray('lines').length).toEqual(3);
        });

        describe('as event handler', () => {
            it('should be called when the SearchFilterComponent has an addLine event', () => {
                verifyEventHandler('addLine', MockSearchFilterComponent, 'addLine', {}, []);
            });
        });
    });

    describe('removeLine', () => {
        it('should remove a search line from the searchForm', () => {
            component.searchForm = formFactory.searchFilter([new SearchLine(), new SearchLine(), new SearchLine()]);
            component.removeLine(0);
            expect(component.searchForm.getArray('lines').length).toEqual(2);
            component.removeLine(0);
            expect(component.searchForm.getArray('lines').length).toEqual(1);
        });

        describe('as event handler', () => {
            it('should be called when the SearchFilterComponent has a removeLine event', () => {
                verifyEventHandler('removeLine', MockSearchFilterComponent, 'removeLine', 3, [3]);
            });
        });
    });

    describe('pageChange', () => {
        const booleanSort = new QuerySort(booleanColumn);
        const integerSort = new QuerySort(integerColumn);

        beforeEach(() => {
            jest.spyOn(component, 'search').mockImplementation();
            jest.spyOn(component, 'setSearchSort');
        });

        describe.each`
            index        | size         | sort           | expectedIndex | expectedSize | expectedSort
            ${1}         | ${15}        | ${booleanSort} | ${1}          | ${15}        | ${booleanSort}
            ${undefined} | ${undefined} | ${undefined}   | ${0}          | ${20}        | ${integerSort}
            ${null}      | ${null}      | ${null}        | ${0}          | ${20}        | ${integerSort}
            ${0}         | ${0}         | ${booleanSort} | ${0}          | ${0}         | ${booleanSort}
        `('variable udpating', ({ index, size, sort, expectedIndex, expectedSize, expectedSort }) => {
            it(`should maintain page values`, () => {
                component.pageChange(index, size, sort);
                expect(component.page.index).toEqual(expectedIndex);
                expect(component.page.size).toEqual(expectedSize);
                expect(component.sort).toEqual(expectedSort);
                expect(component.setSearchSort).toHaveBeenCalled();
            });
        });

        describe('unsavedChanges', () => {
            beforeEach(() => {
                jest.spyOn(component, 'search').mockImplementation();
                jest.spyOn(component, 'setSearchSort');
                component.page.index = 0;
                component.page.size = 20;
                component.sort = integerSort;
                component.totalElements = 144;
                component.gridMode = true;
                component.gridForm = { dirty: true } as unknown as FormGroup;
                fixture.detectChanges();
            });

            it('should confirm the user is ok with losing unsaved changes', () => {
                jest.spyOn(window, 'confirm').mockReturnValueOnce(true);
                component.pageChange(3, 30, booleanSort);
                expect(component.page.index).toEqual(3);
                expect(component.page.size).toEqual(30);
                expect(component.sort).toEqual(booleanSort);
                expect(window.confirm).toHaveBeenCalled();
                expect(component.setSearchSort).toHaveBeenCalled();
                expect(component.search).toHaveBeenCalledWith(true);
                expect(component.grid.refreshSortValues).not.toHaveBeenCalled();
                expect(component.paginator.refreshPageValues).not.toHaveBeenCalled();
            });
            it('should cancel if the user is not ok with losing unsaved changes', () => {
                jest.spyOn(window, 'confirm').mockReturnValueOnce(false);
                component.pageChange(3, 30, booleanSort);
                expect(component.page.index).toEqual(0);
                expect(component.page.size).toEqual(20);
                expect(component.sort).toEqual(integerSort);
                expect(window.confirm).toHaveBeenCalled();
                expect(component.setSearchSort).not.toHaveBeenCalled();
                expect(component.search).not.toHaveBeenCalled();
                expect(component.grid.refreshSortValues).toHaveBeenCalled();
                expect(component.paginator.refreshPageValues).toHaveBeenCalled();
            });
        });

        describe.each`
            totalElements | searchPerformed
            ${-1}         | ${false}
            ${0}          | ${false}
            ${1}          | ${true}
            ${100}        | ${true}
        `('searching', ({ totalElements, searchPerformed }) => {
            it(`should ${searchPerformed ? '' : 'not '}search if totalElements=${totalElements}`, () => {
                component.totalElements = totalElements;
                component.pageChange();
                expect(component.search).toHaveBeenCalledTimes(searchPerformed ? 1 : 0);
            });
        });

        describe.each`
            childComponent            | event           | eventValue                        | gridMode | expectedArgs
            ${MockGridComponent}      | ${'sortChange'} | ${integerSort}                    | ${true}  | ${[0, 20, integerSort]}
            ${MockTableComponent}     | ${'sortChange'} | ${booleanSort}                    | ${false} | ${[0, 20, booleanSort]}
            ${MockPaginatorComponent} | ${'pageChange'} | ${{ pageIndex: 3, pageSize: 15 }} | ${true}  | ${[3, 15]}
            ${MockPaginatorComponent} | ${'pageChange'} | ${{ pageIndex: 3, pageSize: 15 }} | ${false} | ${[3, 15]}
        `('as event handler', ({ childComponent, event, eventValue, gridMode, expectedArgs }) => {
            it(`should be called when ${childComponent.name} has a ${event} event`, () => {
                component.gridMode = gridMode;
                fixture.detectChanges();
                verifyEventHandler('pageChange', childComponent, event, eventValue, expectedArgs);
            });
        });
    });

    describe('applyColumnChanges', () => {
        const newColumns = ['test', 'column'];

        it('should update the displayed columns and save them if previousSearchEnabled', () => {
            component.applyColumnChanges(newColumns);
            expect(component.displayedColumns).toEqual(newColumns);
            expect(mockSearchFacade.savePreviousDisplayedColumns).toHaveBeenCalled();
        });
        it('should update the displayed columns and not save them if previousSearchEnabled is false', () => {
            component.previousSearchEnabled = false;
            component.applyColumnChanges(newColumns);
            expect(component.displayedColumns).toEqual(newColumns);
            expect(mockSearchFacade.savePreviousDisplayedColumns).not.toHaveBeenCalled();
        });
    });

    describe('search', () => {
        const completeLine = new SearchLine(integerColumn, Comparators.equalTo, 4);
        const completeDropdownLine = new SearchLine(simpleStringDropdown, Comparators.equalTo, 'A');
        const incompleteLine = new SearchLine(stringColumn, Comparators.startsWith);
        const requiredColumn = new SearchLine(disabledColumn, Comparators.equalTo, 'test');
        const whitespaceLine = new SearchLine(stringColumn, Comparators.startsWith, '    ');
        beforeEach(() =>
            component.initializeSearchFilterForm([
                completeLine,
                completeDropdownLine,
                incompleteLine,
                requiredColumn,
                whitespaceLine,
            ])
        );

        it('should search', fakeAsync(() => {
            component.selection.select(1);
            const mockResponse = {
                content: [
                    { id: 1, name: 'name1' },
                    { id: 1, name: 'name1' },
                ],
                totalElements: 2,
            };
            const gridSpy = jest.spyOn(component as any, 'initializeGridForm').mockImplementation();
            mockSearchFn.mockImplementationOnce((querySearch: QuerySearch) => {
                expect(querySearch.queryRestrictions).toEqual([
                    completeLine.toQueryRestriction(),
                    completeDropdownLine.toQueryRestriction(),
                    requiredColumn.toQueryRestriction(),
                ]); // shouldn't send the incompleteLine to the API
                expect(component.isLoading).toBeTruthy(); // should have loading overlay while searching
                return of(mockResponse);
            });
            component.previousSearchEnabled = true;
            component.search();
            flush();
            expect(mockSearchFn).toHaveBeenCalled();
            expect(component.selection.isEmpty()).toBeTruthy();
            expect(gridSpy).toHaveBeenCalled();
            expect(component.content).toEqual(mockResponse.content);
            expect(component.totalElements).toEqual(mockResponse.totalElements);
            expect(component.isLoading).toBeFalsy();
            expect(component.searchChips).toEqual([
                new SearchChip(completeLine, integerColumn.mapToFilterDisplay),
                new SearchChip(completeDropdownLine, simpleStringDropdown.mapToDropdownDisplay),
                new SearchChip(requiredColumn, disabledColumn.mapToFilterDisplay),
            ]);
            expect(mockSearchFacade.savePreviousSearch).toHaveBeenCalledWith({
                filters: [completeLine, completeDropdownLine, incompleteLine, requiredColumn, whitespaceLine],
                sort: component.sort,
                page: component.page,
            }); // save all search lines (including incomplete ones)
        }));
        it('should handle errors', fakeAsync(() => {
            const testSearchError = 'testSearchError';
            mockSearchFn.mockImplementationOnce(() => {
                expect(component.isLoading).toBeTruthy(); // should have loading overlay while searching
                return throwError(testSearchError);
            });
            expect(() => {
                component.search();
                flush();
            }).toThrowError(testSearchError);
            expect(component.isLoading).toBeFalsy(); // loading overlay should be removed
        }));

        describe.each`
            ignoreChanges | hasChanges | confirmResponse | shouldSearch
            ${true}       | ${true}    | ${true}         | ${true}
            ${true}       | ${true}    | ${false}        | ${true}
            ${true}       | ${false}   | ${true}         | ${true}
            ${true}       | ${false}   | ${false}        | ${true}
            ${false}      | ${true}    | ${true}         | ${true}
            ${false}      | ${true}    | ${false}        | ${false}
            ${false}      | ${false}   | ${true}         | ${true}
            ${false}      | ${false}   | ${false}        | ${true}
        `('unsavedChanges', ({ ignoreChanges, hasChanges, confirmResponse, shouldSearch }) => {
            it(`should ${
                shouldSearch ? '' : 'cancel the '
            }search if ignoreChanges=${ignoreChanges}, hasChanges=${hasChanges}, and confirmResponse=${confirmResponse}`, () => {
                mockSearchFn.mockReturnValueOnce(of({ content: [], totalElements: 0 }));
                jest.spyOn(window, 'confirm').mockReturnValueOnce(confirmResponse);
                component.gridForm = { dirty: hasChanges } as unknown as FormGroup;
                component.search(ignoreChanges);
                expect(component.searchFn).toHaveBeenCalledTimes(shouldSearch ? 1 : 0);
            });
        });
    });

    describe('save', () => {
        const gridColumns = {
            notDisplayed: Column.of({
                apiFieldPath: 'nd',
                name: 'notDisplayed',
                type: 'string',
                gridUpdatable: true,
            }),
            notUpdatable: Column.of({
                apiFieldPath: 'nu',
                name: 'notUpdatable',
                type: 'string',
                gridUpdatable: false,
            }),
            updatable1: Column.of({
                apiFieldPath: 'u1',
                name: 'updatable1',
                type: 'string',
                gridUpdatable: true,
            }),
            updatable2: Column.of({
                apiFieldPath: 'u2',
                name: 'updatable2',
                type: 'string',
                gridUpdatable: true,
            }),
            updatable3: Column.of({
                apiFieldPath: 'u3.code',
                name: 'updatable3 Code',
                type: 'string',
                gridUpdatable: true,
            }),
        };
        const buildRow = (valid: boolean, value: any, partialDirty = false) => {
            return { valid, value, get: (field: string) => ({ dirty: !partialDirty || field !== 'u2' }) };
        };
        const row0 = buildRow(true, { id: 'a0', nd: 'b0', nu: 'c0', u1: 'd0', u2: 'e0' }); // not selected
        const row1 = buildRow(false, { id: 'a1', nd: 'b1', nu: 'c1', u1: 'd1', u2: 'e1' }); // not valid
        const row2 = buildRow(true, {
            id: 'a2',
            nd: 'b2',
            nu: 'c2',
            u1: 'd2',
            u2: 'e2',
            u3: { id: 1, code: 'u3Test' },
        }); // updatable
        const row3 = buildRow(true, { id: 'a3', nd: 'b3', nu: 'c3', u1: 'd3', u2: 'e3', u3: null }, true); // partially dirty
        const testSaveForm = {
            get: () => ({ controls: [row0, row1, row2, row3] }),
            dirty: false,
        } as unknown as FormGroup;

        beforeEach(() => {
            component.columnsArray = Columns.toColumnArray(gridColumns);
            component.displayedColumns = [
                gridColumns.notUpdatable.name,
                gridColumns.updatable1.name,
                gridColumns.updatable2.name,
                gridColumns.updatable3.name,
            ]; // display all but 'notDisplayed'
            component.gridForm = testSaveForm;
            component.selection.select(1, 2, 3); // select last 3 rows
        });

        it('should save', fakeAsync(() => {
            jest.spyOn(component, 'search').mockImplementation();
            mockSaveFn.mockImplementationOnce((patches: EntityPatch<any>[]) => {
                expect(patches).toEqual([
                    {
                        id: row2.value.id,
                        updateValues: row2.value,
                        fields: [
                            gridColumns.updatable1.apiFieldPath,
                            gridColumns.updatable2.apiFieldPath,
                            gridColumns.updatable3.apiFieldPath.split('.')[0], // the root entity
                        ],
                    },
                    {
                        id: row3.value.id,
                        updateValues: row3.value,
                        fields: [
                            gridColumns.updatable1.apiFieldPath,
                            gridColumns.updatable3.apiFieldPath.split('.')[0], // the root entity
                        ],
                    },
                ]);
                expect(component.isLoading).toBeTruthy(); // should have loading overlay while saving
                return of(2);
            });
            component.save();
            flush();
            expect(mockSaveFn).toHaveBeenCalled();
            expect(component.search).toHaveBeenCalled();
            expect(component.isLoading).toBeTruthy();
        }));
        it('should handle errors', fakeAsync(() => {
            mockSaveFn.mockImplementationOnce(() => {
                expect(component.isLoading).toBeTruthy(); // should have loading overlay while saving
                return throwError('testSaveError');
            });
            component.save();
            flush();
            expect(component.isLoading).toBeFalsy(); // loading overlay should be removed
            expect(mockMessageFacade.addMessage).toHaveBeenCalledWith({
                severity: 'error',
                message: 'Failed to update selected item(s).',
                hasTimeout: true,
            });
        }));
    });

    describe('rowSelect', () => {
        it('should emit when the table has a rowSelect event', () => {
            jest.spyOn(component.rowSelect, 'emit');
            const row = { id: 4 };
            fixture.debugElement.query(By.directive(MockTableComponent)).triggerEventHandler('rowSelect', row);
            expect(component.rowSelect.emit).toHaveBeenCalledWith(row);
        });
    });

    describe('clear', () => {
        it('should clear search data', () => {
            component.selection.select(1);
            component.content = [1, 2, 3];
            component.totalElements = 3;
            jest.spyOn(component.searchFilter, 'open');
            component.searchChips = [new SearchChip(new SearchLine(integerColumn, Comparators.equalTo, 4))];
            component.clear();
            expect(component.selection.isEmpty()).toBeTruthy();
            expect(component.content).toEqual([]);
            expect(component.totalElements).toEqual(0);
            expect(component.searchFilter.open).toHaveBeenCalled();
            expect(component.searchChips).toEqual([]);
        });
    });
});
