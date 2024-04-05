import { Component, DebugElement, TemplateRef, ViewChild } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatMomentDateModule, MomentDateModule } from '@angular/material-moment-adapter';
import { MatDatepicker, MatDatepickerModule, MatDatepickerToggle } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInput, MatInputModule } from '@angular/material/input';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
    CommonFunctionalityModule,
    DecimalPlacesDirective,
    Described,
} from '@vioc-angular/shared/common-functionality';
// TODO: 05/21/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
// tslint:disable-next-line: nx-enforce-module-boundaries
import {
    FeatureDropdownColumnMockModule,
    MockDropdownColumnComponent,
} from '@vioc-angular/shared/feature-dropdown-column';
import { MockAddRemoveButtonComponent, UiAddRemoveButtonMockModule } from '@vioc-angular/shared/ui-add-remove-button';
import { UiCurrencyPrefixModule } from '@vioc-angular/shared/ui-currency-prefix';
import {
    Column,
    ColumnGroup,
    Columns,
    DynamicDropdownColumn,
    dynamicStringDropdown,
    instanceOfColumnGroup,
    MockSearchService,
    SimpleDropdownColumn,
    simpleObjectDropdown,
} from '@vioc-angular/shared/util-column';
import { TypedFormGroup, UtilFormMockModule } from '@vioc-angular/shared/util-form';
import * as moment from 'moment';
import { Moment } from 'moment';
import { MassUpdateComponent } from './mass-update.component';

