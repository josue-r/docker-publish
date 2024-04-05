import { Type } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { FormControlName, FormsModule, NgControl, ReactiveFormsModule } from '@angular/forms';
import { MatOption } from '@angular/material/core';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CommonFunctionalityModule } from '@vioc-angular/shared/common-functionality';
import { DropdownColumnFacade } from '@vioc-angular/shared/data-access-dropdown-column';
import {
    Column,
    DropdownDisplayPipe,
    DynamicDropdownColumn,
    dynamicStringDropdown,
    MockSearchService,
    simpleObjectDropdown,
} from '@vioc-angular/shared/util-column';
import { expectObservable } from '@vioc-angular/test/util-test';
import { MatSelectSearchComponent, NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { of } from 'rxjs';
import { DropdownColumnComponent } from './dropdown-column.component';

describe('DropdownColumnComponent', () => {
    let component: DropdownColumnComponent;
    let fixture: ComponentFixture<DropdownColumnComponent>;
    const testColumn = DynamicDropdownColumn.of({ ...dynamicStringDropdown });
    const testControl = new FormControlName(null, [], [], null, null);
    const testValue = 'value';

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                MatSelectModule,
                FormsModule,
                ReactiveFormsModule,
                NgxMatSelectSearchModule,
                NoopAnimationsModule,
                CommonFunctionalityModule,
            ],
            declarations: [DropdownColumnComponent, DropdownDisplayPipe],
            providers: [MockSearchService, DropdownColumnFacade],
        })
            // Overriding self provided NgControl dependency
            .overrideComponent(DropdownColumnComponent, {
                set: { providers: [{ provide: NgControl, useValue: testControl }] },
            })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(DropdownColumnComponent);
        component = fixture.componentInstance;
    });

    const initializeComponent = (
        options: {
            value?: any;
            column?: DynamicDropdownColumn<any>;
            multiple?: boolean;
            disabled?: boolean;
            focused?: boolean;
            noSelectionOption?: boolean;
            ngControl?: NgControl;
        } = {}
    ) => {
        // Register ControlValueAccessor handlers
        component.registerOnChange(() => {});
        component.registerOnTouched(() => {});
        // Apply provided options
        Object.keys(options).forEach((option) => (component[option] = options[option]));
        // Default column to the testColumn
        if (!component.column) {
            component.column = testColumn;
        }
        fixture.detectChanges();
    };
    const findByCss = (css: string) => fixture.debugElement.query(By.css(css));
    const findAllByCss = (css: string) => fixture.debugElement.queryAll(By.css(css));
    const fakeControl = (control: any) => (component.ngControl = control as NgControl);
    const openDropdown = () => {
        const select = fixture.debugElement
            .query(By.directive(MatSelect))
            .injector.get<MatSelect>(MatSelect as Type<MatSelect>);
        select.open();
        fixture.detectChanges();
    };
    const verifyOptions = (expectedOptions: string[]) => {
        const actualResults = findAllByCss('.mdc-list-item__primary-text')
            .map((o) => o.nativeElement.innerHTML)
            .map((t) => t.trim());
        expectedOptions.forEach((expectedResult) => expect(actualResults).toContainEqual(expectedResult));
    };
    const queryOptions = (): MatOption[] => {
        return fixture.debugElement
            .queryAll(By.directive(MatOption))
            .filter((option) => !option.query(By.directive(MatSelectSearchComponent)))
            .map((option) => option.injector.get<MatOption>(MatOption as Type<MatOption>));
    };

    it('should create', () => {
        initializeComponent();
        expect(component).toBeTruthy();
    });

    describe('has a search filter that', () => {
        // These tests are assuming column is set with a minCharactersForSearch of 2 and maxCharactersForSearch of 3
        const verifySearchResults = (searchText: string, expectedResults: string[], options = {}) => {
            initializeComponent(options);
            openDropdown();
            fixture.detectChanges();
            component.searchFilterControl.patchValue(searchText);
            tick(getSearchDelay());
            fixture.detectChanges();
            verifyOptions(expectedResults);
            flush();
        };
        const getSearchDelay = () => component.column.throttleMilliseconds + MockSearchService.searchDelay;

        it('should should not search if searchText length is less than the minCharactersForSearch', fakeAsync(() => {
            verifySearchResults('', ['No values found']);
        }));
        it('should should search if searchText length is between minCharactersForSearch and maxCharactersForSearch', fakeAsync(() => {
            verifySearchResults('ab', ['AB0001', 'AB0002', 'AB0003', 'AB1001', 'AB1002', 'AB1003']);
        }));
        it('should include existing values', fakeAsync(() => {
            const existingValue = ['AB0001', 'AB0002'];
            // Expecting both values of array to be displayed
            verifySearchResults('', existingValue, { value: existingValue, multiple: true });
            // Expecting both values to be selected already
            expect(findAllByCss('mat-option.mdc-list-item--selected').length).toEqual(2);
        }));
        it('should maintain a searching boolean', fakeAsync(() => {
            initializeComponent();
            flush(); // Wait until fully loaded
            tick(component.column.throttleMilliseconds);
            expect(component.searching).toBeFalsy();
            component.searchFilterControl.patchValue('ab');
            expect(component.searching).toBeTruthy();
            tick(getSearchDelay());
            expect(component.searching).toBeFalsy();
        }));
        it('should stop searching indicator on error', fakeAsync(() => {
            initializeComponent();
            const facade = TestBed.inject(DropdownColumnFacade);
            jest.spyOn(facade, 'search').mockImplementationOnce(() => {
                throw new Error('Test search error');
            });
            expect(() => {
                component.searchFilterControl.patchValue('ab');
                expect(component.searching).toBeTruthy();
                tick(getSearchDelay());
            }).toThrow();
            expect(component.searching).toBeFalsy();
        }));
    });

    it('should display a "No Values Found" message if initialized without a value', () => {
        initializeComponent();
        openDropdown();
        verifyOptions(['No values found']);
    });

    describe('has inputs that', () => {
        const verifyInputChangeNotification = (inputField: string, newValue: any) => {
            const spy = jest.spyOn(component.stateChanges, 'next');
            component[inputField] = newValue;
            expect(spy).toHaveBeenCalled();
            expect(component[inputField]).toEqual(newValue);
        };
        it('should notify MatFormField changed', () => {
            verifyInputChangeNotification('required', true);
            verifyInputChangeNotification('placeholder', 'abc');
        });
    });

    describe('has a multiple input that', () => {
        it('should clear out the value if the component has already been initialized', () => {
            component.value = testValue;
            initializeComponent();
            expect(component.value).toBe(testValue);
            component.multiple = true;
            expect(component.value).toBeNull();
        });
        it('should not clear out the value if the component has not been initialized', () => {
            component.value = testValue;
            component.multiple = true;
            expect(component.value).toBe(testValue);
        });
    });

    describe('errorState', () => {
        it('should be true when component is not disabled, control is touched, and control is invalid', () => {
            component.disabled = false;
            fakeControl({ touched: true, invalid: true });
            expect(component.errorState).toBeTruthy();
        });
        describe('should be false when', () => {
            it('component is disabled', () => {
                component.disabled = true;
                fakeControl({ touched: true, invalid: true });
                expect(component.errorState).toBeFalsy();
            });
            it('component control is untouched', () => {
                component.disabled = false;
                fakeControl({ touched: false, invalid: true });
                expect(component.errorState).toBeFalsy();
            });
            it('component control is valid', () => {
                component.disabled = false;
                fakeControl({ touched: true, invalid: false });
                expect(component.errorState).toBeFalsy();
            });
        });
    });

    describe('empty', () => {
        describe('should be true when', () => {
            it('the value is null', () => {
                initializeComponent({ value: null });
                expect(component.empty).toBeTruthy();
            });
            it('the value is an empty array in multi-select mode', () => {
                initializeComponent({ value: [], multiple: true });
                expect(component.empty).toBeTruthy();
            });
        });
        describe('should be false when', () => {
            it('the value is set in single-select mode', () => {
                initializeComponent({ value: testValue });
                expect(component.empty).toBeFalsy();
            });
            it('the value has an element in it in multi-select mode', () => {
                initializeComponent({ value: testValue, multiple: true });
                expect(component.empty).toBeFalsy();
            });
        });
    });

    describe('focus', () => {
        const focusSelect = () =>
            fixture.debugElement
                .query(By.directive(MatSelect))
                .injector.get<MatSelect>(MatSelect as Type<MatSelect>)
                .focus();
        it('should be focused when inner select is focused', () => {
            initializeComponent();
            focusSelect();
            expect(component.focused).toBeTruthy();
        });
        it('should not be focused when disabled', () => {
            initializeComponent({ disabled: true });
            focusSelect();
            expect(component.focused).toBeFalsy();
        });
    });

    describe('shouldLabelFloat', () => {
        it('should be true if component is focused', () => {
            initializeComponent({ focused: true });
            expect(component.shouldLabelFloat).toBeTruthy();
        });
        it('should be true if component value is not empty', () => {
            initializeComponent({ value: testValue, focused: false });
            expect(component.shouldLabelFloat).toBeTruthy();
        });
        it('should be true if component is focused and is not empty', () => {
            initializeComponent({ value: testValue, focused: true });
            expect(component.shouldLabelFloat).toBeTruthy();
        });
        it('should be false if component is not focused and empty', () => {
            initializeComponent({ focused: false });
            expect(component.shouldLabelFloat).toBeFalsy();
        });
    });

    describe('in single select mode', () => {
        it('should be initialized with the current value', () => {
            const spy = jest.spyOn(component.option$, 'next');
            initializeComponent({ value: testValue });
            expect(component.value).toEqual(testValue);
            expect(spy).toHaveBeenCalledWith(new Set([testValue]));
        });
        describe('should have a "no selection" option', () => {
            it('displayed if initialized with a value and it is enabled', () => {
                initializeComponent({ value: testValue, noSelectionOption: true });
                openDropdown();
                verifyOptions(['', testValue]);
            });
            it('not displayed if it is disabled', () => {
                initializeComponent({ value: testValue, noSelectionOption: false });
                openDropdown();
                verifyOptions([testValue]);
            });
        });
        it('should allow you to select an option', () => {
            initializeComponent();
            component.option$.next(new Set(['option1', 'option2']));
            openDropdown();
            const option = queryOptions()[0];
            option.select();
            expect(component.value).toEqual(option.value);
        });
    });

    describe('in multi select mode', () => {
        it('should be initialized with the current value', () => {
            const spy = jest.spyOn(component.option$, 'next');
            const arrayTestValue = [testValue];
            initializeComponent({ multiple: true, value: arrayTestValue });
            expect(component.value).toEqual(arrayTestValue);
            expect(spy).toHaveBeenCalledWith(new Set(arrayTestValue));
        });
        it('should not have a "no selection" option', () => {
            initializeComponent({ multiple: true, value: testValue, noSelectionOption: true });
            openDropdown();
            verifyOptions([testValue]);
        });
        it('should allow you to select multiple options', () => {
            initializeComponent({ multiple: true });
            const testOptions = ['option1', 'option2'];
            component.option$.next(new Set(testOptions));
            openDropdown();
            queryOptions().forEach((option) => option.select());
            expect(component.value).toEqual(testOptions);
        });
    });

    describe('switching the column', () => {
        beforeEach(() => {
            jest.spyOn(component.searchFilterControl, 'setValue');
        });
        it('should reset the dropdown option', fakeAsync(() => {
            const testValue1 = ['Test1', 'Test2'];
            const testValue2 = ['Test3', 'Test4'];
            component.column = DynamicDropdownColumn.of({
                ...dynamicStringDropdown,
                throttleMilliseconds: 100,
                fetchData: () => of(testValue1),
            });
            initializeComponent();
            component.searchFilterControl.setValue('TES');
            fixture.detectChanges();
            tick(100);
            expectObservable(component.option$).toEqual(new Set(testValue1));
            component.column = DynamicDropdownColumn.of({
                ...(simpleObjectDropdown as Column),
                throttleMilliseconds: 100,
                fetchData: () => of(testValue2),
            });
            fixture.detectChanges();
            tick(100);
            expect(component.searchFilterControl.setValue).toHaveBeenCalledWith('');
            expectObservable(component.option$).toEqual(new Set(testValue2));
        }));
        it('should reset the filter control', fakeAsync(() => {
            initializeComponent();
            component.column = dynamicStringDropdown;
            fixture.detectChanges();
            tick(100);
            expect(component.searchFilterControl.setValue).toHaveBeenCalledWith('');
        }));
    });

    describe('dropdown open listener', () => {
        describe('on close', () => {
            const verifyClose = (value = null, expectedOptions = [], multiple = false) => {
                const spy = jest.spyOn(component.option$, 'next');
                initializeComponent({ value, multiple });
                findByCss('mat-select').triggerEventHandler('openedChange', false);
                expect(spy).toHaveBeenCalledWith(new Set(expectedOptions));
            };
            it('should updateDefaultOptions to empty if no value is set', () => {
                verifyClose();
            });
            it('should updateDefaultOptions to be the component value if available', () => {
                verifyClose(testValue, [testValue]);
            });
            it('should updateDefaultOptions to be each of the component values if in multi-select mode', () => {
                const multiTestValue = [testValue, 'value2'];
                verifyClose(multiTestValue, multiTestValue, true);
            });
        });
        describe('on open', () => {
            const verifyOpen = (expectedNumOfCalls: number, columnOpts = {}) => {
                initializeComponent({ column: DynamicDropdownColumn.of({ ...testColumn, ...columnOpts }) });
                const spy = jest.spyOn(component.searchFilterControl, 'updateValueAndValidity');
                findByCss('mat-select').triggerEventHandler('openedChange', true);
                expect(spy).toHaveBeenCalledTimes(expectedNumOfCalls);
            };
            it('should trigger a search if the column has a minCharactersForSearch of 0', () => {
                verifyOpen(1, { minCharactersForSearch: 0 });
            });
            it('should do nothing if the column has a minCharactersForSearch > 0', () => {
                verifyOpen(0);
            });
        });
    });

    describe('onContainerClick', () => {
        const verifyOnContainerClick = (expectControlToBeTouched: boolean, disabled: boolean) => {
            const mockControl = { control: { markAsTouched: () => {} } };
            const spy = jest.spyOn(mockControl.control, 'markAsTouched');
            initializeComponent({ disabled });
            fakeControl(mockControl);
            component.onContainerClick();
            if (expectControlToBeTouched) {
                expect(spy).toHaveBeenCalled();
            } else {
                expect(spy).not.toHaveBeenCalled();
            }
        };
        it('should mark control as touched when clicked', () => {
            verifyOnContainerClick(true, false);
        });
        it('should not mark control as touched if clicked while disabled', () => {
            verifyOnContainerClick(false, true);
        });
    });
});
