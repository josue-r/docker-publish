import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DebugElement, Type } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flush, tick, waitForAsync } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOption, MatOptionModule } from '@angular/material/core';
import { MatError, MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, ActivatedRouteSnapshot, Router, convertToParamMap } from '@angular/router';
import { CommonCodeFacade } from '@vioc-angular/central-ui/config/data-access-common-code';
import { Product, ProductFacade } from '@vioc-angular/central-ui/product/data-access-product';
import { ProductCategoryFacade } from '@vioc-angular/central-ui/product/data-access-product-category';
import { RouterService } from '@vioc-angular/central-ui/util-router';
import { CommonFunctionalityModule, Described } from '@vioc-angular/shared/common-functionality';
import { MessageFacade } from '@vioc-angular/shared/data-access-message';
import { UiActionBarModule } from '@vioc-angular/shared/ui-action-bar';
import { UiAddRemoveButtonModule } from '@vioc-angular/shared/ui-add-remove-button';
import { UiAuditModule } from '@vioc-angular/shared/ui-audit';
import { UiInfoButtonModule } from '@vioc-angular/shared/ui-info-button';
import { MockLoadingOverlayComponent, UiLoadingMockModule } from '@vioc-angular/shared/ui-loading';
import { GATEWAY_TOKEN } from '@vioc-angular/shared/util-api';
import { FormFactory, UtilFormModule } from '@vioc-angular/shared/util-form';
import {
    expectInput,
    getAddLikeActionButton,
    getApplyActionButton,
    getCancelActionButton,
    getSaveActionButton,
} from '@vioc-angular/test/util-test';
import { Subject, of } from 'rxjs';
import { ProductModuleForms } from '../../product-module-forms';
import { ProductComponent } from './product.component';