describe('MassUpdateComponent', () => {
    describe('with no template', () => {
        let component: MassUpdateComponent;
        let fixture: ComponentFixture<MassUpdateComponent>;
        let inputForm: TypedFormGroup<TestModel>;

        class TestModel {
            integer: number = undefined;
            decimal: number = undefined;
            date: string = undefined;
            startDate: string = undefined;
            endDate: string = undefined;
            string: string = undefined;
            boolean: boolean = undefined;
            simpleObject: Described = undefined;
            dynamicString: string = undefined;
        }

        const columns: Columns = {
            integer: { name: 'Integer', apiFieldPath: 'integer', type: 'integer' },
            decimal: { name: 'Decimal', apiFieldPath: 'decimal', type: 'decimal' },
            date: { name: 'Date', apiFieldPath: 'date', type: 'date' },
            string: { name: 'String', apiFieldPath: 'string', type: 'string' },
            boolean: { name: 'Boolean', apiFieldPath: 'boolean', type: 'boolean' },
            simpleObjectDropdown,
            dynamicStringDropdown,
        };

        function initializeForm() {
            // Create form
            const formBuilder = TestBed.inject(FormBuilder);
            inputForm = TypedFormGroup.create<TestModel>(formBuilder.group(new TestModel()));
            component.updatableFieldForm = inputForm;
            component.columns = columns;
            fixture.detectChanges();
        }

        beforeEach(async () => {
            await TestBed.configureTestingModule({
                imports: [
                    MatDatepickerModule,
                    MatFormFieldModule,
                    MatSelectModule,
                    MatInputModule,
                    ReactiveFormsModule,
                    NoopAnimationsModule,
                    FeatureDropdownColumnMockModule,
                    UiCurrencyPrefixModule,
                    UiAddRemoveButtonMockModule,
                    UtilFormMockModule,
                    CommonFunctionalityModule,
                    MomentDateModule,
                    MatMomentDateModule,
                ],
                declarations: [MassUpdateComponent],
            }).compileComponents();
        });

        beforeEach(() => {
            fixture = TestBed.createComponent(MassUpdateComponent);
            component = fixture.componentInstance;
        });

        const selectFieldColumn = (field: string) => {
            // select a field for the last added dropdown
            const selectedFieldIndex = component.updatableFields.length - 1;
            const fieldColumnSelect = fixture.debugElement.query(By.css(`#field-select-${selectedFieldIndex}`));
            fieldColumnSelect.nativeElement.click();
            fixture.detectChanges();
            // select the option at the provided index
            const options = fieldColumnSelect.queryAll(By.css('mat-option'));
            options.find((o) => o.nativeElement.textContent.trim() === field).nativeElement.click();
            fixture.detectChanges();
        };

        const clickAddRemoveFieldButton = (index: number, action: 'add' | 'remove', isNested = false) => {
            let addRemoveButton: MockAddRemoveButtonComponent;
            const styleId = isNested ? `#nested-add-remove-button-${index}` : `#add-remove-button-${index}`;
            // clicks the adds or removed button for the field at the given index
            addRemoveButton = fixture.debugElement.query(By.css(styleId)).componentInstance;
            if (action === 'add') {
                addRemoveButton.addItem.emit();
            } else {
                addRemoveButton.removeItem.emit();
            }
            fixture.detectChanges();
        };

        const initializeFieldType = (fieldType: string) => {
            initializeForm();
            const columnArray = Columns.toColumnArray(columns);
            const columnIndex = columnArray.findIndex((c) => fieldType !== 'group' && c.type === fieldType);
            expect(columnIndex).not.toEqual(-1);
            selectFieldColumn(columnArray[columnIndex].name);
            fixture.detectChanges();
            return inputForm.get(columnArray[columnIndex].apiFieldPath) as FormControl;
        };

        const addRequiredError = (formControl: FormControl) => {
            formControl.setValidators(Validators.required);
            formControl.setValue(undefined);
            formControl.updateValueAndValidity();
            formControl.markAsTouched();
            fixture.detectChanges();
        };

        const verifyFormErrorDisplay = (formControl: FormControl) => {
            addRequiredError(formControl);
            const error = fixture.debugElement.query(By.css('mat-error'));
            expect(error).toBeTruthy();
            expect(error.nativeElement.textContent.trim()).toEqual(JSON.stringify(formControl.errors));
        };

        const nonRequiredPlaceholder = 'Leave blank to clear value';
        const requiredPlaceholder = 'Please enter a value';

        const verifyInputPlaceHolder = (formControl: FormControl) => {
            const input = fixture.debugElement.query(By.directive(MatInput)).injector.get<MatInput>(MatInput);
            expect(input.placeholder).toEqual(nonRequiredPlaceholder);
            addRequiredError(formControl);
            expect(input.placeholder).toEqual(requiredPlaceholder);
        };

        const verifyDropdownPlaceholder = (formControl: FormControl) => {
            const dropdown = fixture.debugElement.queryAll(By.directive(MatSelect))[1].componentInstance as MatSelect; // take second to skip field dropdown
            expect(dropdown.placeholder).toEqual(nonRequiredPlaceholder);
            addRequiredError(formControl);
            expect(dropdown.placeholder).toEqual(requiredPlaceholder);
        };

        const verifyViocDropdownPlaceholder = (formControl: FormControl) => {
            const dropdown = fixture.debugElement.query(By.directive(MockDropdownColumnComponent))
                .componentInstance as MockDropdownColumnComponent;
            expect(dropdown.placeholder).toEqual(nonRequiredPlaceholder);
            addRequiredError(formControl);
            expect(dropdown.placeholder).toEqual(requiredPlaceholder);
        };

        it('should create', () => {
            expect(component).toBeTruthy();
        });

        describe('column sorting', () => {
            const sortableColumns: Columns = {
                a: Column.of({ name: 'a', apiFieldPath: 'a', type: 'string' }),
                c: {
                    name: 'c',
                    columns: {
                        d: Column.of({ name: 'd', apiFieldPath: 'd', type: 'string' }),
                        f: Column.of({ name: 'f', apiFieldPath: 'f', type: 'string' }),
                        e: Column.of({ name: 'e', apiFieldPath: 'e', type: 'string' }),
                    },
                },
                b: Column.of({ name: 'b', apiFieldPath: 'b', type: 'string' }),
            };

            it('should sort ungrouped columns alphabetically', () => {
                component.columns = sortableColumns;
                const expectedOrder = [sortableColumns.a, sortableColumns.b, sortableColumns.c]; // a, b, c
                expect(component.updatableColumns).toEqual(expectedOrder);
            });
            it('should keep grouped columns in their defined order', () => {
                // grouped columns get autoselected, so have to build a form
                const model = { a: null, b: null, d: null, e: null, f: null };
                const formBuilder = TestBed.inject(FormBuilder);
                component.updatableFieldForm = TypedFormGroup.create<TestModel>(formBuilder.group(model));
                const testColumns = (sortableColumns.c as ColumnGroup).columns;
                component.grouped = true;
                component.columns = testColumns;
                const expectedOrder = [testColumns.d, testColumns.f, testColumns.e]; // d, f, e
                expect(component.updatableColumns).toEqual(expectedOrder);
            });
        });

        it('should allow you to add fields', () => {
            initializeForm();
            let updatableFieldsLength = component.updatableFields.length;

            component.updatableColumns.forEach((updatableColumn, index) => {
                selectFieldColumn(updatableColumn.name);
                if (instanceOfColumnGroup(updatableColumn)) {
                    Columns.toColumnArray(updatableColumn.columns).forEach((c) =>
                        expect(fixture.debugElement.query(By.css(`#${c.apiFieldPath}-input`))).toBeTruthy()
                    );
                } else {
                    expect(fixture.debugElement.query(By.css(`#${updatableColumn.apiFieldPath}-input`))).toBeTruthy();
                }
                if (index !== component.updatableColumns.length - 1) {
                    clickAddRemoveFieldButton(index, 'add');
                    updatableFieldsLength++;
                }
                expect(component.updatableFields.length).toBe(updatableFieldsLength);
            });
        });

        it('should disable a field after it is selected', () => {
            initializeForm();
            const fieldIndex = component.updatableColumns.findIndex(
                (c) => !instanceOfColumnGroup(c) && c.name === 'Boolean'
            );
            selectFieldColumn('Boolean');
            clickAddRemoveFieldButton(0, 'add');
            const fieldColumnSelect = fixture.debugElement.query(By.css(`#field-select-1`));
            fieldColumnSelect.nativeElement.click();
            fixture.detectChanges();
            const options = fieldColumnSelect.queryAll(By.css('mat-option'));
            expect(options[fieldIndex + 1].properties.enabled).toBeFalsy();
        });

        it('should throw an exception for unsupported types', () => {
            const unsupportedColumn = Column.of({ name: 'Bad', apiFieldPath: 'bad', type: { entityType: 'type' } });
            initializeForm();
            component.updatableFieldForm.addControl('bad', new FormControl());
            component.columns = { unsupportedColumn, ...columns };
            component.updatableFields[0].columnControl.setValue(unsupportedColumn);
            expect(() => component.columnSelect(0)).toThrow(
                new Error(`Unsupported input type in ${JSON.stringify(unsupportedColumn)}`)
            );
        });

        it('should reset fields once removed', () => {
            initializeForm();
            const integerOption = component.columns['integer'] as Column;
            const decimalOption = component.columns['decimal'] as Column;
            // select the first option in the dropdown
            selectFieldColumn(integerOption.name);
            expect(inputForm.get(integerOption.apiFieldPath).dirty).toBeTruthy();
            // change the selected option to the second option
            selectFieldColumn(decimalOption.name);
            expect(inputForm.get(integerOption.apiFieldPath).dirty).toBeFalsy();
            expect(inputForm.get(decimalOption.apiFieldPath).dirty).toBeTruthy();
            // add another field, then remove that field
            clickAddRemoveFieldButton(0, 'add');
            selectFieldColumn(integerOption.name); // select the first dropdown option
            expect(inputForm.get(integerOption.apiFieldPath).dirty).toBeTruthy();
            expect(inputForm.get(decimalOption.apiFieldPath).dirty).toBeTruthy();
            clickAddRemoveFieldButton(0, 'remove'); // remove the first field (currently selected second option)
            expect(inputForm.get(integerOption.apiFieldPath).dirty).toBeTruthy();
            expect(inputForm.get(decimalOption.apiFieldPath).dirty).toBeFalsy();
        });

        it('should reset fields once component is reset', () => {
            initializeForm();
            const integerOption = component.columns['integer'] as Column;
            // select the first option in the dropdown
            selectFieldColumn(integerOption.name);
            expect(inputForm.get(integerOption.apiFieldPath).dirty).toBeTruthy();
            // reset the component
            component.reset();
            fixture.detectChanges();
            expect(inputForm.get(integerOption.apiFieldPath).dirty).toBeFalsy();
            expect(component.updatableFields.length).toEqual(1);
        });

        it('should successfully check if column is selected', () => {
            initializeForm();
            const field = component.updatableColumns.find((c) => !instanceOfColumnGroup(c) && c.name === 'Boolean');
            // nothing selected, should return null
            expect(component.isSelected(field)).toEqual(false);
            // select integer column
            selectFieldColumn('Boolean');
            // check if integer column is selected
            expect(component.isSelected(field)).toEqual(true);
        });

        describe.each`
            nested   | id
            ${false} | ${'add-remove-button'}
            ${true}  | ${'nested-add-remove-button'}
        `('add remove buttons nested=$nested', ({ nested, id }) => {
            const getAddRemoveButtons = () => fixture.debugElement.queryAll(By.css(`[id^="${id}"`));

            const getFieldColumns = () => fixture.debugElement.queryAll(By.css('mat-select[id^="field-select"'));

            beforeEach(() => {
                initializeForm();
                component.nested = nested;
                fixture.detectChanges();
            });

            describe('add button', () => {
                it('should display when an option is selected', () => {
                    const integerOption = component.columns['integer'] as Column;
                    const addRemoveButtons = getAddRemoveButtons();
                    expect(addRemoveButtons.length).toEqual(1);
                    const addButton: MockAddRemoveButtonComponent = addRemoveButtons[0].componentInstance;
                    // nothing selected, should return null
                    expect(addButton.addButtonDisplayed).toBeFalsy();
                    // select options
                    selectFieldColumn(integerOption.name);
                    // check if remove button if being displayed again, should return true
                    expect(addButton.addButtonDisplayed).toBeTruthy();
                });

                it('should only display for the last field', () => {
                    const integerOption = component.columns['integer'] as Column;
                    const decimalOption = component.columns['decimal'] as Column;
                    selectFieldColumn(integerOption.name);
                    clickAddRemoveFieldButton(0, 'add', nested);
                    selectFieldColumn(decimalOption.name);
                    const addRemoveButtons = getAddRemoveButtons();
                    expect(addRemoveButtons.length).toEqual(2);
                    const firstAddRemoveButton: MockAddRemoveButtonComponent = addRemoveButtons[0].componentInstance;
                    expect(firstAddRemoveButton.addButtonDisplayed).toBeFalsy();
                    const secondAddRemoveButton: MockAddRemoveButtonComponent = addRemoveButtons[1].componentInstance;
                    expect(secondAddRemoveButton.addButtonDisplayed).toBeTruthy();
                });

                it('should not display if all fields are selected', () => {
                    component.updatableColumns.forEach((column, index) => {
                        selectFieldColumn(column.name);
                        if (instanceOfColumnGroup(column)) {
                            Columns.toColumnArray(column.columns).forEach((c) => {
                                expect(fixture.debugElement.query(By.css(`#${c.apiFieldPath}-input`))).toBeTruthy();
                            });
                        } else {
                            expect(fixture.debugElement.query(By.css(`#${column.apiFieldPath}-input`))).toBeTruthy();
                        }
                        if (index !== component.updatableColumns.length - 1) {
                            clickAddRemoveFieldButton(index, 'add', nested);
                        }
                    });
                    const addRemoveButtons = getAddRemoveButtons();
                    expect(addRemoveButtons.length).toEqual(Object.values(columns).length);
                    addRemoveButtons.forEach((addRemoveButton) => {
                        const addRemoveButtonComponent: MockAddRemoveButtonComponent =
                            addRemoveButton.componentInstance;
                        expect(addRemoveButtonComponent.addButtonDisplayed).toBeFalsy();
                    });
                });

                it('should add line when clicked', () => {
                    const integerOption = component.columns['integer'] as Column;
                    expect(getFieldColumns().length).toEqual(1);
                    selectFieldColumn(integerOption.name);
                    clickAddRemoveFieldButton(0, 'add', nested);
                    expect(getFieldColumns().length).toEqual(2);
                });
            });

            describe('remove button', () => {
                it('should display when there is more than one option', () => {
                    const integerOption = component.columns['integer'] as Column;
                    let addRemoveButtons = getAddRemoveButtons();
                    expect(addRemoveButtons.length).toEqual(1);
                    const removeButton: MockAddRemoveButtonComponent = addRemoveButtons[0].componentInstance;
                    expect(removeButton.removeButtonDisplayed).toBeFalsy();
                    selectFieldColumn(integerOption.name);
                    clickAddRemoveFieldButton(0, 'add', nested);
                    addRemoveButtons = getAddRemoveButtons();
                    expect(addRemoveButtons.length).toEqual(2);
                    addRemoveButtons.forEach((addRemoveButton) => {
                        const addRemoveButtonComponent: MockAddRemoveButtonComponent =
                            addRemoveButton.componentInstance;
                        expect(addRemoveButtonComponent.removeButtonDisplayed).toBeTruthy();
                    });
                });

                it('should remove line when clicked', () => {
                    const integerOption = component.columns['integer'] as Column;
                    const decimalOption = component.columns['decimal'] as Column;
                    selectFieldColumn(integerOption.name);
                    clickAddRemoveFieldButton(0, 'add', nested);
                    selectFieldColumn(decimalOption.name);
                    const secondFieldText = getFieldColumns()[1].nativeElement.textContent;
                    clickAddRemoveFieldButton(0, 'remove', nested);
                    const fieldColumns = getFieldColumns();
                    expect(fieldColumns.length).toEqual(1);
                    expect(fieldColumns[0].nativeElement.textContent).toEqual(secondFieldText);
                });
            });
        });

        describe('date input', () => {
            let dateFormControl: FormControl;

            beforeEach(() => {
                dateFormControl = initializeFieldType('date');
            });

            it('should display a datepicker to pick a date', fakeAsync(() => {
                // make sure datepicker and toggle exists
                const input = fixture.debugElement.query(By.css('.value-input'));
                const datePicker = fixture.debugElement.query(By.directive(MatDatepicker));
                expect(datePicker).toBeTruthy();
                expect(input).toBeTruthy();
                expect(fixture.debugElement.query(By.directive(MatDatepickerToggle))).toBeTruthy();
                // make sure datepicker is properly bound to input
                const datePickerComponent = datePicker.componentInstance as MatDatepicker<Moment>;
                datePickerComponent.select(moment('2000-01-01'));
                flush();
                expect(dateFormControl.value).toEqual(moment('2000-01-01'));
            }));

            it('should take input for date', () => {
                const input = fixture.debugElement.query(By.css('input'));
                expect(input).toBeTruthy();
                input.nativeElement.value = '1/1/2000';
                input.nativeElement.dispatchEvent(new Event('input'));
                expect(dateFormControl.value.toString()).toEqual(moment('2000-01-01').toString());
            });

            it('should display validation errors', () => {
                verifyFormErrorDisplay(dateFormControl);
            });

            it('should display proper placeholder messages', () => {
                verifyInputPlaceHolder(dateFormControl);
            });
        });

        describe('integer input', () => {
            let integerFormControl: FormControl;

            beforeEach(() => {
                integerFormControl = initializeFieldType('integer');
            });

            it('should take input for integer', () => {
                const input = fixture.debugElement.query(By.css('.value-input'));
                expect(input).toBeTruthy();
                expect(input.nativeElement.type).toEqual('number');
                input.nativeElement.value = 123;
                input.nativeElement.dispatchEvent(new Event('input'));
                expect(integerFormControl.value).toEqual(123);
            });

            it('should display validation errors', () => {
                verifyFormErrorDisplay(integerFormControl);
            });

            it('should display proper placeholder messages', () => {
                verifyInputPlaceHolder(integerFormControl);
            });
        });

        describe('decimal input', () => {
            let decimalFormControl: FormControl;

            beforeEach(() => {
                decimalFormControl = initializeFieldType('decimal');
            });

            it('should take input for decimal', () => {
                const input = fixture.debugElement.query(By.css('.value-input'));
                expect(input).toBeTruthy();
                expect(input.nativeElement.type).toEqual('text'); // should be text for decimal directive
                expect(fixture.debugElement.query(By.directive(DecimalPlacesDirective))).toBeTruthy();
                input.nativeElement.value = '123.45';
                input.nativeElement.dispatchEvent(new Event('input'));
                expect(decimalFormControl.value).toEqual(123.45);
            });

            it('should display validation errors', () => {
                verifyFormErrorDisplay(decimalFormControl);
            });

            it('should display proper placeholder messages', () => {
                verifyInputPlaceHolder(decimalFormControl);
            });
        });

        describe('boolean input', () => {
            let booleanFormControl: FormControl;

            beforeEach(() => {
                booleanFormControl = initializeFieldType('boolean');
            });

            const selectValue = (value: boolean) => {
                const booleanSelect = fixture.debugElement.query(By.css(`#boolean-input`));
                booleanSelect.nativeElement.click();
                fixture.detectChanges();

                const options = booleanSelect.queryAll(By.css('mat-option'));
                const htmlText = value ? 'Y' : 'N';
                options.find((option) => option.nativeElement.textContent === htmlText).nativeElement.click();
                fixture.detectChanges();
            };

            it('should take input for boolean', () => {
                selectValue(true);
                expect(booleanFormControl.value).toBe(true);

                selectValue(false);
                expect(booleanFormControl.value).toBe(false);
            });

            it('should display validation errors', () => {
                verifyFormErrorDisplay(booleanFormControl);
            });

            it('should display proper placeholder messages', () => {
                verifyDropdownPlaceholder(booleanFormControl);
            });
        });

        describe('string input', () => {
            let stringFormControl: FormControl;

            beforeEach(() => {
                stringFormControl = initializeFieldType('string');
            });

            it('should take input for string', () => {
                const input = fixture.debugElement.query(By.css('.value-input'));
                expect(input).toBeTruthy();
                expect(input.nativeElement.type).toEqual('text');
                input.nativeElement.value = 'test';
                input.nativeElement.dispatchEvent(new Event('input'));
                expect(stringFormControl.value).toEqual('test');
            });

            it('should display validation errors', () => {
                verifyFormErrorDisplay(stringFormControl);
            });

            it('should display proper placeholder messages', () => {
                verifyInputPlaceHolder(stringFormControl);
            });
        });

        describe('simple dropdown input', () => {
            let dropdownFormControl: FormControl;
            let dropdownColumn: DynamicDropdownColumn<any>;

            beforeEach(() => {
                initializeForm();
                const columnArray = Columns.toColumnArray(columns);
                const columnIndex = columnArray.findIndex((column) => column.name === simpleObjectDropdown.name);
                expect(columnIndex).not.toEqual(-1);
                selectFieldColumn(columnArray[columnIndex].name);
                fixture.detectChanges();
                dropdownFormControl = inputForm.get(columnArray[columnIndex].apiFieldPath) as FormControl;
                dropdownColumn = SimpleDropdownColumn.of(
                    columnArray[columnIndex] as SimpleDropdownColumn<any>
                ).convertToDynamicDropdownColumn();
            });

            it('should take input for simple dropdown', () => {
                const dropdown = fixture.debugElement.query(By.directive(MockDropdownColumnComponent));
                expect(dropdown).toBeTruthy();
                const dropdownComponent = dropdown.componentInstance as MockDropdownColumnComponent;
                expect(dropdownComponent.multiple).toBe(false);
                // need to stringify due to the functions defined in the dropdown
                expect(JSON.stringify(dropdownComponent.column)).toEqual(JSON.stringify(dropdownColumn));
                expect(dropdownComponent.placeholder).toEqual('Leave blank to clear value');
                let value;
                dropdownColumn.fetchData(undefined).subscribe((data) => {
                    value = data[0];
                    expect(value).toBeTruthy();
                    dropdownComponent.setValue(value);
                });
                expect(dropdownFormControl.value).toEqual(value);
            });

            it('should display validation errors', () => {
                verifyFormErrorDisplay(dropdownFormControl);
            });

            it('should display proper placeholder messages', () => {
                verifyViocDropdownPlaceholder(dropdownFormControl);
            });
        });

        describe('dynamic dropdown input', () => {
            let dropdownFormControl: FormControl;
            let dropdownColumn: DynamicDropdownColumn<any>;

            beforeEach(() => {
                initializeForm();
                const columnArray = Columns.toColumnArray(columns);
                const columnIndex = columnArray.findIndex((column) => column.name === dynamicStringDropdown.name);
                expect(columnIndex).not.toEqual(-1);
                selectFieldColumn(columnArray[columnIndex].name);
                fixture.detectChanges();
                dropdownFormControl = inputForm.get(columnArray[columnIndex].apiFieldPath) as FormControl;
                dropdownColumn = DynamicDropdownColumn.of(columnArray[columnIndex] as DynamicDropdownColumn<TestModel>);
            });

            it('should take input for dynamic dropdown', fakeAsync(() => {
                const dropdown = fixture.debugElement.query(By.directive(MockDropdownColumnComponent));
                expect(dropdown).toBeTruthy();
                const dropdownComponent = dropdown.componentInstance as MockDropdownColumnComponent;
                expect(dropdownComponent.multiple).toBe(false);
                // need to stringify due to the functions defined in the dropdown
                expect(JSON.stringify(dropdownComponent.column)).toEqual(
                    JSON.stringify({ ...dropdownColumn, isDropdown: true })
                );
                expect(dropdownComponent.placeholder).toEqual('Leave blank to clear value');
                let value;
                dropdownColumn.fetchData('AB').subscribe((data) => {
                    value = data[0];
                    expect(value).toBeTruthy();
                    dropdownComponent.setValue(value);
                });
                tick(MockSearchService.searchDelay);
                expect(dropdownFormControl.value).toEqual(value);
            }));

            it('should display validation errors', () => {
                verifyFormErrorDisplay(dropdownFormControl);
            });

            it('should display proper placeholder messages', () => {
                verifyViocDropdownPlaceholder(dropdownFormControl);
            });
        });

        describe('with grouped columns', () => {
            beforeEach(() => {
                initializeForm();
                component.columns = {
                    groupedColumns: {
                        name: 'Grouped Columns',
                        columns: {
                            startDate: { name: 'Start Date', apiFieldPath: 'startDate', type: 'date' },
                            endDate: { name: 'End Date', apiFieldPath: 'endDate', type: 'date' },
                        },
                    },
                    otherGroupedColumns: {
                        name: 'Other Grouped Columns',
                        columns: {
                            integer: { name: 'Integer', apiFieldPath: 'integer', type: 'integer' },
                            decimal: { name: 'Decimal', apiFieldPath: 'decimal', type: 'decimal' },
                        },
                    },
                };
                fixture.detectChanges();
            });

            it('should select add all grouped fields when group is selected', () => {
                expect(component.isSelected(component.updatableColumns[0])).toEqual(false);
                // select the grouped columns
                selectFieldColumn('Grouped Columns');

                // input type should be switch to group for the selected field
                expect(component.updatableFields[0].inputType).toEqual('group');

                const groupedMassUpdateElement: DebugElement = fixture.debugElement.query(
                    By.directive(MassUpdateComponent)
                );
                const groupedMassUpdate: MassUpdateComponent = groupedMassUpdateElement.componentInstance;

                // all of the inputs should be disabled
                groupedMassUpdate.updatableFields.forEach((f, i) => {
                    expect(groupedMassUpdateElement.query(By.css(`#field-${i}`)).nativeElement.disabled).toEqual(true);
                    // add/remove buttons should not be visible
                    expect(groupedMassUpdateElement.query(By.css(`#add-remove-button-${i}`))).toBeNull();
                    expect(groupedMassUpdateElement.query(By.css(`#nested-add-remove-button-${i}`))).toBeNull();
                });

                const endDate = groupedMassUpdate.updatableColumns[0];
                const startDate = groupedMassUpdate.updatableColumns[1];
                // all of the columns are selected
                expect(groupedMassUpdate.isSelected(endDate)).toEqual(true);
                expect(groupedMassUpdate.isSelected(startDate)).toEqual(true);
                expect(component.updatableFieldForm.get((endDate as Column).apiFieldPath).dirty).toEqual(true);
                expect(component.updatableFieldForm.get((startDate as Column).apiFieldPath).dirty).toEqual(true);
            });

            it('clear all grouped fields when group is removed', () => {
                // select the grouped columns
                selectFieldColumn('Grouped Columns');

                const groupedMassUpdate: MassUpdateComponent = fixture.debugElement.query(
                    By.directive(MassUpdateComponent)
                ).componentInstance;
                const endDate = groupedMassUpdate.updatableColumns[0];
                const startDate = groupedMassUpdate.updatableColumns[1];
                // all of the columns are selected
                expect(groupedMassUpdate.isSelected(endDate)).toEqual(true);
                expect(groupedMassUpdate.isSelected(startDate)).toEqual(true);
                expect(component.updatableFieldForm.get((endDate as Column).apiFieldPath).dirty).toEqual(true);
                expect(component.updatableFieldForm.get((startDate as Column).apiFieldPath).dirty).toEqual(true);

                // select the first field
                const fieldColumnSelect = fixture.debugElement.query(By.css('#field-select-0'));
                fieldColumnSelect.nativeElement.click();
                fixture.detectChanges();
                // clear the selected field
                fieldColumnSelect.queryAll(By.css('mat-option'))[0].nativeElement.click();
                fixture.detectChanges();

                // fields should be reset
                expect(component.updatableFieldForm.get((endDate as Column).apiFieldPath).dirty).toEqual(false);
                expect(component.updatableFieldForm.get((startDate as Column).apiFieldPath).dirty).toEqual(false);
            });

            it('should reset the updatableFields when the columns change', () => {
                // select the grouped columns
                selectFieldColumn('Grouped Columns');

                const groupedMassUpdate: MassUpdateComponent = fixture.debugElement.query(
                    By.directive(MassUpdateComponent)
                ).componentInstance;
                const endDate = groupedMassUpdate.updatableColumns[0];
                const startDate = groupedMassUpdate.updatableColumns[1];
                expect(groupedMassUpdate.isSelected(endDate)).toEqual(true);
                expect(groupedMassUpdate.isSelected(startDate)).toEqual(true);

                // // select the other grouped column
                selectFieldColumn('Other Grouped Columns');
                const integer = groupedMassUpdate.updatableColumns[0];
                const decimal = groupedMassUpdate.updatableColumns[1];
                expect(groupedMassUpdate.isSelected(integer)).toEqual(true);
                expect(groupedMassUpdate.isSelected(decimal)).toEqual(true);
            });
        });
    });

    describe('with template', () => {
        @Component({
            // tslint:disable-next-line: component-selector
            selector: 'template-mass-update',
            template: `
                <vioc-angular-mass-update [updatableFieldForm]="form" [columns]="columns" [templateMap]="templateMap">
                    <ng-template #nested>
                        <div id="template"> This is a nested template </div>
                    </ng-template>
                </vioc-angular-mass-update>
            `,
        })
        class TemplateMassUpdateComponent {
            @ViewChild('nested', { static: true }) set nested(nested: TemplateRef<any>) {
                this.templateMap = new Map().set('nested', nested);
            }

            form: FormGroup = new FormGroup({
                nested: new FormGroup({
                    something: new FormControl(''),
                    somethingElse: new FormControl(''),
                }),
            });

            columns: Column[] = [
                Column.of({ name: 'nested', apiFieldPath: 'nested', type: { entityType: 'something' } }),
            ];

            templateMap;
            constructor() {}
        }

        let component: TemplateMassUpdateComponent;
        let fixture: ComponentFixture<TemplateMassUpdateComponent>;

        beforeEach(async () => {
            await TestBed.configureTestingModule({
                imports: [
                    MatDatepickerModule,
                    MatFormFieldModule,
                    MatSelectModule,
                    MatInputModule,
                    ReactiveFormsModule,
                    NoopAnimationsModule,
                    FeatureDropdownColumnMockModule,
                    UiCurrencyPrefixModule,
                    UiAddRemoveButtonMockModule,
                    UtilFormMockModule,
                    CommonFunctionalityModule,
                ],
                declarations: [MassUpdateComponent, TemplateMassUpdateComponent],
            }).compileComponents();
        });

        beforeEach(() => {
            fixture = TestBed.createComponent(TemplateMassUpdateComponent);
            component = fixture.componentInstance;
        });

        it('should create', () => {
            expect(component).toBeTruthy();
        });

        it('should display passed template', () => {
            fixture.detectChanges();
            const fieldColumnSelect = fixture.debugElement.query(By.css('#field-select-0'));
            fieldColumnSelect.nativeElement.click();
            fixture.detectChanges();
            const options = fieldColumnSelect.queryAll(By.css('mat-option'));
            options[1].nativeElement.click();
            fixture.detectChanges();
            const templateOutput = fixture.debugElement.query(By.css('#template'));
            expect(templateOutput.nativeElement.textContent.trim()).toEqual('This is a nested template');
        });
    });
});
