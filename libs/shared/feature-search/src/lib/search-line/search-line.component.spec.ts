import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SearchLine } from '@vioc-angular/shared/common-api-models';
// tslint:disable-next-line: nx-enforce-module-boundaries
import {
    FeatureDropdownColumnMockModule,
    MockDropdownColumnComponent,
} from '@vioc-angular/shared/feature-dropdown-column';
import { UiDateRangeInputMockModule } from '@vioc-angular/shared/ui-date-range-input';
import { UiFilteredInputModule } from '@vioc-angular/shared/ui-filtered-input';
import { Column, ColumnType, Comparator, Comparators, SimpleDropdownColumn } from '@vioc-angular/shared/util-column';
import { TypedFormGroup, UtilFormModule } from '@vioc-angular/shared/util-form';
import { SearchLineComponent } from './search-line.component';

describe('SearchLineComponent', () => {
    let component: SearchLineComponent;
    let fixture: ComponentFixture<SearchLineComponent>;
    let formBuilder: FormBuilder;

    const basicColumn: Column = Column.of({
        name: 'Test Column',
        apiFieldPath: 'test',
        type: 'string',
    });

    const entityColumn: Column = Column.of({
        name: 'Entity Column',
        apiFieldPath: 'entity',
        type: { entityType: 'testEntity' },
    });

    const customTypeColumn: Column = Column.of({
        name: 'Test Column',
        apiFieldPath: 'test',
        type: { customType: 'testCustomType', inputType: 'integer' },
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                MatAutocompleteModule,
                UiFilteredInputModule,
                MatDatepickerModule,
                MatFormFieldModule,
                MatInputModule,
                MatNativeDateModule,
                MatSelectModule,
                ReactiveFormsModule,
                NoopAnimationsModule,
                UtilFormModule,
                FeatureDropdownColumnMockModule,
                UiDateRangeInputMockModule,
            ],
            declarations: [SearchLineComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SearchLineComponent);
        formBuilder = TestBed.inject(FormBuilder);
        component = fixture.componentInstance;
        component.searchLineForm = new TypedFormGroup<SearchLine>(formBuilder.group(new SearchLine()));
        component.searchableColumns = [basicColumn, entityColumn];
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should sort the searchable columns by name', () => {
        component.searchableColumns = [
            Column.of({ ...basicColumn, name: 'C' }),
            Column.of({ ...basicColumn, name: 'A' }),
            Column.of({ ...basicColumn, name: 'B' }),
        ];
        expect(component.searchableColumns[0].name).toEqual('A');
        expect(component.searchableColumns[1].name).toEqual('B');
        expect(component.searchableColumns[2].name).toEqual('C');
    });

    describe('ngOnInit', () => {
        describe('previous search / default value handling', () => {
            it('should clear the column and comparator if an invalid column is set', () => {
                const inputColumn = Column.of({ ...basicColumn, name: 'a' });
                const searchableColumns = [Column.of({ ...basicColumn, name: 'b' })];
                const comparator = Comparators.equalTo;

                component.searchLineForm.setControlValue('column', inputColumn);
                component.searchLineForm.setControlValue('comparator', comparator);
                component.searchableColumns = searchableColumns;

                component.ngOnInit();

                // data should be cleared out now since the input column was not available in the list of searchable columns
                expect(component.searchLineForm.getControlValue('column')).toBeNull();
                expect(component.searchLineForm.getControlValue('comparator')).toBeNull();
            });

            it('should ignore the comparator if the column is valid but the comparator is not', () => {
                const column = Column.of({ ...basicColumn, name: 'a' });
                const searchableColumns = [column];
                const comparator = Comparators.endsWith;

                component.searchLineForm.setControlValue('column', column);
                component.searchLineForm.setControlValue('comparator', comparator);
                component.searchableColumns = searchableColumns;
                jest.spyOn(component as any, 'buildComparators').mockReturnValue([Comparators.notEqualTo]);

                component.ngOnInit();

                // Column should be present (since valid) but comparator should not should not be the invalid value that is passed.  Instead,
                // it should be the default value that is based on the available comparators.
                expect(component.searchLineForm.getControlValue('column')).toEqual(column);
                expect(component.searchLineForm.getControlValue('comparator')).toEqual(Comparators.notEqualTo);
            });

            it('should accept valid column and comparator', () => {
                const column = Column.of({ ...basicColumn, name: 'a' });
                const searchableColumns = [column];
                const comparator = Comparators.endsWith;

                component.searchLineForm.setControlValue('column', column);
                component.searchLineForm.setControlValue('comparator', comparator);
                component.searchableColumns = searchableColumns;
                jest.spyOn(component as any, 'buildComparators').mockReturnValue([
                    Comparators.notEqualTo,
                    Comparators.endsWith,
                ]);

                component.ngOnInit();

                // Since both column and comparator are available, both should be set
                expect(component.searchLineForm.getControlValue('column')).toEqual(column);
                expect(component.searchLineForm.getControlValue('comparator')).toEqual(Comparators.endsWith);
            });
        });

        it('should set the searchLine required validators if the column has a value and is required', () => {
            const column = Column.of({ ...basicColumn, searchable: { required: true } });
            component.searchableColumns = [column];
            component.searchLineForm.setControlValue('column', column);

            component.ngOnInit();

            expect(component.searchLineForm.get('column').validator.name).toEqual(Validators.required.name);
            expect(component.searchLineForm.get('column').disabled).toEqual(true);
            expect(component.searchLineForm.get('comparator').validator.name).toEqual(Validators.required.name);
            expect(component.searchLineForm.get('value').validator.name).toEqual(Validators.required.name);
        });

        it('should mark the column as unTouched if there are comparators and the comparator does not have a value', () => {
            component.searchLineForm.get('column').setValue(Column.of({ ...basicColumn }));
            jest.spyOn(component as any, 'configureDefaultValues');
            jest.spyOn(component.searchLineForm.get('column'), 'markAsUntouched');

            component.ngOnInit();

            expect(component['configureDefaultValues']).toHaveBeenCalled();
            expect(component.searchLineForm.get('column').markAsUntouched).toHaveBeenCalled();
        });

        it('should not mark the column as unTouched if there are no comparators', () => {
            jest.spyOn(component.searchLineForm.get('column'), 'markAsUntouched');

            component.ngOnInit();

            expect(component.searchLineForm.get('column').markAsUntouched).not.toHaveBeenCalled();
        });

        it('should not mark the column as unTouched if there are comparators but the comparator has a value', () => {
            component.searchLineForm.get('column').setValue(Column.of({ ...basicColumn }));
            component.searchLineForm.get('comparator').setValue(Comparators.equalTo);
            jest.spyOn(component.searchLineForm.get('column'), 'markAsUntouched');

            component.ngOnInit();

            expect(component.searchLineForm.get('column').markAsUntouched).not.toHaveBeenCalled();
        });

        it('should set the comparator value if the column has a defaultSearch=true', () => {
            const column = Column.of({
                ...basicColumn,
                searchable: { defaultSearch: true },
                comparators: [Comparators.greaterThanOrEqual, Comparators.equalTo],
            });
            component.searchLineForm.setControlValue('column', column);
            component.searchableColumns = [column];

            component.ngOnInit();

            expect(component.searchLineForm.get('comparator').value).toEqual(Comparators.greaterThanOrEqual);
        });

        it('should set the comparator value if the column has a defaultSearch with a valid comparator', () => {
            const column = Column.of({
                ...basicColumn,
                searchable: { defaultSearch: { comparator: Comparators.equalTo, value: 'TEST' } },
                comparators: [Comparators.startsWith, Comparators.equalTo],
            });
            component.searchLineForm.setControlValue('column', column);
            component.searchableColumns = [column];

            component.ngOnInit();

            expect(component.searchLineForm.get('comparator').value).toEqual(Comparators.equalTo);
            expect(component.searchLineForm.get('value').value).toEqual('TEST');
        });

        it('should throw and error if the comparators does not have the searched by default value', () => {
            const column = Column.of({
                ...basicColumn,
                searchable: { defaultSearch: { comparator: Comparators.after } },
            });
            component.searchableColumns = [column];
            component.searchLineForm.setControlValue('column', column);

            expect(() => component.ngOnInit()).toThrowError(
                `Column: ${JSON.stringify(
                    component.searchLineForm.get('column').value
                )} assigned an unsupported comparator`
            );
        });
        it('should set the comparator value if the column has a defaultSearch with a invalid comparator', () => {
            const column = Column.of({
                ...basicColumn,
                searchable: { defaultSearch: { comparator: Comparators.equalTo } },
                comparators: [Comparators.startsWith],
            });
            component.searchLineForm.setControlValue('column', column);
            component.searchableColumns = [column];

            expect(() => component.ngOnInit()).toThrowError(
                `Column: ${JSON.stringify(
                    component.searchLineForm.get('column').value
                )} assigned an unsupported comparator`
            );
        });

        it('should set a default comparator if the first comparator of comparators requires data', () => {
            component.searchLineForm.get('column').setValue(Column.of({ ...basicColumn }));

            component.ngOnInit();

            expect(component.searchLineForm.get('comparator').value).toEqual(component.comparators[0]);
        });

        it('should set inputType', () => {
            component.searchLineForm.get('column').setValue(Column.of({ ...basicColumn }));
            jest.spyOn(component, 'determineInputType').mockReturnValue('text');

            component.ngOnInit();

            expect(component.determineInputType).toHaveBeenCalled();
            expect(component.inputType).toEqual('text');
        });
    });

    describe('buildComparators', () => {
        it('should throw an error if trying to build comparators without a column', () => {
            expect(() => component['buildComparators']()).toThrowError('Column must be selected to build comparators!');
        });

        it('should return a list of comparators for the column', () => {
            component.searchLineForm.get('column').setValue(Column.of({ ...basicColumn }));

            expect(component['buildComparators']()).toEqual(
                Comparators.for(component.searchLineForm.get('column').value)
            );
        });
    });

    describe('columnSelect', () => {
        let searchableColumn: Column;
        beforeEach(() => {
            searchableColumn = Column.of(basicColumn);
            component.searchableColumns = [searchableColumn];
        });

        it('should be called when the column value is changed', fakeAsync(() => {
            jest.spyOn(component as any, 'columnSelect');

            component.ngOnInit();
            component.searchLineForm.get('column').setValue(searchableColumn);
            flush();

            expect(component['columnSelect']).toHaveBeenCalled();
        }));

        it('should rebuild the list of comparators if the column value exists', () => {
            component.searchLineForm.get('column').setValue(searchableColumn);
            jest.spyOn(component as any, 'buildComparators');

            component['columnSelect']();

            expect(component['buildComparators']).toHaveBeenCalled();
        });

        it('should set the comparator value', () => {
            component.searchLineForm.get('column').setValue(searchableColumn);
            jest.spyOn(component.searchLineForm.get('comparator'), 'markAsUntouched');

            component['columnSelect']();

            expect(component.searchLineForm.get('comparator').value).toEqual(component.comparators[0]);
            expect(component.searchLineForm.get('comparator').markAsUntouched).toHaveBeenCalled();
        });

        it('should set the searchLine value', () => {
            component.searchLineForm.get('column').setValue(searchableColumn);
            jest.spyOn(component.searchLineForm.get('value'), 'markAsUntouched');

            component['columnSelect']();

            expect(component.searchLineForm.get('value').value).toEqual(null);
            expect(component.searchLineForm.get('value').markAsUntouched).toHaveBeenCalled();
        });

        it('should set the inputType', () => {
            component.searchLineForm.get('column').setValue(searchableColumn);
            jest.spyOn(component, 'determineInputType').mockReturnValue('text');

            component['columnSelect']();

            expect(component.determineInputType).toHaveBeenCalled();
            expect(component.inputType).toEqual('text');
        });
    });

    describe('comparatorSelect', () => {
        it('should be called when the comparator value is changed', fakeAsync(() => {
            jest.spyOn(component, 'comparatorSelect');
            component.searchLineForm.get('column').setValue(Column.of({ ...basicColumn }));

            component.ngOnInit();
            component.searchLineForm.get('comparator').setValue(Comparators.blank);
            flush();

            expect(component.comparatorSelect).toHaveBeenCalled();
        }));

        it('should default to first comparator if column exists', fakeAsync(() => {
            component.searchLineForm.get('column').setValue(Column.of({ ...basicColumn }));

            component.ngOnInit();
            flush();

            expect(component.searchLineForm.get('comparator').value).toEqual(Comparators.startsWith);
        }));

        it('should not select any comparator if column is empty', fakeAsync(() => {
            component.ngOnInit();
            flush();

            expect(component.searchLineForm.get('comparator').value).toBeFalsy();
        }));

        it('should update the searchLine value if the comparator does not require data', fakeAsync(() => {
            component.ngOnInit();
            component.searchLineForm.get('comparator').setValue(Comparators.blank);
            flush();

            expect(component.searchLineForm.get('value').value).toEqual(null);
        }));

        describe.each`
            initialComparator       | newComparator             | initialValue                    | expectedValue
            ${Comparators.equalTo}  | ${Comparators.notEqualTo} | ${null}                         | ${null}
            ${Comparators.equalTo}  | ${Comparators.notEqualTo} | ${'test'}                       | ${'test'}
            ${Comparators.equalTo}  | ${Comparators.blank}      | ${'test'}                       | ${null}
            ${Comparators.notBlank} | ${Comparators.blank}      | ${null}                         | ${null}
            ${Comparators.after}    | ${Comparators.before}     | ${null}                         | ${null}
            ${Comparators.after}    | ${Comparators.before}     | ${'2020-11-16'}                 | ${'2020-11-16'}
            ${Comparators.after}    | ${Comparators.between}    | ${'2020-11-16'}                 | ${null}
            ${Comparators.between}  | ${Comparators.notBetween} | ${null}                         | ${null}
            ${Comparators.between}  | ${Comparators.notBetween} | ${['2020-11-10', '2020-11-16']} | ${['2020-11-10', '2020-11-16']}
            ${Comparators.between}  | ${Comparators.after}      | ${['2020-11-10', '2020-11-16']} | ${null}
        `('changing comparators', ({ initialComparator, newComparator, initialValue, expectedValue }) => {
            it(`should update value to ${expectedValue} when selecting ${newComparator} and initialValue=${initialValue} and initialComparator=${initialComparator}`, fakeAsync(() => {
                component.ngOnInit();
                component.searchLineForm.setControlValue('column', basicColumn);
                component.searchLineForm.setControlValue('comparator', initialComparator);
                component.searchLineForm.setControlValue('value', initialValue);
                flush();

                component.searchLineForm.setControlValue('comparator', newComparator);
                flush();

                expect(component.searchLineForm.get('value').value).toEqual(expectedValue);
            }));
        });
    });

    describe('isDropdown', () => {
        it('should return true if the column has a value and the column is a dropdown', () => {
            component.searchLineForm
                .get('column')
                .setValue(SimpleDropdownColumn.of({ ...basicColumn, values: [1, 2] }));
            expect(component.isDropdown).toEqual(true);
        });

        it('should return false if the column does not have a value', () => {
            expect(component.isDropdown).toEqual(false);
        });

        it('should return false if the column has a value, but is not a dropdown', () => {
            component.searchLineForm.get('column').setValue(Column.of({ ...basicColumn }));
            expect(component.isDropdown).toEqual(false);
        });
    });

    describe('requiresData', () => {
        it('should return true of the comparator has a value and requires data', () => {
            component.searchLineForm.get('comparator').setValue(Comparators.equalTo);
            expect(component.requiresData).toEqual(true);
        });

        it('should return false if the comparator does not have a value', () => {
            expect(component.requiresData).toEqual(false);
        });

        it('should return false if the comparator has a value, but requires data', () => {
            component.searchLineForm.get('comparator').setValue(Comparators.blank);
            expect(component.requiresData).toEqual(false);
        });
    });

    // TODO: this would be a good one to make an it.each for
    describe('determineInputType', () => {
        it('should return select-dropdown if the column is a dropdown and the comparator allows multiple values', () => {
            component.searchLineForm
                .get('column')
                .setValue(SimpleDropdownColumn.of({ ...basicColumn, values: [1, 2] }));
            component.searchLineForm.get('comparator').setValue(Comparators.in);
            expect(component.determineInputType()).toEqual('select-dropdown');
        });

        it('should return select-dropdown if the column is a dropdown', () => {
            component.searchLineForm
                .get('column')
                .setValue(SimpleDropdownColumn.of({ ...basicColumn, values: [1, 2] }));
            component.searchLineForm.get('comparator').setValue(Comparators.equalTo);
            expect(component.determineInputType()).toEqual('select-dropdown');
        });

        it('should return number if the column type is decimal', () => {
            component.searchLineForm.get('column').setValue(Column.of({ ...basicColumn, type: 'decimal' }));
            expect(component.determineInputType()).toEqual('number');
        });

        it('should return number if the column type is integer', () => {
            component.searchLineForm.get('column').setValue(Column.of({ ...basicColumn, type: 'integer' }));
            expect(component.determineInputType()).toEqual('number');
        });

        it('should return date if the column type is date', () => {
            component.searchLineForm.get('column').setValue(Column.of({ ...basicColumn, type: 'date' }));
            expect(component.determineInputType()).toEqual('date');
        });

        it('should return date if the column type is dateTime', () => {
            component.searchLineForm.get('column').setValue(Column.of({ ...basicColumn, type: 'dateTime' }));
            expect(component.determineInputType()).toEqual('date');
        });

        it('should return text if the column type is string', () => {
            component.searchLineForm.get('column').setValue(Column.of({ ...basicColumn, type: 'string' }));
            expect(component.determineInputType()).toEqual('text');
        });

        it('should return boolean if column type is boolean', () => {
            component.searchLineForm.get('column').setValue(Column.of({ ...basicColumn, type: 'boolean' }));
            expect(component.determineInputType()).toEqual('boolean');
        });

        it('should return text as a default for unsupported types', () => {
            component.searchLineForm.get('column').setValue(Column.of({ ...entityColumn }));
            jest.spyOn(component['logger'], 'warn');

            expect(component.determineInputType()).toEqual('text');
            expect(component['logger'].warn).toHaveBeenCalledWith(
                'Unsupported input type in',
                component.searchLineForm.get('column').value
            );
        });

        it('should return undefined if no column is present', () => {
            component.searchLineForm.get('column').setValue(undefined);
            expect(component.determineInputType()).toEqual(undefined);
        });

        it('should return the correct inputType if the column type is a customType', () => {
            component.searchLineForm.get('column').setValue(Column.of({ ...customTypeColumn }));
            expect(component.determineInputType()).toEqual('number');
        });
    });

    describe('data entry', () => {
        const triggerSearchLine = (comparator?: Comparator) => {
            component.ngOnInit();
            flush();
            fixture.detectChanges();

            if (comparator) {
                component.searchLineForm.setControlValue('comparator', comparator);
            } else {
                component.searchLineForm.setControlValue('comparator', Comparators.equalTo);
            }
            flush();
        };

        const loadAndExpectInput = (columnType: ColumnType, inputClass: string) => {
            const column = Column.of({ ...basicColumn, type: columnType });
            component.searchLineForm.setControlValue('column', column);
            component.searchableColumns = [column];

            triggerSearchLine();

            expect(fixture.debugElement.query(By.css(inputClass))).toBeTruthy();
        };

        const expectValueDropdown = (): void => {
            const dropdown = fixture.debugElement.query(By.css('vioc-angular-dropdown-column'));
            expect(dropdown).toBeTruthy();
            // Should allow a "no selection option"
            expect(dropdown.injector.get(MockDropdownColumnComponent).noSelectionOption).toBeTruthy();
        };

        it('should load a date picker when the column type is date', fakeAsync(() => {
            loadAndExpectInput('date', `.date-input`);
            expect(fixture.debugElement.query(By.css('mat-datepicker'))).toBeTruthy();
        }));

        it('should load an input when the column type is integer', fakeAsync(() => {
            loadAndExpectInput('integer', '.number-input');
        }));

        it('should load an input when the column type is decimal', fakeAsync(() => {
            loadAndExpectInput('decimal', '.number-input');
        }));

        it('should load an input when the column type is string', fakeAsync(() => {
            loadAndExpectInput('string', '.text-input');
        }));

        it('should load a dropdown when the column type is dropdown supporting a single value', fakeAsync(() => {
            const column = SimpleDropdownColumn.of({ ...basicColumn, values: [1, 2] });
            component.searchLineForm.setControlValue('column', column);
            component.searchableColumns = [column];

            triggerSearchLine(Comparators.equalTo);

            expectValueDropdown();
        }));

        it('should load a dropdown when the column type is a dropdown and comparator supports multiple values', fakeAsync(() => {
            const column = SimpleDropdownColumn.of({ ...basicColumn, values: [1, 2] });
            component.searchLineForm.setControlValue('column', column);
            component.searchableColumns = [column];

            triggerSearchLine(Comparators.in);

            expectValueDropdown();
        }));
    });

    describe.each`
        columnType    | comparator                | expectation
        ${null}       | ${null}                   | ${false}
        ${null}       | ${Comparators.equalTo}    | ${false}
        ${null}       | ${Comparators.between}    | ${false}
        ${null}       | ${Comparators.notBetween} | ${false}
        ${'string'}   | ${null}                   | ${false}
        ${'string'}   | ${Comparators.equalTo}    | ${false}
        ${'string'}   | ${Comparators.between}    | ${false}
        ${'string'}   | ${Comparators.notBetween} | ${false}
        ${'date'}     | ${null}                   | ${false}
        ${'date'}     | ${Comparators.equalTo}    | ${false}
        ${'date'}     | ${Comparators.between}    | ${true}
        ${'date'}     | ${Comparators.notBetween} | ${true}
        ${'dateTime'} | ${null}                   | ${false}
        ${'dateTime'} | ${Comparators.equalTo}    | ${false}
        ${'dateTime'} | ${Comparators.between}    | ${true}
        ${'dateTime'} | ${Comparators.notBetween} | ${true}
    `('isDateRange', ({ columnType, comparator, expectation }) => {
        it(`should be ${expectation} for a column type of ${columnType} and comparator ${comparator?.value}`, () => {
            component.searchLineForm.setControlValue('column', Column.of({ ...basicColumn, type: columnType }));
            component.searchLineForm.setControlValue('comparator', comparator);
            expect(component.isDateRange).toEqual(expectation);
        });
    });
});