describe('ProductComponent', () => {
    let component: ProductComponent;
    let fixture: ComponentFixture<ProductComponent>;
    let commonCodeFacade: CommonCodeFacade;
    let productFacade: ProductFacade;
    let productCategoryFacade: ProductCategoryFacade;

    const testProduct: Product = {
        inventoryDescription: 'SRPNTINE BLT G1055K6',
        relatedProductCode: 'G1055K6',
        sapNumber: '1',
        obsolete: false,
        productCategory: { code: 'SERP BELT', id: 1044, version: 10, description: 'SERPENTINE BELT' },
        defaultUom: { code: 'EACH', id: 2479, version: 2, description: 'EA' },
        bulk: false,
        vendorType: { code: 'OUTSIDE_VENDOR', id: 6234, version: 0, description: 'Outside Vendor' },
        fluidGroup: null,
        tankStorage: false,
        upc: null,
        code: 'G1055K6',
        reportOrder: 'FRAN',
        id: 5296,
        type: { code: 'PTH', id: 1005, version: 1, description: 'Others' },
        updatedOn: '2020-03-30T09:58:12.375',
        updatedBy: 'a414583',
        version: 10,
        description: 'SERPENTINE BELT G1055K6',
        productMotorMapping: [],
        active: true,
        supportsECommerce: true,
    };

    const testCategories: Described[] = [
        { code: 'CAT1', id: 0, version: 10, description: 'Test Category 1' },
        { code: 'CAT2', id: 1, version: 10, description: 'Test Category 2' },
    ];

    const routeParams = new Subject();

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ProductComponent],
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
                UiActionBarModule,
                UiAddRemoveButtonModule,
                UiAuditModule,
                UiInfoButtonModule,
                UtilFormModule,
                UiLoadingMockModule,
                CommonFunctionalityModule,
            ],
            providers: [
                FormFactory,
                { provide: ActivatedRoute, useValue: { params: routeParams, parent: '/maintenance/product' } },
                { provide: Router, useValue: { navigate: jest.fn() } },
                { provide: RouterService, useValue: { navigateToSearchPage: jest.fn() } },
                { provide: MessageFacade, useValue: { addMessage: jest.fn() } },
                { provide: GATEWAY_TOKEN, useValue: '//gateway/' },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        ProductModuleForms.registerForms(TestBed.inject(FormFactory), TestBed.inject(FormBuilder));
        fixture = TestBed.createComponent(ProductComponent);
        component = fixture.componentInstance;
        productFacade = component.productFacade;
        commonCodeFacade = component.commonCodeFacade;
        productCategoryFacade = component.productCategoryFacade;

        // Common mocking
        commonCodeFacade.findByType = jest.fn();
        productCategoryFacade.findActive = jest.fn().mockImplementation(() => of([testProduct.productCategory]));
        productFacade.isProductAssigned = jest.fn(() => of(false));
    });

    /** Initialize the the component with the given access mode and product. */
    const initialize = (
        accessMode: 'view' | 'edit' | 'add' | 'add-like',
        model: Product = testProduct,
        andflush = true
    ) => {
        const route = TestBed.inject(ActivatedRoute);
        route.snapshot = {
            paramMap: convertToParamMap({ accessMode: accessMode, productCode: model.code }),
        } as ActivatedRouteSnapshot;
        const product = { ...new Product(), ...model };
        jest.spyOn(productFacade, 'findByCode').mockReturnValue(of(product));
        fixture.detectChanges();
        if (andflush) {
            flush();
        }
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
            expect(productCategoryFacade.findActive).toHaveBeenCalledWith('LEAF');
            expect(commonCodeFacade.findByType).toHaveBeenCalledWith('PRODTYPE', true);
            expect(commonCodeFacade.findByType).toHaveBeenCalledWith('VENDOR_TYPE', true);
            expect(commonCodeFacade.findByType).toHaveBeenCalledWith('PRDUOM', true);
            expect(commonCodeFacade.findByType).toHaveBeenCalledWith('FLUID_GROUP', true, {
                field: 'code',
                direction: 'asc',
            });
        };

        describe('edit mode', () => {
            it('should load product data, dropdown data, and check if product is assigned', fakeAsync(() => {
                initialize('edit');
                expect(productFacade.findByCode).toHaveBeenCalledWith(testProduct.code);
                expectDropdownDataLoad();
                expect(productFacade.isProductAssigned).toHaveBeenCalled();
            }));
        });

        describe('view mode', () => {
            it('should load product data, should not load dropdown data, and should disable the form', fakeAsync(() => {
                initialize('view');
                expect(productFacade.findByCode).toHaveBeenCalledWith(testProduct.code);
                expect(productCategoryFacade.findActive).not.toHaveBeenCalled();
                expect(commonCodeFacade.findByType).not.toHaveBeenCalled();
                expect(component.form.enabled).toBeFalsy();
            }));
        });

        describe('add mode', () => {
            it('should not load product data and should load dropdown data', fakeAsync(() => {
                initialize('add');
                expect(productFacade.findByCode).not.toHaveBeenCalled();
                expectDropdownDataLoad();
            }));

            it('should default the boolean values since they are required', fakeAsync(() => {
                initialize('add');
                expect(component.model.active).toBe(true);
                expect(component.model.bulk).toBe(false);
                expect(component.model.obsolete).toBe(false);
                expect(component.model.tankStorage).toBe(false);
            }));
        });

        describe('add like mode', () => {
            it('should create form for passed in product code', fakeAsync(() => {
                const product: Product = {
                    id: 1234,
                    code: 'G1055K6',
                    productCategory: { code: 'SERP BELT', description: 'SERPENTINE BELT' },
                    active: false,
                    description: 'SRPNTINE BLT G1055K6',
                    defaultUom: { id: 1, code: 'EACH', description: 'EA' },
                };
                initialize('add-like', product);

                component.ngOnInit();

                expect(component.model.id).toBeUndefined();
                expect(component.model.code).toBeUndefined();
                expect(component.model.version).toBeUndefined();
                expect(component.model.updatedBy).toBeUndefined();
                expect(component.model.updatedOn).toBeUndefined();
                expect(component.model.active).toEqual(product.active);
                expect(component.model.description).toEqual(product.description);
                expect(component.model.productCategory).toEqual(product.productCategory);
                expect(component.model.defaultUom).toEqual(product.defaultUom);
            }));
        });

        describe.each`
            accessMode | loadedCategories                 | expectedValue                  | expectedOptions
            ${'edit'}  | ${testCategories}                | ${testProduct.productCategory} | ${4}
            ${'edit'}  | ${[testProduct.productCategory]} | ${testProduct.productCategory} | ${2}
            ${'view'}  | ${testCategories}                | ${testProduct.productCategory} | ${0}
            ${'view'}  | ${[testProduct.productCategory]} | ${testProduct.productCategory} | ${0}
            ${'add'}   | ${testCategories}                | ${null}                        | ${3}
            ${'add'}   | ${[testProduct.productCategory]} | ${null}                        | ${2}
        `(
            `with category dropdown in $accessMode mode`,
            ({ accessMode, loadedCategories, expectedValue, expectedOptions }) => {
                it(`should load categories in a dropdown with the value of ${expectedValue} and ${expectedOptions} options`, fakeAsync(() => {
                    // category dropdown loads data
                    productCategoryFacade.findActive = jest.fn().mockImplementation(() => of(loadedCategories));
                    initialize(accessMode);
                    const categoryDropdown = fixture.debugElement
                        .query(By.directive(MatSelect))
                        .injector.get<MatSelect>(MatSelect as Type<MatSelect>);

                    // validate default value displayed with expected category
                    expect(categoryDropdown).toBeTruthy();
                    expect(categoryDropdown.value).toBe(expectedValue);

                    // validate dropdown options
                    categoryDropdown.open();
                    fixture.detectChanges();
                    const categoryDropdownOptions = fixture.debugElement
                        .queryAll(By.directive(MatOption))
                        .map((option) => option.injector.get<MatOption>(MatOption as Type<MatOption>));
                    expect(categoryDropdownOptions.length).toBe(expectedOptions);
                }));
            }
        );

        describe('Form', () => {
            describe.each`
                error                        | errorMessage
                ${{ categoryInvalid: true }} | ${' Category is inactive or a parent. Please select a new one or resolve category issues. '}
            `('with parent category', ({ error, errorMessage }) => {
                it('should display proper error', fakeAsync(() => {
                    initialize('edit');
                    // pre check; should be no mat-errors in DOM
                    expect(fixture.debugElement.query(By.directive(MatError))).toBeNull();
                    // set error for input
                    component.form.getControl('productCategory').setErrors(error);
                    fixture.detectChanges();
                    // verify error is getting rendered
                    const errorDirective = fixture.debugElement.query(By.directive(MatError)).nativeElement;
                    expect(errorDirective.innerHTML).toEqual(errorMessage);
                }));
            });
        });

        describe('checkIfProductIsAssigned', () => {
            describe.each([['view'], ['add']])('should not be called in', (accessMode: 'view' | 'add') => {
                it(`${accessMode} mode`, fakeAsync(() => {
                    initialize(accessMode);
                    expect(productFacade.isProductAssigned).not.toHaveBeenCalled();
                }));
            });

            describe('in edit mode', () => {
                it('should enable the active field if the product is not assigned', fakeAsync(() => {
                    initialize('edit');
                    expect(component.isProductAssigned).toBeFalsy();
                    expect(component.form.getControl('active').enabled).toBeTruthy();
                }));
                it('should not enable the active field if the product is assigned', fakeAsync(() => {
                    jest.spyOn(productFacade, 'isProductAssigned').mockReturnValueOnce(of(true));
                    initialize('edit');
                    expect(component.isProductAssigned).toBeTruthy();
                    expect(component.form.getControl('active').disabled).toBeTruthy();
                }));
            });
        });
    });

    describe('Product Information', () => {
        beforeEach(waitForAsync(() => {
            const product: Product = {
                code: 'G1055K6',
                productCategory: { code: 'SERP BELT', description: 'SERPENTINE BELT' },
                active: false,
                description: 'SRPNTINE BLT G1055K6',
                defaultUom: { id: 1, code: 'EACH', description: 'EA' },
            };
            jest.spyOn(productCategoryFacade, 'findActive').mockReturnValue(of([product.productCategory]));
            jest.spyOn(commonCodeFacade, 'findByType').mockReturnValue(of([product.defaultUom]));
            initialize('edit', product, false /* flushing via async() */);
        }));
        it.each`
            control              | value                            | enabled
            ${'code'}            | ${'G1055K6'}                     | ${false}
            ${'productCategory'} | ${'SERP BELT - SERPENTINE BELT'} | ${true}
            ${'active'}          | ${false}                         | ${true}
            ${'description'}     | ${'SRPNTINE BLT G1055K6'}        | ${true}
            ${'defaultUom'}      | ${'EA'}                          | ${true}
        `('formControl=$control should have value=$value, enabled=$enabled', ({ control, value, enabled }) => {
            expectInput(fixture, control).toHaveValue(value).toBeEnabled(enabled);
        });
    });

    describe('Inventory Information', () => {
        beforeEach(waitForAsync(() => {
            const product: Product = {
                code: testProduct.code,
                inventoryDescription: 'SRPNTINE BLT G1055K6',
                sapNumber: 'sap1',
                upc: 'vav1234',
                relatedProductCode: 'G1055K6',
                obsolete: false,
                bulk: false,
                tankStorage: false,
                description: 'SRPNTINE BLT G1055K6',
                type: { code: 'PTH', description: 'Others' },
                vendorType: { code: 'OUTSIDE_VENDOR"', description: 'Outside Vendor' },
            };
            jest.spyOn(commonCodeFacade, 'findByType').mockImplementation((type) => {
                if (type === 'PRODTYPE') {
                    return of([product.type]);
                } else if (type === 'VENDOR_TYPE') {
                    return of([product.vendorType]);
                }
            });
            initialize('edit', product, false /* flushing via async() */);
        }));
        it.each`
            control                   | value
            ${'inventoryDescription'} | ${'SRPNTINE BLT G1055K6'}
            ${'sapNumber'}            | ${'sap1'}
            ${'upc'}                  | ${'vav1234'}
            ${'relatedProductCode'}   | ${'G1055K6'}
            ${'obsolete'}             | ${false}
            ${'bulk'}                 | ${false}
            ${'tankStorage'}          | ${false}
            ${'type'}                 | ${'Others'}
            ${'vendorType'}           | ${'Outside Vendor'}
        `('formControl=$control should have value=$value', ({ control, value }) => {
            expectInput(fixture, control).toHaveValue(value).toBeEnabled();
        });
    });

    describe('Reporting', () => {
        beforeEach(waitForAsync(() => {
            const product: Product = {
                reportOrder: 'FRAN',
                fluidGroup: { code: '10W30', description: '10W30' },
            };
            jest.spyOn(commonCodeFacade, 'findByType').mockReturnValue(of([product.fluidGroup]));
            initialize('edit', product, false /* flushing via async() */);
        }));
        it.each`
            control          | value
            ${'reportOrder'} | ${'FRAN'}
            ${'fluidGroup'}  | ${'10W30'}
        `('formControl=$control should have value=$value', ({ control, value }) => {
            expectInput(fixture, control).toHaveValue(value).toBeEnabled();
        });
    });

    describe('Motor Product Keys', () => {
        const product: Product = {
            productMotorMapping: [
                { id: 1, motorKey: 'motorKey1' },
                { id: 2, motorKey: 'motorKey2' },
            ],
        };

        it('should display', fakeAsync(() => {
            initialize('edit', product);
            const motorKeys = fixture.debugElement.queryAll(By.css('input[formControlName=motorKey]'));
            expect(motorKeys[0].nativeElement.value).toEqual('motorKey1');
            expect(motorKeys[0].nativeElement.disabled).toBeFalsy();
            expect(motorKeys[1].nativeElement.value).toEqual('motorKey2');
            expect(motorKeys[1].nativeElement.disabled).toBeFalsy();
        }));

        describe('add and remove buttons', () => {
            const findAddButton = () => fixture.debugElement.query(By.css('.add-button:not(.hidden)'));
            const findRemoveButtons = () => fixture.debugElement.queryAll(By.css('.remove-button:not(.hidden)'));

            it('should display one add button and 2 remove buttons for 2 productMotorMappings', fakeAsync(() => {
                initialize('edit', product);
                const addButtons = fixture.debugElement.queryAll(By.css('.add-button'));
                expect(addButtons.length).toBe(2); // 2 expected but 1 will be hidden
                expect(addButtons.filter((addButton) => !addButton.classes.hidden).length).toBe(1);
                expect(findRemoveButtons().length).toBe(2);
            }));

            it('should display the template if no productMotorMapping is present', fakeAsync(() => {
                initialize('edit');
                expect(findAddButton()).not.toBeNull();
            }));

            it('should be disabled in view mode ', fakeAsync(() => {
                initialize('view', product);
                expect(findAddButton().nativeElement.disabled).toBeTruthy();
                expect(findRemoveButtons().length).toBe(0);
            }));
        });
    });

    describe('Action Bar', () => {
        describe.each`
            accessMode    | saveDisplayed | applyDisplayed | cancelDisplayed | addLikeDisplayed | hasAddRole
            ${'view'}     | ${false}      | ${false}       | ${true}         | ${true}          | ${true}
            ${'edit'}     | ${true}       | ${true}        | ${true}         | ${true}          | ${true}
            ${'add'}      | ${true}       | ${true}        | ${true}         | ${false}         | ${true}
            ${'add-like'} | ${true}       | ${true}        | ${true}         | ${false}         | ${true}
            ${'view'}     | ${false}      | ${false}       | ${true}         | ${false}         | ${false}
            ${'edit'}     | ${true}       | ${true}        | ${true}         | ${false}         | ${false}
        `('in $accessMode mode', ({ accessMode, saveDisplayed, applyDisplayed, cancelDisplayed, hasAddRole }) => {
            const verifyDisplayedState = (element: DebugElement, shouldBeDisplayed: boolean) => {
                jest.spyOn(component['roleFacade'], 'hasAnyRole').mockReturnValue(of(hasAddRole));
                initialize(accessMode);
                if (shouldBeDisplayed) {
                    expect(element).toBeDefined();
                } else {
                    expect(element).toBeNull();
                }
            };

            it(`should ${saveDisplayed ? '' : 'not'} display the save button`, fakeAsync(() => {
                verifyDisplayedState(getSaveActionButton(fixture), saveDisplayed);
            }));
            it(`should ${applyDisplayed ? '' : 'not'} display the apply button`, fakeAsync(() => {
                verifyDisplayedState(getApplyActionButton(fixture), applyDisplayed);
            }));
            it(`should ${cancelDisplayed ? '' : 'not'} display the cancel button`, fakeAsync(() => {
                verifyDisplayedState(getCancelActionButton(fixture), cancelDisplayed);
            }));
        });

        describe.each`
            formState    | saveEnabled | applyEnabled | cancelEnabled | addLikeEnabled | hasAddRole
            ${'valid'}   | ${true}     | ${true}      | ${true}       | ${true}        | ${true}
            ${'invalid'} | ${false}    | ${false}     | ${true}       | ${false}       | ${true}
            ${'valid'}   | ${true}     | ${true}      | ${true}       | ${false}       | ${false}
            ${'invalid'} | ${false}    | ${false}     | ${true}       | ${false}       | ${false}
        `(`with $formState form`, ({ formState, saveEnabled, applyEnabled, cancelEnabled, hasAddRole }) => {
            beforeEach(waitForAsync(() => {
                jest.spyOn(component['roleFacade'], 'hasAnyRole').mockReturnValue(of(hasAddRole));
                initialize('edit', testProduct, false);
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
            let messageFacade: MessageFacade;
            let routerService: RouterService;
            let router: Router;
            const verifySaveAndMessage = (code = testProduct.code) => {
                expect(component.productFacade.save).toHaveBeenCalled();
                expect(messageFacade.addMessage).toHaveBeenCalledWith({
                    message: `Product ${code} saved successfully`,
                    severity: 'info',
                });
            };

            beforeEach(() => {
                productFacade.save = jest.fn(() => of(null));
                messageFacade = TestBed.inject(MessageFacade);
                routerService = TestBed.inject(RouterService);
                router = TestBed.inject(Router);
            });

            describe('with save button', () => {
                it('should trigger save only once on multiple clicks', fakeAsync(() => {
                    initialize('edit');
                    getSaveActionButton(fixture).nativeElement.click();
                    getSaveActionButton(fixture).nativeElement.click();
                    getSaveActionButton(fixture).nativeElement.click();
                    tick(600);
                    fixture.detectChanges();
                    expect(component.productFacade.save).toHaveBeenCalledTimes(1);
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
                    productFacade.save = jest.fn(() => saveSubject);
                    initialize('edit');
                    getSaveActionButton(fixture).nativeElement.click();
                    tick(600);
                    fixture.detectChanges();
                    expect(component.isLoading).toBeTruthy();

                    saveSubject.next(null);
                    flush();

                    expect(component.isLoading).toBeFalsy();
                }));

                it('should cancel loading overlay if an error occurs', fakeAsync(() => {
                    const saveSubject = new Subject();
                    productFacade.save = jest.fn(() => saveSubject);
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
                it('should trigger save only once on multiple clicks', fakeAsync(() => {
                    initialize('edit');
                    getApplyActionButton(fixture).nativeElement.click();
                    getApplyActionButton(fixture).nativeElement.click();
                    getApplyActionButton(fixture).nativeElement.click();
                    tick(600);
                    fixture.detectChanges();
                    tick(600); // second tick to empty queue
                    expect(component.productFacade.save).toHaveBeenCalledTimes(1);
                }));

                it('should reload model in edit mode', fakeAsync(() => {
                    initialize('edit');
                    jest.spyOn(component, 'ngOnInit');
                    getApplyActionButton(fixture).nativeElement.click();
                    tick(600);
                    fixture.detectChanges();
                    flush();
                    verifySaveAndMessage();
                    expect(component.ngOnInit).toHaveBeenCalled();
                }));

                it('should navigate to the edit page when in add mode', fakeAsync(() => {
                    initialize('add');
                    const testCode = 'TESTCODE';
                    component.form.patchControlValue('code', testCode);
                    component.apply(); // Calling apply directly because there's not a way to intialize a valid form in add mode
                    fixture.detectChanges();
                    verifySaveAndMessage(testCode);
                    expect(component.form).toBeFalsy();
                    expect(router.navigate).toHaveBeenCalledWith(
                        [`/maintenance/product/edit/${testCode}`],
                        expect.anything()
                    );
                }));

                it('should show loading overlay when processing', fakeAsync(() => {
                    const applySubject = new Subject();
                    productFacade.save = jest.fn(() => applySubject);
                    initialize('edit');
                    getApplyActionButton(fixture).nativeElement.click();
                    tick(600);
                    fixture.detectChanges();
                    expect(component.isLoading).toBeTruthy();

                    applySubject.next(null);
                    expect(component.isLoading).toBeFalsy();
                }));

                it('should cancel loading overlay if an error occurs', fakeAsync(() => {
                    const applySubject = new Subject();
                    productFacade.save = jest.fn(() => applySubject);
                    initialize('edit');
                    getApplyActionButton(fixture).nativeElement.click();
                    tick(600);
                    fixture.detectChanges();

                    expect(component.isLoading).toBeTruthy();

                    expect(() => {
                        applySubject.error('An error occurred');
                        flush();
                    }).toThrow();

                    expect(component.isLoading).toBeFalsy();
                }));
            });

            describe('with add like button', () => {
                it('should be disabled if the form is dirty', fakeAsync(() => {
                    jest.spyOn(component['roleFacade'], 'hasAnyRole').mockReturnValue(of(true));
                    initialize('edit');
                    fixture.detectChanges();
                    component.form.markAsDirty();
                    fixture.detectChanges();
                    flush();

                    expect(getAddLikeActionButton(fixture)).not.toBeNull();
                    expect(getAddLikeActionButton(fixture).attributes.disabled).toBe('true');
                }));

                it('should navigate to the add-like page', fakeAsync(() => {
                    initialize('edit', testProduct);
                    component.addLike();
                    expect(router.navigate).toHaveBeenCalledWith([`/maintenance/product/add-like`, testProduct.code]);
                }));
            });
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
