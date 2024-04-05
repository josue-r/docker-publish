import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component, DebugElement, Input, Type } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { AbstractControl, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, ActivatedRouteSnapshot, convertToParamMap, Router } from '@angular/router';
import { CommonCodeFacade } from '@vioc-angular/central-ui/config/data-access-common-code';
import { ProductCategory, ProductCategoryFacade } from '@vioc-angular/central-ui/product/data-access-product-category';
import { RouterService } from '@vioc-angular/central-ui/util-router';
import { CommonFunctionalityModule, Described } from '@vioc-angular/shared/common-functionality';
import { MessageFacade } from '@vioc-angular/shared/data-access-message';
import { UiActionBarModule } from '@vioc-angular/shared/ui-action-bar';
import { UiAuditModule } from '@vioc-angular/shared/ui-audit';
import { MockLoadingOverlayComponent, UiLoadingMockModule } from '@vioc-angular/shared/ui-loading';
import { GATEWAY_TOKEN } from '@vioc-angular/shared/util-api';
import { FormFactory, UtilFormModule } from '@vioc-angular/shared/util-form';
import {
    expectInput,
    getApplyActionButton,
    getCancelActionButton,
    getSaveActionButton,
} from '@vioc-angular/test/util-test';
import { of, Subject } from 'rxjs';
import { ProductCategoryModuleForms } from '../../product-category-module-forms';
import { ProductCategoryComponent } from './product-category.component';

@Component({
    selector: 'vioc-angular-filtered-input',
    template: ``,
})
class MockFilteredInputComponent {
    @Input() options: Described[];
    @Input() valueControl: AbstractControl;
    @Input() editable: boolean;
    @Input() nullable: boolean;
    @Input() placeHolder: string;
    @Input() compareWith;
    @Input() displayFn: string;
}

