import { Component, Input } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DecimalPlacesDirective } from '@vioc-angular/shared/common-functionality';
// TODO: 08/12/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
// tslint:disable-next-line: nx-enforce-module-boundaries
import { FeatureDropdownColumnMockModule } from '@vioc-angular/shared/feature-dropdown-column';
import { SUPPORTED_CURRENCIES } from '@vioc-angular/shared/ui-currency-prefix';
// TODO: 04/03/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
// tslint:disable-next-line: nx-enforce-module-boundaries
import {
    booleanColumn,
    Column,
    currencyColumn,
    dateColumn,
    decimalColumn,
    integerColumn,
    IsTypePipe,
    nestedEntityColumn,
    simpleStringDropdown,
    stringColumn,
    TableDisplayPipe,
} from '@vioc-angular/shared/util-column';
// TODO: 04/03/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
// tslint:disable-next-line: nx-enforce-module-boundaries
import { UtilFormModule } from '@vioc-angular/shared/util-form';
import { ArrowKeyDirection } from '../arrow-key-event';
import { GridCellComponent } from './grid-cell.component';

describe('GridCellComponent', () => {
    @Component({
        selector: 'vioc-angular-currency-prefix',
        template: '',
    })
    class MockCurrencyPrefixComponent {
        @Input() currency = SUPPORTED_CURRENCIES.USD;
    }

    let component: GridCellComponent;
    let fixture: ComponentFixture<GridCellComponent>;
    // Cell css matchers:
    const decimalCellInput = '.decimal-input';
    const dateCellInput = '.date-input';
    const integerCellInput = '.integer-input';
    const boolCellInput = '.boolean-input';
    const textCellInput = '.text-input';
    const dropdownCellInput = '.dropdown-input';
    const readOnlyText = '.read-only';

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                MatCheckboxModule,
                MatDatepickerModule,
                MatInputModule,
                MatNativeDateModule,
                MatSelectModule,
                NoopAnimationsModule,
                ReactiveFormsModule,
                UtilFormModule,
                FeatureDropdownColumnMockModule,
            ],
            declarations: [
                GridCellComponent,
                MockCurrencyPrefixComponent,
                IsTypePipe,
                TableDisplayPipe,
                DecimalPlacesDirective,
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GridCellComponent);
        component = fixture.componentInstance;
    });

    const initializeComponent = (entity: any = { id: 1 }, column = integerColumn) => {
        const fb = TestBed.inject(FormBuilder);
        component.row = fb.group(entity);
        component.column = column;
        component.columnIndex = 0;
        component.rowIndex = 0;
        fixture.detectChanges();
    };

    const findByCss = (css: string) => fixture.debugElement.query(By.css(css));

    it('should create', () => {
        initializeComponent();
        expect(component).toBeTruthy();
    });

    describe('renders the appropriate cell type', () => {
        const verifyExpectedElementExists = (matcher: string) => expect(findByCss(matcher)).not.toBeNull();

        it('should have a date input for date columns', () => {
            initializeComponent({ date: undefined }, dateColumn);
            verifyExpectedElementExists(dateCellInput);
        });
        it('should have a decimal input for decimal columns', () => {
            initializeComponent({ decimal: undefined }, decimalColumn);
            verifyExpectedElementExists(decimalCellInput);
        });
        it('should have a decimal input for currency columns', () => {
            initializeComponent({ currency: undefined }, currencyColumn);
            verifyExpectedElementExists(decimalCellInput);
        });
        it('should have an integer input for integer columns', () => {
            initializeComponent({ id: undefined }, integerColumn);
            verifyExpectedElementExists(integerCellInput);
        });
        it('should have a boolean input for boolean columns', () => {
            initializeComponent({ active: undefined }, booleanColumn);
            verifyExpectedElementExists(boolCellInput);
        });
        it('should have a text input for string columns', () => {
            initializeComponent({ name: undefined }, stringColumn);
            verifyExpectedElementExists(textCellInput);
        });
        it('should have a dropdown input for dropdown columns', () => {
            initializeComponent({ simpleString: undefined }, simpleStringDropdown);
            verifyExpectedElementExists(dropdownCellInput);
        });
        it('should display text for non-gridUpdatable columns', () => {
            initializeComponent({ id: undefined }, Column.of({ ...integerColumn, gridUpdatable: false }));
            verifyExpectedElementExists(readOnlyText);
        });

        describe('read-only column', () => {
            const verifyReadOnlyColumn = (expectedDisplayValue: string) => {
                const readOnlySpan = fixture.debugElement.query(By.css(readOnlyText));
                expect(readOnlySpan).not.toBeNull();
                expect(readOnlySpan.nativeElement.innerHTML.trim()).toEqual(expectedDisplayValue);
            };
            it('should handle booleans when field value is true', () => {
                const testColumn: Column = Column.of({
                    name: 'boolean',
                    type: 'boolean',
                    apiFieldPath: 'boolean',
                    gridUpdatable: false,
                });
                initializeComponent({ boolean: true }, testColumn);
                verifyReadOnlyColumn('Y');
            });
            it('should handle booleans when field value is false', () => {
                const testColumn: Column = Column.of({
                    name: 'boolean',
                    type: 'boolean',
                    apiFieldPath: 'boolean',
                    gridUpdatable: false,
                });
                initializeComponent({ boolean: false }, testColumn);
                verifyReadOnlyColumn('N');
            });
            it('should handle nested field values', () => {
                const expectedDisplayValue = 'TEST CATEGORY 1';
                const testObject = {
                    parent: {
                        child: {
                            category: { id: 1, desc: expectedDisplayValue },
                        },
                    },
                };
                initializeComponent(testObject, nestedEntityColumn);
                verifyReadOnlyColumn(expectedDisplayValue);
            });
        });
    });

    describe('currency prefix', () => {
        it('should show for currency column', () => {
            initializeComponent({ currency: undefined }, currencyColumn);
            const currencyComponent = fixture.debugElement.query(By.directive(MockCurrencyPrefixComponent));
            expect(currencyComponent).toBeTruthy();
        });
        it('should not show for decimal column', () => {
            initializeComponent({ decimal: undefined }, decimalColumn);
            const currencyComponent = fixture.debugElement.query(By.directive(MockCurrencyPrefixComponent));
            expect(currencyComponent).toBeFalsy();
        });
    });

    describe('decimal places', () => {
        it('should show for decimal column', () => {
            initializeComponent({ decimal: undefined }, decimalColumn);
            const decimalDirective: DecimalPlacesDirective = fixture.debugElement.query(
                By.directive(DecimalPlacesDirective)
            ).componentInstance;
            expect(decimalDirective).toBeTruthy();
        });
        it('should accept decimalPlaces as input for decimal directive for decimal type columns', () => {
            const testColumn: Column = Column.of({ ...decimalColumn, decimalPlaces: 4 }); // decimal Places value is 4
            initializeComponent({ decimal: 4.56789 }, testColumn);
            const decimalCell = fixture.debugElement.query(By.css(decimalCellInput));
            expect(decimalCell.nativeElement.value).toEqual('4.5679');
        });
    });

    describe('ngOnInit', () => {
        it('should intialize values', () => {
            expect(component.inputType).toBeUndefined();
            expect(component.formControl).toBeUndefined();
            expect(component.editable).toBeUndefined();
            initializeComponent();
            expect(component.inputType).not.toBeUndefined();
            expect(component.formControl).not.toBeUndefined();
            expect(component.editable).not.toBeUndefined();
        });
        describe('row validity listener', () => {
            const invalidateForm = (value = 'x') => {
                component.formControl.setValidators(() => ({ valid: false }));
                component.formControl.patchValue(value);
                component.formControl.updateValueAndValidity();
                tick(200); // Debounce time of 200
            };

            it('should update invalid property', fakeAsync(() => {
                initializeComponent();
                expect(component.invalid).toBeFalsy();
                invalidateForm();
                expect(component.invalid).toBeTruthy();
            }));
            it('should emit updateValidity if validity changed', fakeAsync(() => {
                initializeComponent();
                expect(component.invalid).toBeFalsy();
                jest.spyOn(component.updateValidity, 'emit');
                invalidateForm();
                expect(component.updateValidity.emit).toHaveBeenCalled();
            }));
            it('should not emit updateValidity if validity did not change', fakeAsync(() => {
                initializeComponent();
                expect(component.invalid).toBeFalsy();
                invalidateForm();
                jest.spyOn(component.updateValidity, 'emit');
                invalidateForm('y');
                expect(component.updateValidity.emit).not.toHaveBeenCalled();
            }));
        });
        it('should set the width of a text field', () => {
            const value = 'testValue';
            initializeComponent({ name: value }, stringColumn);
            const input = fixture.debugElement.query(By.css(textCellInput));

            expect(input.nativeElement.size).toEqual(value.length);
        });
    });

    describe('outputs events', () => {
        const directionKeydownMap = new Map<string, string>()
            .set('UP', 'keydown.arrowup')
            .set('DOWN', 'keydown.arrowdown')
            .set('LEFT', 'keydown.arrowleft')
            .set('RIGHT', 'keydown.arrowright');

        const verifyKeyPress = (inputMatcher: string, arrowKey: ArrowKeyDirection) => {
            const input = fixture.debugElement.query(By.css(inputMatcher));
            const arrowPressedSpy = jest.spyOn(component.arrowPressed, 'emit');
            input.triggerEventHandler(
                directionKeydownMap.get(arrowKey),
                new KeyboardEvent(directionKeydownMap.get(arrowKey))
            );
            fixture.detectChanges();
            expect(arrowPressedSpy).toHaveBeenCalledWith({
                columnIndex: component.columnIndex,
                rowIndex: component.rowIndex,
                direction: arrowKey,
            });
        };

        const outputTests = (inputSelect: string, entity: any, column: Column) => {
            beforeEach(() => {
                initializeComponent(entity, column);
            });
            it('should output an arrowPressed event on up arrow keydown', () => {
                verifyKeyPress(inputSelect, 'UP');
            });
            it('should output an arrowPressed event on down arrow keydown', () => {
                verifyKeyPress(inputSelect, 'DOWN');
            });
            it('should output an arrowPressed event on left arrow keydown', () => {
                verifyKeyPress(inputSelect, 'LEFT');
            });
            it('should output an arrowPressed event on right arrow keydown', () => {
                verifyKeyPress(inputSelect, 'RIGHT');
            });
        };

        describe('for date input', () => {
            outputTests(dateCellInput, { date: undefined }, dateColumn);
        });
        describe('for integer input', () => {
            outputTests(integerCellInput, { id: undefined }, integerColumn);
        });
        describe('for decimal input', () => {
            outputTests(decimalCellInput, { decimal: undefined }, decimalColumn);
        });
        describe('for boolean input', () => {
            outputTests(boolCellInput, { active: undefined }, booleanColumn);
        });
        describe('for text input', () => {
            outputTests(textCellInput, { name: undefined }, stringColumn);
        });
        describe('for dropdown input', () => {
            outputTests(dropdownCellInput, { simpleString: undefined }, simpleStringDropdown);
        });
    });

    describe('on focus', () => {
        // TODO: Test integer column with issue#5394. The type="number" attribute seems to be breaking initial form values.
        // ${integerColumn}  | ${{ id: 100 }}            | ${integerCellInput}
        it.each`
            column            | data                      | inputMatcher
            ${dateColumn}     | ${{ date: '2020-04-18' }} | ${dateCellInput}
            ${decimalColumn}  | ${{ decimal: 123.4 }}     | ${decimalCellInput}
            ${currencyColumn} | ${{ currency: 5.99 }}     | ${decimalCellInput}
            ${stringColumn}   | ${{ name: 'test' }}       | ${textCellInput}
        `('input $inputMatcher should have its text selected', ({ column, data, inputMatcher }) => {
            initializeComponent(data, column);
            const input = findByCss(inputMatcher);
            input.triggerEventHandler('focus', {});
            expect(input.nativeElement.selectionStart === 0).toBeTruthy();
            expect(input.nativeElement.selectionEnd === input.nativeElement.value.length).toBeTruthy();
        });
    });

    describe('getFormControl', () => {
        it('should handle nested fields', () => {
            const expectedDisplayValue = 'TEST CATEGORY 1';
            const testObject = {
                parent: {
                    child: {
                        category: { id: 1, desc: expectedDisplayValue },
                    },
                },
            };
            component.column = nestedEntityColumn;
            component.columnIndex = 0;
            component.rowIndex = 0;
            component.row = new FormGroup({
                parent: new FormGroup({
                    child: new FormGroup({
                        category: new FormGroup({
                            id: new FormControl(1),
                            desc: new FormControl(expectedDisplayValue),
                        }),
                    }),
                }),
            });
            component.row.disable();
            fixture.detectChanges();

            expect(component.getFormControl().value).toEqual(testObject.parent.child.category);
        });
    });
});
