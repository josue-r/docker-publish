import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Type } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatOption, MatOptionModule } from '@angular/material/core';
import { MatError, MatFormFieldModule, MatHint } from '@angular/material/form-field';
import { MatInput, MatInputModule } from '@angular/material/input';
import { MatSelect, MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatSelectHarness } from '@angular/material/select/testing';
import { MatTooltipModule } from '@angular/material/tooltip';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Described } from '@vioc-angular/shared/common-functionality';
// TODO: 06/08/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
// tslint:disable-next-line: nx-enforce-module-boundaries
import { FormErrorMapping, UtilFormModule } from '@vioc-angular/shared/util-form';
import { MatSelectSearchComponent, NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { FilteredInputComponent } from './filtered-input.component';

describe('FilteredInputComponent', () => {
    let component: FilteredInputComponent;
    let fixture: ComponentFixture<FilteredInputComponent>;
    let loader: HarnessLoader;
    const option1 = { id: 100, code: 'O100', description: 'Option 100' };
    const option2 = { id: 101, code: 'O101', description: 'Option 101' };
    const option3 = { id: 200, code: 'O200', description: 'Option 200' };

    const initialize = (
        editable: boolean,
        required: boolean = false,
        nullable: boolean = false,
        multiple: boolean = false,
        initialOption = undefined,
        availableOptions = [option1, option2, option3]
    ) => {
        component.valueControl = new FormControl(initialOption);
        component.options = availableOptions;
        component.editable = editable;
        component.required = required;
        component.nullable = nullable;
        component.multiple = multiple;
        fixture.detectChanges();
    };

    const getTextInput = () => fixture.debugElement.query(By.directive(MatInput));

    const getSelectMenu = () => fixture.debugElement.query(By.directive(MatSelect));

    const openDropdown = () => {
        getSelectMenu()
            .injector.get<MatSelect>(MatSelect as Type<MatSelect>)
            .open();
        fixture.detectChanges();
    };

    const getOptions = () =>
        fixture.debugElement
            .queryAll(By.directive(MatOption))
            .filter((option) => !option.query(By.directive(MatSelectSearchComponent)))
            .map((option) => option.injector.get<MatOption>(MatOption as Type<MatOption>));

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [FilteredInputComponent],
            imports: [
                NoopAnimationsModule,
                ReactiveFormsModule,
                MatFormFieldModule,
                MatSelectModule,
                MatOptionModule,
                MatInputModule,
                NgxMatSelectSearchModule,
                UtilFormModule,
                MatTooltipModule,
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(FilteredInputComponent);
        component = fixture.componentInstance;
        loader = TestbedHarnessEnvironment.loader(fixture);
    });
    const findByCss = (css: string) => fixture.debugElement.query(By.css(css));
    it.each`
        editable
        ${true}
        ${false}
    `('should create when editable=$editable', ({ editable }) => {
        initialize(editable);
        expect(component).toBeTruthy();
    });

    it.each`
        isMultiple
        ${true}
        ${false}
    `('should create when isMultiple=$isMultiple', ({ isMultiple }) => {
        initialize(true, true, false, isMultiple);
        expect(component).toBeTruthy();
    });

    it.each`
        required
        ${true}
        ${false}
    `('should create when required=$required', async ({ required }) => {
        initialize(true, required);
        const select = await loader.getHarness(
            MatSelectHarness.with({
                selector: '.mat-mdc-select',
            })
        );
        expect(await select.isRequired()).toEqual(required);
    });

    it('should display a read only input when not editable', () => {
        initialize(false, false, false, false, option1);
        const textInput = getTextInput();
        expect(textInput).not.toBeNull();
        expect(textInput.nativeElement.disabled).toBeTruthy();
        expect(textInput.nativeElement.value).toEqual(option1.code);
    });

    it('should have the correct value in valueControl if compareWith is changed', () => {
        component.compareWith = Described.idEquals;
        initialize(true, false, false, false, option2);
        expect(component.valueControl.value).toEqual(option2);
    });

    it.each`
        nullable | expectedOptions
        ${true}  | ${4}
        ${false} | ${3}
    `('should load dropdown with $expectedOptions if nullable=$nullable', ({ nullable, expectedOptions }) => {
        // initialize a nullable filtered input
        initialize(true, false, nullable);
        getSelectMenu().injector.get<MatSelect>(MatSelect as Type<MatSelect>);
        openDropdown();
        const options = getOptions();
        // get and count mat-options, exclude the search/select option

        expect(options.length).toBe(expectedOptions);
    });

    it.each`
        hintEnabled | hint
        ${true}     | ${'Test hint'}
        ${false}    | ${''}
    `('should display hint=$hint when hintEnabled=$hintEnabled', ({ hintEnabled, hint }) => {
        component.valueControl = new FormControl();
        component.editable = true;
        component.hintEnabled = hintEnabled;
        component.hint = hint;
        fixture.detectChanges();
        const hintElement = fixture.debugElement.query(By.directive(MatHint));
        if (hintEnabled) {
            expect(hintElement.nativeElement.textContent.trim()).toEqual(hint);
        } else {
            expect(hintElement).toBeFalsy();
        }
    });

    it('should emit an event through selectionChange when selecting an option', () => {
        // initialize an open dropdown
        const outputSpy = jest.spyOn(component.selectionChange, 'emit');
        initialize(true);
        openDropdown();
        // find and select the first option avaliable
        const options = getOptions();
        options[0].select();
        // verify event was emitted
        expect(outputSpy).toHaveBeenCalledWith(expect.any(MatSelectChange));
    });

    it('should display proper error', fakeAsync(() => {
        // setup custom error mapping
        const errorMapping = {
            test: () => 'test error message',
        } as FormErrorMapping;
        component.customErrorMapping = errorMapping;
        initialize(true);
        // pre check; should be no mat-errors in DOM
        expect(fixture.debugElement.query(By.directive(MatError))).toBeNull();
        // set error for input
        component.valueControl.setErrors({ test: true });
        component.valueControl.markAsTouched();
        fixture.detectChanges();
        flush(); // Required to clear timers in the queue
        // verify error is getting rendered
        const errorDirective = fixture.debugElement.query(By.directive(MatError)).nativeElement;
        expect(errorDirective.innerHTML).toEqual(' test error message ');
    }));

    describe('filtering', () => {
        const filterOptions = (filterText: string) => {
            openDropdown();
            component.filterControl.patchValue(filterText);
            tick(100); // the sequence of observable updates is requiring a tick here
            fixture.detectChanges();
            flush();
        };

        const verifyOptions = (expectedOptions: string[], notExpectedOptions: string[]) => {
            const optionCss =
                '.mat-mdc-select-panel .mat-mdc-option:not(.contains-mat-select-search) .mdc-list-item__primary-text';
            const displayedOptions = fixture.debugElement
                .queryAll(By.css(optionCss))
                .map((o) => o.nativeElement.innerHTML)
                .map((t) => t.trim());
            expectedOptions.forEach((option) => expect(displayedOptions).toContainEqual(option));
            notExpectedOptions.forEach((option) => expect(displayedOptions).not.toContainEqual(option));
        };

        it('should filter available select options', fakeAsync(() => {
            initialize(true);
            filterOptions('O1');
            // this is expecting the default displayFn of mapping the values to their code
            verifyOptions([option1.code, option2.code], [option3.code]);
        }));

        it('should filter with no options', fakeAsync(() => {
            initialize(true, false, false, false, null, null);
            filterOptions('O1');
            verifyOptions([], [option1.code, option2.code, option3.code]);
        }));
    });

    it('should display the values in the format of the valueFn', () => {
        initialize(true);
        component.valueFn = (value: any) => value.code;
        fixture.detectChanges();

        openDropdown();

        const options = fixture.debugElement.queryAll(By.directive(MatOption));

        // check each of the available options is displayed in the dropdown list as codes
        component.options.forEach((ao) => {
            expect(options.map((o) => o.nativeElement.textContent.trim())).toContain(ao.code);
        });
    });

    describe('openedChange listener', () => {
        it('on close', () => {
            const spy = jest.spyOn(component.openChangedEvent, 'emit');
            initialize(true, false, false, true, [option1, option2]);
            //trigger close event on multiple selection.
            findByCss('mat-select').triggerEventHandler('openedChange', false);
            expect(spy).toHaveBeenCalled();
            findByCss('mat-select').triggerEventHandler('openedChange', true);
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('toggleAllSelection listener', () => {
        it('on close', () => {
            const spy = jest.spyOn(component.selectedOptionEvent, 'emit');
            initialize(true, false, false, true, [option1, option2]);
            openDropdown();
            // find and select the first option avaliable
            const options = fixture.debugElement.queryAll(By.css('mat-option'));
            options[2].nativeElement.click();
            // verify event was emitted
            expect(spy).toHaveBeenCalled();
        });
    });
    describe('valueText', () => {
        const describedOptions = [
            { id: 2, code: 'C2', description: 'Code 2' },
            { id: 3, code: 'C3', description: 'Code 3' },
        ];
        const simpleOptions = ['option1', 'option2'];

        describe.each`
            newValue               | options             | valueFn               | compareFn             | displayFn                      | expectedValueText
            ${3}                   | ${describedOptions} | ${Described.idMapper} | ${undefined}          | ${Described.codeMapper}        | ${'C3'}
            ${3}                   | ${describedOptions} | ${Described.idMapper} | ${undefined}          | ${Described.descriptionMapper} | ${'Code 3'}
            ${null}                | ${describedOptions} | ${Described.idMapper} | ${undefined}          | ${Described.descriptionMapper} | ${''}
            ${describedOptions[0]} | ${describedOptions} | ${undefined}          | ${Described.idEquals} | ${Described.descriptionMapper} | ${'Code 2'}
            ${describedOptions[0]} | ${describedOptions} | ${undefined}          | ${undefined}          | ${Described.descriptionMapper} | ${'Code 2'}
            ${null}                | ${describedOptions} | ${undefined}          | ${undefined}          | ${Described.descriptionMapper} | ${''}
            ${{ id: 2 }}           | ${describedOptions} | ${undefined}          | ${Described.idEquals} | ${Described.descriptionMapper} | ${'Code 2'}
            ${{ id: 2 }}           | ${describedOptions} | ${undefined}          | ${undefined}          | ${Described.descriptionMapper} | ${''}
            ${{ id: 4 }}           | ${describedOptions} | ${undefined}          | ${Described.idEquals} | ${Described.descriptionMapper} | ${''}
            ${null}                | ${describedOptions} | ${undefined}          | ${Described.idEquals} | ${Described.descriptionMapper} | ${''}
            ${'option1'}           | ${simpleOptions}    | ${undefined}          | ${undefined}          | ${(o) => o}                    | ${'option1'}
            ${'option1'}           | ${simpleOptions}    | ${undefined}          | ${undefined}          | ${(o) => o.toUpperCase()}      | ${'OPTION1'}
            ${'option3'}           | ${simpleOptions}    | ${undefined}          | ${undefined}          | ${(o) => o.toUpperCase()}      | ${''}
            ${null}                | ${simpleOptions}    | ${undefined}          | ${undefined}          | ${(o) => o.toUpperCase()}      | ${''}
        `(
            'with different value, compare, and display configurations',
            ({ newValue, options, valueFn, compareFn, displayFn, expectedValueText }) => {
                it(`should update valueText to ${expectedValueText} when given newValue=${newValue} options=${JSON.stringify(
                    options
                )}}`, fakeAsync(() => {
                    if (valueFn) {
                        component.valueFn = valueFn;
                    }
                    if (compareFn) {
                        component.compareWith = compareFn;
                    }
                    if (displayFn) {
                        component.displayFn = displayFn;
                    }
                    initialize(true, false, false, false, null, options);
                    component.valueControl.setValue(newValue);
                    flush();
                    expect(component.valueText).toEqual(expectedValueText);
                }));
            }
        );
    });

    describe('tooltip', () => {
        const initializeWithTooltipEnabled = () => {
            // configure so the value is just ids but the description is displayed
            component.valueFn = (v) => v.id;
            component.displayFn = (v) => v.description;
            component.tooltipEnabled = true;
            initialize(true);
            expect(component.tooltipEnabled).toBeTruthy();
            expect(component.tooltipText).toEqual('');
        };
        it('should be disabled by default', () => {
            initialize(true);
            expect(component.tooltipEnabled).toBeFalsy();
            expect(component.tooltipText).toEqual('');
        });

        it('should listen to value changes and update the tooltipText', fakeAsync(() => {
            initializeWithTooltipEnabled();
            component.valueControl.setValue(option1.id);
            flush();
            expect(component.tooltipText).toEqual(option1.description);
        }));

        it('should update the tooltipText if the options change', fakeAsync(() => {
            initializeWithTooltipEnabled();
            component.valueControl.setValue(option1.id);
            flush();
            component.options = [];
            expect(component.tooltipText).toEqual('');
        }));
    });
});