describe('ProductCategoryComponent', () => {
    let component: ProductCategoryComponent;
    let fixture: ComponentFixture<ProductCategoryComponent>;
    let commonCodeFacade: CommonCodeFacade;
    let productCategoryFacade: ProductCategoryFacade;
    let messageFacade: MessageFacade;

    const testProductCategory: ProductCategory = {
        id: 1001,
        code: 'ABC',
        description: 'pc-test-description',
        active: true,
        parentCategory: { code: 'XYZ', id: 1000, version: 10, description: 'XYZ' },
        productRating: { code: 'GOOD', id: 1001, version: 10, description: 'GOOD RATING' },
        version: 1,
        productRatingPriority: 100,
        reportOrder: 1,
        diesel: false,
        highMileage: false,
        nacsProductCode: { code: 'NACS', id: 1010, version: 10, description: 'NACS Description' },
        fleetProductCode: { code: 'FLEET', id: 1100, version: 10, description: 'FLEET Description' },
        motorInfo: {
            primaryTable: 'Table1',
            primaryColumn: 'Column1',
            secondaryTable: 'Table2',
            secondaryColumn: 'Column2',
        },
        type: null,
        updatedBy: null,
        updatedOn: null,
    };
    const routeParams = new Subject();

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ProductCategoryComponent, MockFilteredInputComponent],
            imports: [
                NoopAnimationsModule,
                HttpClientTestingModule,
                ReactiveFormsModule,
                MatCheckboxModule,
                MatFormFieldModule,
                MatInputModule,
                MatButtonModule,
                MatSelectModule,
                MatOptionModule,
                UiLoadingMockModule,
                UiActionBarModule,
                UiAuditModule,
                UtilFormModule,
                CommonFunctionalityModule,
            ],
            providers: [
                FormFactory,
                { provide: ActivatedRoute, useValue: { params: routeParams, parent: '/maintenance/product-category' } },
                { provide: Router, useValue: { navigate: jest.fn() } },
                { provide: RouterService, useValue: { navigateToSearchPage: jest.fn() } },
                { provide: MessageFacade, useValue: { addMessage: jest.fn() } },
                { provide: GATEWAY_TOKEN, useValue: '//gateway/' },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        ProductCategoryModuleForms.registerForms(TestBed.inject(FormFactory), TestBed.inject(FormBuilder));
        fixture = TestBed.createComponent(ProductCategoryComponent);
        component = fixture.componentInstance;
        commonCodeFacade = component.commonCodeFacade;
        productCategoryFacade = component.productCategoryFacade;

        // Common mocking
        commonCodeFacade.findByType = jest.fn();
        productCategoryFacade.findAssignableParents = jest.fn();
    });

    const initialize = (
        accessMode: 'view' | 'edit' | 'add',
        model: ProductCategory = testProductCategory,
        andflush = true
    ) => {
        const route = TestBed.inject(ActivatedRoute);
        route.snapshot = {
            paramMap: convertToParamMap({ accessMode: accessMode, productCategoryCode: model.code }),
        } as ActivatedRouteSnapshot;
        const productCategory = { ...new ProductCategory(), ...model };
        jest.spyOn(productCategoryFacade, 'findByCode').mockReturnValue(of(productCategory));
        fixture.detectChanges();
        if (andflush) {
            flush();
        }
    };

    /**
     * `parentCategory` is a filtered input dropdown so this is used to get the
     * value of its properties instead of using `expectInput(parentCategory)`.
     *
     * Examples:
     * `expect(getParentCategoryInput().editable)` - to get the state of the field.
     * `expect(getParentCategoryInput().valueControl.value)` - to get the control of the displayed input value.
     */
    const getParentCategoryInput = () =>
        fixture.debugElement
            .query(By.directive(MockFilteredInputComponent))
            .injector.get<MockFilteredInputComponent>(MockFilteredInputComponent as Type<MockFilteredInputComponent>);

    const verifySaveAndMessage = (model: ProductCategory = testProductCategory) => {
        expect(productCategoryFacade.save).toHaveBeenCalledWith(model);
        expect(messageFacade.addMessage).toHaveBeenCalledWith({
            message: `Product Category ${model.code} saved successfully`,
            severity: 'info',
        });
    };

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display loading overlay if isLoading', fakeAsync(() => {
        initialize('edit');
        const loadingOverlay: MockLoadingOverlayComponent = fixture.debugElement.query(
            By.directive(MockLoadingOverlayComponent)
        ).componentInstance;

        component.isLoading = false;
        fixture.detectChanges();
        expect(loadingOverlay.loading).toEqual(false);

        component.isLoading = true;
        fixture.detectChanges();
        expect(loadingOverlay.loading).toEqual(true);
    }));

    describe('with cancel button clicked', () => {
        let router: Router;
        beforeEach(() => {
            router = TestBed.inject(Router);
        });
        it('should navigate to the search page when clicking cancel button', fakeAsync(() => {
            initialize('edit');
            fixture.debugElement.query(By.css('#cancel-action')).nativeElement.click();

            expect(router.navigate).toHaveBeenCalledWith(['search'], {
                relativeTo: TestBed.inject(ActivatedRoute).parent,
            });
        }));
    });

    describe('ngOnInit', () => {
        const expectDropdownDataLoad = () => {
            expect(productCategoryFacade.findAssignableParents).toHaveBeenCalledWith();
            expect(commonCodeFacade.findByType).toHaveBeenCalledWith('NACSPRODUCT', true);
            expect(commonCodeFacade.findByType).toHaveBeenCalledWith('BILLCODE', true);
            expect(commonCodeFacade.findByType).toHaveBeenCalledWith('PRODRATING', true);
        };

        describe('view mode', () => {
            let router: Router;
            beforeEach(() => {
                router = TestBed.inject(Router);
            });
            it('should load productCategory data', fakeAsync(() => {
                initialize('view');
                expect(productCategoryFacade.findByCode).toHaveBeenCalledWith(testProductCategory.code);
                expect(productCategoryFacade.findAssignableParents).not.toHaveBeenCalled();
                expect(commonCodeFacade.findByType).not.toHaveBeenCalled();
                expect(component.form.enabled).toBeFalsy();
            }));

            it('should navigate to the search page when clicking cancel button', fakeAsync(() => {
                initialize('view');
                fixture.debugElement.query(By.css('#cancel-action')).nativeElement.click();
                expect(router.navigate).toHaveBeenCalledWith(['search'], {
                    relativeTo: TestBed.inject(ActivatedRoute).parent,
                });
            }));
            it('should provide current values to dropdowns', fakeAsync(async () => {
                // dropdowns require the existing value to be an option in order to display properly
                initialize('view');
                // grab each dropdown observable
                const nacsProductCodes = await component.nacsProductCode$.toPromise();
                const fleetProductCodes = await component.fleetProductCode$.toPromise();
                const productRatings = await component.productRating$.toPromise();
                const parentCategories = await component.parentCategory$.toPromise();

                expect(nacsProductCodes).toContain(testProductCategory.nacsProductCode);
                expect(fleetProductCodes).toContain(testProductCategory.fleetProductCode);
                expect(productRatings).toContain(testProductCategory.productRating);
                expect(parentCategories).toContain(testProductCategory.parentCategory);
            }));
        });

        describe('edit mode', () => {
            it('should load common code data', fakeAsync(() => {
                initialize('edit');
                expect(productCategoryFacade.findByCode).toHaveBeenCalledWith(testProductCategory.code);
                expectDropdownDataLoad();
            }));
        });

        describe('add mode', () => {
            it('should not load product category data and should load dropdown data', fakeAsync(() => {
                initialize('add');
                expect(productCategoryFacade.findByCode).not.toHaveBeenCalled();
                expectDropdownDataLoad();
            }));

            it('should default the boolean values since they are required', fakeAsync(() => {
                initialize('add');
                expect(component.model.active).toBe(true);
                expect(component.model.highMileage).toBe(false);
                expect(component.model.diesel).toBe(false);
            }));
        });
    });

    describe('Action Bar', () => {
        describe.each`
            accessMode | saveDisplayed | applyDisplayed | cancelDisplayed
            ${'view'}  | ${false}      | ${false}       | ${true}
            ${'edit'}  | ${true}       | ${true}        | ${true}
            ${'add'}   | ${true}       | ${true}        | ${true}
        `('in $accessMode mode', ({ accessMode, saveDisplayed, applyDisplayed, cancelDisplayed }) => {
            const verifyDisplayedState = (element: DebugElement, shouldBeDisplayed: boolean) => {
                initialize(accessMode);
                if (shouldBeDisplayed) {
                    expect(element).toBeDefined();
                } else {
                    expect(element).toBeNull();
                }
            };

            it(`should ${saveDisplayed ? '' : 'not '}display the save button`, fakeAsync(() => {
                verifyDisplayedState(getSaveActionButton(fixture), saveDisplayed);
            }));
            it(`should ${applyDisplayed ? '' : 'not '}display the apply button`, fakeAsync(() => {
                verifyDisplayedState(getApplyActionButton(fixture), applyDisplayed);
            }));
            it(`should ${cancelDisplayed ? '' : 'not '}display the cancel button`, fakeAsync(() => {
                verifyDisplayedState(getCancelActionButton(fixture), cancelDisplayed);
            }));
        });

        describe.each`
            formState    | saveEnabled | applyEnabled | cancelEnabled
            ${'valid'}   | ${true}     | ${true}      | ${true}
            ${'invalid'} | ${false}    | ${false}     | ${true}
        `(`with $formState form`, ({ formState, saveEnabled, applyEnabled, cancelEnabled }) => {
            beforeEach(fakeAsync(() => {
                initialize('edit');
                if (formState === 'invalid') {
                    component.form.setErrors({ invalid: true });
                }
                fixture.detectChanges();
            }));

            it(`save button should be ${saveEnabled ? 'en' : 'dis'}abled`, fakeAsync(() => {
                expect(getSaveActionButton(fixture).nativeElement.disabled).toBe(!saveEnabled);
            }));
            it(`apply button should be ${applyEnabled ? 'en' : 'dis'}abled`, fakeAsync(() => {
                expect(getApplyActionButton(fixture).nativeElement.disabled).toBe(!applyEnabled);
            }));
            it(`cancel button should be ${cancelEnabled ? 'en' : 'dis'}abled`, fakeAsync(() => {
                expect(getCancelActionButton(fixture).nativeElement.disabled).toBe(!cancelEnabled);
            }));
        });

        describe('saving', () => {
            let routerService: RouterService;
            let router: Router;

            beforeEach(() => {
                productCategoryFacade.save = jest.fn(() => of(null));
                messageFacade = TestBed.inject(MessageFacade as Type<MessageFacade>);
                routerService = TestBed.inject(RouterService as Type<RouterService>);
                router = TestBed.inject(Router as Type<Router>);
            });

            describe('with save button', () => {
                it('should save only once on multible clicks', fakeAsync(() => {
                    initialize('edit');
                    getSaveActionButton(fixture).nativeElement.click();
                    getSaveActionButton(fixture).nativeElement.click();
                    getSaveActionButton(fixture).nativeElement.click();
                    tick(600);
                    fixture.detectChanges();
                    expect(productCategoryFacade.save).toHaveBeenCalledTimes(1);
                    expect(routerService.navigateToSearchPage).toHaveBeenCalled();
                }));

                it('should save, add an info message, and navigate to previous page', fakeAsync(() => {
                    initialize('edit');
                    getSaveActionButton(fixture).nativeElement.click();
                    tick(600);
                    fixture.detectChanges();
                    verifySaveAndMessage();
                    expect(routerService.navigateToSearchPage).toHaveBeenCalled();
                }));

                it('should show loading overlay when processing', fakeAsync(() => {
                    const saveSubject = new Subject();
                    productCategoryFacade.save = jest.fn(() => saveSubject);
                    initialize('edit');
                    getSaveActionButton(fixture).nativeElement.click();
                    tick(600);
                    fixture.detectChanges();

                    expect(component.isLoading).toBeTruthy();

                    saveSubject.next(null);
                    tick(600); // second tick to empty queue

                    expect(component.isLoading).toBeFalsy();
                }));

                it('should cancel loading overlay if an error occurs', fakeAsync(() => {
                    const saveSubject = new Subject();
                    productCategoryFacade.save = jest.fn(() => saveSubject);
                    initialize('edit');
                    getSaveActionButton(fixture).nativeElement.click();
                    tick(600);
                    fixture.detectChanges();

                    expect(component.isLoading).toBeTruthy();

                    expect(() => {
                        saveSubject.error('An error occurred');
                        tick(600); // second tick to empty queue
                    }).toThrow();

                    expect(component.isLoading).toBeFalsy();
                }));
            });

            describe('with apply button', () => {
                it('should trigger apply only once on multiple clicks', fakeAsync(() => {
                    initialize('edit');
                    jest.spyOn(component, 'ngOnInit');
                    jest.spyOn(productCategoryFacade, 'save').mockReturnValue(of(null));

                    getApplyActionButton(fixture).nativeElement.click();
                    getApplyActionButton(fixture).nativeElement.click();
                    getApplyActionButton(fixture).nativeElement.click();
                    tick(600);
                    fixture.detectChanges();
                    tick(600); // second tick to empty queue
                    expect(productCategoryFacade.save).toHaveBeenCalledTimes(1);
                    expect(component.ngOnInit).toHaveBeenCalled();
                }));

                it('should reload model in edit mode', fakeAsync(() => {
                    initialize('edit');
                    jest.spyOn(component, 'ngOnInit');
                    jest.spyOn(productCategoryFacade, 'save').mockReturnValue(of(null));

                    getApplyActionButton(fixture).nativeElement.click();
                    tick(600);
                    fixture.detectChanges();
                    tick(600); // second tick to empty queue
                    expect(productCategoryFacade.save).toHaveBeenCalled();
                    expect(component.ngOnInit).toHaveBeenCalled();
                }));

                it('should navigate to the edit page when in add mode', fakeAsync(() => {
                    const testNavigate: ProductCategory = {
                        ...new ProductCategory(),
                        code: 'TESTCODE',
                        active: true,
                        highMileage: false,
                        diesel: false,
                    };
                    initialize('add');
                    component.form.patchControlValue('code', testNavigate.code);
                    component.apply(); // Calling apply directly because there's not a way to initialize a valid form in add mode
                    verifySaveAndMessage(testNavigate);
                    expect(component.form).toBeFalsy();
                    expect(router.navigate).toHaveBeenCalledWith(['edit', testNavigate.code], expect.anything());
                }));

                it('should show loading overlay when processing', fakeAsync(() => {
                    const applySubject = new Subject();
                    productCategoryFacade.save = jest.fn(() => applySubject);
                    initialize('edit');
                    getApplyActionButton(fixture).nativeElement.click();
                    tick(600);
                    fixture.detectChanges();

                    expect(component.isLoading).toBeTruthy();

                    applySubject.next(null);
                    tick(600); // second tick to empty queue

                    expect(component.isLoading).toBeFalsy();
                }));

                it('should cancel loading overlay if an error occurs', fakeAsync(() => {
                    const applySubject = new Subject();
                    productCategoryFacade.save = jest.fn(() => applySubject);
                    initialize('edit');
                    getApplyActionButton(fixture).nativeElement.click();

                    tick(600);
                    fixture.detectChanges();

                    expect(component.isLoading).toBeTruthy();

                    expect(() => {
                        applySubject.error('An error occurred');
                        tick(600); // second tick to empty queue
                    }).toThrow();

                    expect(component.isLoading).toBeFalsy();
                }));
            });
        });

        describe('unsavedChanges', () => {
            it('should track if the form has been modified', fakeAsync(() => {
                initialize('edit');
                expect(component.unsavedChanges).toBeFalsy();
                component.form.markAsDirty();
                expect(component.unsavedChanges).toBeTruthy();
            }));
        });
    });

    describe('Product Category information', () => {
        describe.each`
            control                    | value                    | enabled
            ${'code'}                  | ${'ABC'}                 | ${false}
            ${'description'}           | ${'pc-test-description'} | ${true}
            ${'active'}                | ${true}                  | ${false}
            ${'productRatingPriority'} | ${'100'}                 | ${true}
            ${'reportOrder'}           | ${'1'}                   | ${true}
            ${'highMileage'}           | ${false}                 | ${true}
            ${'diesel'}                | ${false}                 | ${true}
            ${'primaryTable'}          | ${'Table1'}              | ${true}
            ${'primaryColumn'}         | ${'Column1'}             | ${true}
            ${'secondaryTable'}        | ${'Table2'}              | ${true}
            ${'secondaryColumn'}       | ${'Column2'}             | ${true}
        `('fields', ({ control, value, enabled }) => {
            it(`should display input for ${control} as ${value} and ${
                enabled ? '' : 'not '
            }be enabled`, fakeAsync(() => {
                initialize('edit');
                expectInput(fixture, control).toHaveValue(value).toBeEnabled(enabled);
            }));
        });

        describe.each`
            value    | enabled
            ${true}  | ${false}
            ${false} | ${true}
        `('active', ({ value, enabled }) => {
            const testActive: ProductCategory = {
                ...testProductCategory,
                active: value,
            };
            it(`should ${enabled ? '' : 'not '}be enabled if its value is ${value}`, fakeAsync(() => {
                initialize('edit', testActive);
                expectInput(fixture, 'active').toHaveValue(value).toBeEnabled(enabled);
            }));
        });

        const listOfDescribes: Described[] = [
            { id: 50, code: 'Item 1', description: 'Description 1', version: 1 },
            { id: 60, code: 'Item 2', description: 'Description 2', version: 1 },
        ];

        describe.each`
            control               | value                                   | enabled
            ${'productRating'}    | ${testProductCategory.productRating}    | ${true}
            ${'fleetProductCode'} | ${testProductCategory.fleetProductCode} | ${true}
            ${'nacsProductCode'}  | ${testProductCategory.nacsProductCode}  | ${true}
        `('dropdown fields', ({ control, value, enabled }) => {
            it(`should display input for ${control} as ${value.description} and ${
                enabled ? '' : 'not '
            }be enabled`, fakeAsync(() => {
                jest.spyOn(commonCodeFacade, 'findByType').mockReturnValue(of(listOfDescribes.concat([value])));
                initialize('edit');

                expectInput(fixture, control).toHaveValue(value.description).toBeEnabled(enabled);
            }));
        });

        describe.each`
            accessMode | enabled
            ${'view'}  | ${false}
            ${'edit'}  | ${true}
        `(`Parent Category`, ({ accessMode, enabled }) => {
            beforeEach(fakeAsync(() => {
                initialize(accessMode);
            }));

            it(`should ${enabled ? '' : 'not '}be enabled in ${accessMode} mode`, fakeAsync(() => {
                expect(getParentCategoryInput().editable).toBe(enabled);
            }));

            it(`should display the correct value in ${accessMode} mode`, fakeAsync(() => {
                expect(getParentCategoryInput().valueControl.value).toBe(testProductCategory.parentCategory);
            }));
        });

        describe('Motor Info', () => {
            const testNoMotorInfo: ProductCategory = {
                ...testProductCategory,
                motorInfo: null,
            };

            beforeEach(fakeAsync(() => {
                jest.spyOn(productCategoryFacade, 'save').mockReturnValue(of(null));
                messageFacade = TestBed.inject(MessageFacade as Type<MessageFacade>);
            }));

            it('should delete motor info after clearing out all the motor info fields and saving', fakeAsync(() => {
                initialize('edit');

                component.form.patchControlValue('motorInfo', {
                    primaryTable: null,
                    primaryColumn: null,
                    secondaryTable: null,
                    secondaryColumn: null,
                });
                getApplyActionButton(fixture).nativeElement.click();
                tick(600);
                fixture.detectChanges();
                flush();
                verifySaveAndMessage(testNoMotorInfo);
            }));

            it('should delete motor info values if the category becomes a root category', fakeAsync(() => {
                const rootCategory: ProductCategory = {
                    ...testProductCategory,
                    motorInfo: null,
                    parentCategory: null,
                };
                initialize('edit');

                component.form.patchControlValue('parentCategory', null);
                getApplyActionButton(fixture).nativeElement.click();
                tick(600);
                fixture.detectChanges();
                flush();
                verifySaveAndMessage(rootCategory);
            }));

            it('should save successfully after entering and then clearing motor info', fakeAsync(() => {
                initialize('edit', testNoMotorInfo);

                component.form.patchControlValue('motorInfo', { primaryTable: 'Test' });
                component.form.patchControlValue('motorInfo', { primaryTable: null });
                getApplyActionButton(fixture).nativeElement.click();
                tick(600);
                fixture.detectChanges();
                flush();
                verifySaveAndMessage(testNoMotorInfo);
            }));

            describe.each`
                parentCategory                        | motorInfo                        | showMotorInfo | accessMode
                ${null}                               | ${null}                          | ${false}      | ${'view'}
                ${undefined}                          | ${null}                          | ${false}      | ${'view'}
                ${testProductCategory.parentCategory} | ${null}                          | ${false}      | ${'view'}
                ${testProductCategory.parentCategory} | ${testProductCategory.motorInfo} | ${true}       | ${'view'}
                ${null}                               | ${null}                          | ${false}      | ${'edit'}
                ${undefined}                          | ${null}                          | ${false}      | ${'edit'}
                ${testProductCategory.parentCategory} | ${null}                          | ${true}       | ${'edit'}
                ${testProductCategory.parentCategory} | ${testProductCategory.motorInfo} | ${true}       | ${'edit'}
            `(`Showing Motor Info section`, ({ parentCategory, motorInfo, showMotorInfo, accessMode }) => {
                const testValue: ProductCategory = {
                    ...testProductCategory,
                    parentCategory: parentCategory,
                    motorInfo: motorInfo,
                };
                it(`should ${showMotorInfo ? '' : 'not '}be present when it is ${
                    parentCategory ? 'not ' : ''
                }a root category, the access mode is ${accessMode}, and there is ${
                    motorInfo ? '' : 'no '
                }motor info`, fakeAsync(() => {
                    initialize(accessMode, testValue);

                    expectInput(fixture, 'primaryTable').toBePresent(showMotorInfo);
                }));
                // add uses the same values as edit
                if (accessMode === 'edit') {
                    it(`should ${showMotorInfo ? '' : 'not '}be present when it is ${
                        parentCategory ? 'not ' : ''
                    }a root category, and the access mode is add`, fakeAsync(() => {
                        initialize('add');
                        component.form.patchControlValue('parentCategory', parentCategory);
                        fixture.detectChanges();
                        tick(100);
                        expectInput(fixture, 'primaryTable').toBePresent(showMotorInfo);
                    }));
                }
            });
        });
    });
});
