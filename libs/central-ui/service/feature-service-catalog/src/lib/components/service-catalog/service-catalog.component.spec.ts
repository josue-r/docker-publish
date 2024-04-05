import { HttpClient } from '@angular/common/http';
import { DebugElement } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, ActivatedRouteSnapshot, convertToParamMap, Router } from '@angular/router';
import { ProductCategoryFacade } from '@vioc-angular/central-ui/product/data-access-product-category';
import { Service, ServiceFacade, ServiceProduct } from '@vioc-angular/central-ui/service/data-access-service';
import { ServiceCategoryFacade } from '@vioc-angular/central-ui/service/data-access-service-category';
import { RouterService } from '@vioc-angular/central-ui/util-router';
import { AccessMode } from '@vioc-angular/security/util-authorization';
import { MessageFacade } from '@vioc-angular/shared/data-access-message';
import { UiActionBarModule } from '@vioc-angular/shared/ui-action-bar';
import { UiAddRemoveButtonModule } from '@vioc-angular/shared/ui-add-remove-button';
import { UiAuditModule } from '@vioc-angular/shared/ui-audit';
import { MockLoadingOverlayComponent, UiLoadingMockModule } from '@vioc-angular/shared/ui-loading';
import { GATEWAY_TOKEN } from '@vioc-angular/shared/util-api';
import { FormFactory, UtilFormModule } from '@vioc-angular/shared/util-form';
import {
    getAddLikeActionButton,
    getApplyActionButton,
    getCancelActionButton,
    getSaveActionButton,
} from '@vioc-angular/test/util-test';
import { of, Subject } from 'rxjs';
import { ServiceCatalogModuleForms } from './../../service-catalog-module-forms';
import { ServiceCatalogComponent } from './service-catalog.component';
import { CommonFunctionalityModule, Described } from '@vioc-angular/shared/common-functionality';

describe('ServiceCatalogComponent', () => {
    let component: ServiceCatalogComponent;
    let fixture: ComponentFixture<ServiceCatalogComponent>;
    let serviceFacade: ServiceFacade;
    let serviceCategoryFacade: ServiceCategoryFacade;
    let productCategoryFacade: ProductCategoryFacade;
    let formFactory: FormFactory;
    let messageFacade: MessageFacade;

    const genericDescribed: Described = { id: 0, code: 'D', description: 'Described', version: 0 };

    let serviceStub: Service;
    const serviceProductStub1: ServiceProduct = {
        id: { productCategoryId: 0, serviceId: 0 },
        productCategory: genericDescribed,
        defaultQuantity: null,
        version: null,
    };
    const serviceProductStub2: ServiceProduct = {
        id: { productCategoryId: 1, serviceId: 0 },
        productCategory: genericDescribed,
        defaultQuantity: 1,
        version: null,
    };

    const serviceCategoryStub: Described[] = [{ ...genericDescribed, code: 'SC' }];
    const productCategoryStub: Described[] = [{ ...genericDescribed, code: 'PC' }];

    const routeParams = new Subject();
    const parentRoute: ActivatedRoute = new ActivatedRoute();

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ServiceCatalogComponent],
            imports: [
                ReactiveFormsModule,
                UiLoadingMockModule,
                UiAddRemoveButtonModule,
                UiActionBarModule,
                NoopAnimationsModule,
                ReactiveFormsModule,
                MatOptionModule,
                MatCheckboxModule,
                MatFormFieldModule,
                MatSelectModule,
                MatInputModule,
                MatButtonModule,
                UtilFormModule,
                UiAuditModule,
                CommonFunctionalityModule,
            ],
            providers: [
                FormFactory,
                { provide: HttpClient, useValue: {} },
                { provide: ActivatedRoute, useValue: { params: routeParams, parent: parentRoute } },
                { provide: RouterService, useValue: { navigateToSearchPage: jest.fn() } },
                { provide: Router, useValue: { navigate: jest.fn() } },
                { provide: MessageFacade, useValue: new MessageFacade(null) },
                { provide: GATEWAY_TOKEN, useValue: '//gateway/' },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        serviceStub = {
            id: 123,
            version: 0,
            updatedBy: 'nobody',
            updatedOn: new Date().toString(),
            active: true,
            code: 'S',
            description: 'Desc',
            requiresApproval: false,
            serviceCategory: { id: 0, code: 'CATCD', description: 'Category Description', version: 0 },
            serviceProducts: [],
            supportsQuickInvoice: false,
            supportsQuickSale: false,
            supportsRefillInvoice: false,
            supportsRegularInvoice: false,
            supportsTireCheckInvoice: false,
            supportsECommerce: true,
        };

        fixture = TestBed.createComponent(ServiceCatalogComponent);
        messageFacade = TestBed.inject(MessageFacade);
        component = fixture.componentInstance;
        serviceFacade = component.serviceFacade;
        serviceCategoryFacade = component.serviceCategoryFacade;
        productCategoryFacade = component.productCategoryFacade;
        formFactory = TestBed.inject(FormFactory);
        ServiceCatalogModuleForms.registerForms(formFactory, TestBed.inject(FormBuilder));

        // Create common mocking
        jest.spyOn(messageFacade, 'addMessage').mockImplementation();

        // Mock Facade calls
        jest.spyOn(serviceFacade, 'findByCode').mockImplementation(() => of(serviceStub));
        jest.spyOn(component, 'isAssignedToAnyStores').mockImplementation(() => of(true));
        jest.spyOn(serviceFacade, 'checkIfActiveAtStoreOrCompany').mockImplementation(() => of(true));
        jest.spyOn(serviceCategoryFacade, 'findActive').mockImplementation(() => of(serviceCategoryStub));
        jest.spyOn(productCategoryFacade, 'findActive').mockImplementation(() => of(productCategoryStub));
    });

    const initialize = (accessMode: AccessMode, andFlush = true, service = serviceStub) => {
        const route = TestBed.inject(ActivatedRoute);
        if (accessMode === AccessMode.ADD) {
            route.snapshot = {
                paramMap: convertToParamMap({
                    accessMode: 'add',
                }),
            } as ActivatedRouteSnapshot;
            fixture.detectChanges();
        } else {
            const serviceCode = service.code;
            route.snapshot = {
                paramMap: convertToParamMap({
                    accessMode: accessMode.urlSegement,
                    serviceCode,
                }),
            } as ActivatedRouteSnapshot;
            fixture.detectChanges();
            if (andFlush) {
                flush();
            }
        }
    };
    const verifyFormLoaded = (expected = serviceStub) => {
        // just test a subset of fields
        expect(component.form.get('id').value).toEqual(expected.id);
        expect(component.form.get('code').value).toEqual(expected.code);

        expect(component.serviceProductsFormArray.controls.length).toEqual(expected.serviceProducts.length);

        for (let i = 0; i < expected.serviceProducts.length; i++) {
            const control = component.serviceProductsFormArray.controls[i];
            const serviceProduct = expected.serviceProducts[i];
            expect(control.get('id').value).toEqual(serviceProduct.id);
            expect(control.get('productCategory').value).toEqual(serviceProduct.productCategory);
            expect(control.get('defaultQuantity').value).toEqual(serviceProduct.defaultQuantity);
            expect(control.get('version').value).toEqual(serviceProduct.version);
        }
    };

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display loading overlay if isLoading', fakeAsync(() => {
        initialize(AccessMode.EDIT);
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
            initialize(AccessMode.EDIT);
            fixture.debugElement.query(By.css('#cancel-action')).nativeElement.click();

            expect(router.navigate).toHaveBeenCalledWith(['search'], {
                relativeTo: TestBed.inject(ActivatedRoute).parent,
            });
        }));
    });

    describe('ngOnInit', () => {
        it('should create the formm, capture the model, and load the categories ', fakeAsync(() => {
            initialize(AccessMode.EDIT, false);

            let serviceCategories: Described[];
            component.serviceCategories$.subscribe((categories) => (serviceCategories = categories));
            flush();

            let productCategories: Described[];
            component.productCategories$.subscribe((categories) => (productCategories = categories));
            flush();

            fixture.detectChanges();

            expect(component.model).toEqual(serviceStub);
            expect(component.form).toBeTruthy();
            expect(serviceCategories).toMatchObject(serviceCategoryStub);
            expect(productCategories).toMatchObject(productCategoryStub);
        }));

        it('should build the form from the route params', fakeAsync(() => {
            jest.spyOn(component, 'createForm').mockImplementation();

            initialize(AccessMode.EDIT);

            expect(component.createForm).toHaveBeenCalledWith(serviceStub);
        }));

        describe.each`
            formAccessMode | formEnabled
            ${'view'}      | ${false}
            ${'edit'}      | ${true}
        `(`with $formAccessMode access`, ({ formAccessMode, formEnabled }) => {
            describe.each`
                hasServiceProducts
                ${true}
                ${false}
            `(`should create and load an ${formEnabled ? 'en' : 'dis'}abled form`, (hasServiceProducts) => {
                it(`${hasServiceProducts ? 'with' : 'without'} service-products`, fakeAsync(() => {
                    jest.spyOn(component, 'isAssignedToAnyStores').mockImplementation(() => of(false));
                    if (hasServiceProducts) {
                        serviceStub.serviceProducts.push(serviceProductStub1);
                        serviceStub.serviceProducts.push(serviceProductStub2);
                    }
                    initialize(AccessMode.of(formAccessMode));

                    fixture.detectChanges();

                    verifyFormLoaded();
                    expect(component.form.enabled).toEqual(formEnabled);
                    expect(component.form.disabled).toEqual(!formEnabled);
                    if (hasServiceProducts) {
                        component.serviceProductsFormArray.controls.forEach((control) =>
                            expect(control.enabled).toEqual(formEnabled)
                        );
                        expect(component.serviceProductsFormArray.length).toEqual(2);
                    } else {
                        expect(component.serviceProductsFormArray.length).toEqual(0);
                    }

                    if (formAccessMode === 'edit') {
                        expect(component.isAssignedToAnyStores).toHaveBeenCalled();
                    } else {
                        expect(component.isAssignedToAnyStores).not.toHaveBeenCalled();
                    }
                }));
            });

            it(`should have ${formAccessMode === 'edit' ? 'en' : 'dis'}abled checkboxes`, fakeAsync(() => {
                initialize(AccessMode.of(formAccessMode));

                expect(component.form.get('requiresApproval').enabled).toEqual(formEnabled);
                expect(component.form.get('supportsRegularInvoice').enabled).toEqual(formEnabled);
                expect(component.form.get('supportsQuickInvoice').enabled).toEqual(formEnabled);
                expect(component.form.get('supportsQuickSale').enabled).toEqual(formEnabled);
                expect(component.form.get('supportsRefillInvoice').enabled).toEqual(formEnabled);
                expect(component.form.get('supportsTireCheckInvoice').enabled).toEqual(formEnabled);
            }));
        });

        describe('with update access', () => {
            describe.each`
                checkboxEnabled | serviceActive
                ${true}         | ${false}
                ${false}        | ${true}
            `(`should have active checkbox`, ({ checkboxEnabled, serviceActive }) => {
                it(`${checkboxEnabled ? 'en' : 'dis'}abled if service is ${
                    serviceActive ? '' : 'in'
                }active`, fakeAsync(() => {
                    jest.spyOn(serviceFacade, 'checkIfActiveAtStoreOrCompany').mockImplementation(() =>
                        of(serviceActive)
                    );
                    initialize(AccessMode.EDIT, false);
                    serviceStub.active = serviceActive;

                    fixture.detectChanges();
                    flush();

                    expect(component.form.get('active').enabled).toEqual(checkboxEnabled);
                }));
            });

            it('should mark as unsaved changed if form is dirty', fakeAsync(() => {
                initialize(AccessMode.EDIT);
                expect(component.unsavedChanges).toBeFalsy();
                component.form.markAsDirty();
                expect(component.unsavedChanges).toBeTruthy();
            }));
        });

        describe('checkIfActiveAtStoreOrCompany', () => {
            it('should not be called in view mode', fakeAsync(() => {
                initialize(AccessMode.VIEW);
                expect(serviceFacade.checkIfActiveAtStoreOrCompany).not.toHaveBeenCalled();
            }));

            describe('in edit mode', () => {
                it('should enable the active field if the service is not assigned', fakeAsync(() => {
                    jest.spyOn(serviceFacade, 'checkIfActiveAtStoreOrCompany').mockReturnValueOnce(of(false));
                    initialize(AccessMode.EDIT);
                    expect(component.form.getControl('active').enabled).toBeTruthy();
                }));
                it('should not enable the active field if the service is assigned', fakeAsync(() => {
                    jest.spyOn(serviceFacade, 'checkIfActiveAtStoreOrCompany').mockReturnValueOnce(of(true));
                    initialize(AccessMode.EDIT);
                    expect(component.form.getControl('active').disabled).toBeTruthy();
                }));
            });
        });

        describe.each`
            formAccessMode
            ${'add'}
            ${'add-like'}
        `(`with $formAccessMode access`, ({ formAccessMode }) => {
            it(`should create ${
                formAccessMode === 'add' ? 'empty form using a blank service' : 'form using passed in service code'
            } `, () => {
                const newService = {
                    id: undefined,
                    code: undefined,
                    version: undefined,
                    updatedBy: undefined,
                    updatedOn: undefined,
                    supportsECommerce: formAccessMode === 'add' ? false : serviceStub.supportsECommerce,
                    serviceCategory: formAccessMode === 'add' ? undefined : serviceStub.serviceCategory,
                    description: formAccessMode === 'add' ? undefined : serviceStub.description,
                    active: formAccessMode === 'add' ? true : serviceStub.active,
                    requiresApproval: formAccessMode === 'add' ? true : serviceStub.requiresApproval,
                    supportsQuickSale: formAccessMode === 'add' ? false : serviceStub.supportsQuickSale,
                    supportsQuickInvoice: formAccessMode === 'add' ? false : serviceStub.supportsQuickInvoice,
                    supportsRegularInvoice: formAccessMode === 'add' ? false : serviceStub.supportsRegularInvoice,
                    supportsRefillInvoice: formAccessMode === 'add' ? false : serviceStub.supportsRefillInvoice,
                    supportsTireCheckInvoice: formAccessMode === 'add' ? false : serviceStub.supportsTireCheckInvoice,
                    serviceProducts: formAccessMode === 'add' ? [] : serviceStub.serviceProducts,
                };

                const testAccessMode = AccessMode.of(formAccessMode);
                initialize(testAccessMode, false);
                jest.spyOn(component, 'isAssignedToAnyStores').mockImplementation(() => of(testAccessMode.isAddLike));

                component.ngOnInit();

                expect(component.model).toEqual(newService);
            });
        });
    });

    describe('with action bar', () => {
        describe.each`
            accessMode    | hasAddRole | addLikeVisible | saveVisible | applyVisible | cancelVisible
            ${'view'}     | ${true}    | ${true}        | ${false}    | ${false}     | ${true}
            ${'view'}     | ${false}   | ${false}       | ${false}    | ${false}     | ${true}
            ${'add-like'} | ${true}    | ${false}       | ${true}     | ${true}      | ${true}
            ${'edit'}     | ${true}    | ${true}        | ${true}     | ${true}      | ${true}
            ${'edit'}     | ${false}   | ${false}       | ${true}     | ${true}      | ${true}
            ${'add'}      | ${true}    | ${false}       | ${true}     | ${true}      | ${true}
        `(
            `with accessMode=$accessMode`,
            ({ accessMode, hasAddRole, addLikeVisible, saveVisible, applyVisible, cancelVisible }) => {
                beforeEach(() => {
                    jest.spyOn(component['roleFacade'], 'hasAnyRole').mockReturnValue(of(hasAddRole));
                    initialize(AccessMode.of(accessMode), false);
                });

                function testVisibility(button: DebugElement, visible: boolean) {
                    if (visible) {
                        expect(button).toBeTruthy();
                    } else {
                        expect(button).toBeFalsy();
                    }
                }

                it(`add like button should be ${addLikeVisible ? '' : 'not '}visible`, () => {
                    testVisibility(getAddLikeActionButton(fixture), addLikeVisible);
                });

                it(`save button should be ${saveVisible ? '' : 'not '}visible`, () => {
                    testVisibility(getSaveActionButton(fixture), saveVisible);
                });

                it(`apply button should be ${applyVisible ? '' : 'not '}visible`, () => {
                    testVisibility(getApplyActionButton(fixture), applyVisible);
                });

                it(`cancel button should be ${cancelVisible ? '' : 'not '}visible`, () => {
                    testVisibility(getCancelActionButton(fixture), cancelVisible);
                });
            }
        );

        describe.each`
            formState    | addLikeDisabled | saveDisabled | applyDisabled | cancelDisabled
            ${'valid'}   | ${false}        | ${false}     | ${false}      | ${false}
            ${'invalid'} | ${true}         | ${true}      | ${true}       | ${false}
        `(`with $formState form`, ({ formState, addLikeDisabled, saveDisabled, applyDisabled, cancelDisabled }) => {
            beforeEach(() => {
                jest.spyOn(component['roleFacade'], 'hasAnyRole').mockReturnValue(of(true));
                initialize(AccessMode.EDIT, false);
                if (formState !== 'valid') {
                    component.form.setErrors({ invalid: true });
                }
                fixture.detectChanges();
            });

            it(`add like should be ${addLikeDisabled ? '' : 'not '}disabled`, () => {
                expect(getAddLikeActionButton(fixture).nativeElement.disabled).toBe(addLikeDisabled);
            });

            it(`save button should be ${saveDisabled ? '' : 'not '}disabled`, () => {
                expect(getSaveActionButton(fixture).nativeElement.disabled).toBe(saveDisabled);
            });

            it(`apply button should be ${applyDisabled ? '' : 'not '}disabled`, () => {
                expect(getApplyActionButton(fixture).nativeElement.disabled).toBe(applyDisabled);
            });

            it(`cancel button should be ${cancelDisabled ? '' : 'not '}disabled`, () => {
                expect(getCancelActionButton(fixture).nativeElement.disabled).toBe(cancelDisabled);
            });
        });

        describe('actions buttons', () => {
            describe('save button', () => {
                it('should save on click and navigateToSearchPage have been called ', fakeAsync(() => {
                    const routerService = TestBed.inject(RouterService);
                    jest.spyOn(serviceFacade, 'save').mockReturnValue(of({}));

                    initialize(AccessMode.EDIT);
                    getSaveActionButton(fixture).nativeElement.click();
                    tick(600);
                    expect(serviceFacade.save).toHaveBeenCalled();
                    expect(routerService.navigateToSearchPage).toHaveBeenCalled();
                }));

                it('should only call save once, even with double clicks', fakeAsync(() => {
                    initialize(AccessMode.EDIT);
                    jest.spyOn(component.serviceFacade, 'save').mockReturnValue(of({}));
                    getSaveActionButton(fixture).nativeElement.click();
                    getSaveActionButton(fixture).nativeElement.click();
                    tick(600);
                    fixture.detectChanges();

                    expect(component.serviceFacade.save).toHaveBeenCalledTimes(1);
                }));

                it('should show loading overlay when processing', fakeAsync(() => {
                    const saveSubject = new Subject();
                    serviceFacade.save = jest.fn(() => saveSubject);
                    initialize(AccessMode.EDIT);
                    getSaveActionButton(fixture).nativeElement.click();
                    tick(600);

                    expect(component.isLoading).toBeTruthy();

                    saveSubject.next(null);

                    expect(component.isLoading).toBeFalsy();
                }));

                it('should cancel loading overlay if an error occurs', fakeAsync(() => {
                    const saveSubject = new Subject();
                    serviceFacade.save = jest.fn(() => saveSubject);
                    initialize(AccessMode.EDIT);
                    getSaveActionButton(fixture).nativeElement.click();
                    tick(600);
                    fixture.detectChanges();
                    expect(component.isLoading).toBeTruthy();

                    expect(() => {
                        saveSubject.error('An error occurred');
                        flush();
                    }).toThrow();

                    expect(component.isLoading).toBeFalsy();
                }));
            });

            describe('apply button', () => {
                it('apply button should save and reload on click ', fakeAsync(() => {
                    initialize(AccessMode.EDIT);
                    jest.spyOn(component.saveFacade, 'apply').mockReturnValue(of({}));

                    const serviceCode = 'testCode';

                    component.form.patchControlValue('code', serviceCode);
                    getApplyActionButton(fixture).nativeElement.click();
                    tick(600);

                    expect(component.saveFacade.apply).toHaveBeenCalled();
                }));

                it('should only call apply once, even with double clicks', fakeAsync(() => {
                    initialize(AccessMode.EDIT);
                    jest.spyOn(component.saveFacade, 'apply').mockReturnValue(of({}));
                    getApplyActionButton(fixture).nativeElement.click();
                    getApplyActionButton(fixture).nativeElement.click();
                    tick(600);

                    expect(component.saveFacade.apply).toHaveBeenCalledTimes(1);
                }));

                it('should show loading overlay when processing', fakeAsync(() => {
                    const saveSubject = new Subject();
                    serviceFacade.save = jest.fn(() => saveSubject);
                    initialize(AccessMode.EDIT);
                    getApplyActionButton(fixture).nativeElement.click();
                    tick(600);

                    expect(component.isLoading).toBeTruthy();

                    saveSubject.next(null);

                    expect(component.isLoading).toBeFalsy();
                }));

                it('should cancel loading overlay if an error occurs', fakeAsync(() => {
                    const saveSubject = new Subject();
                    serviceFacade.save = jest.fn(() => saveSubject);
                    initialize(AccessMode.EDIT);
                    getApplyActionButton(fixture).nativeElement.click();
                    tick(600);

                    expect(component.isLoading).toBeTruthy();

                    expect(() => {
                        saveSubject.error('An error occurred');
                        flush();
                    }).toThrow();

                    expect(component.isLoading).toBeFalsy();
                }));

                it('should navigate to new service edit page if add-like', fakeAsync(() => {
                    initialize(AccessMode.ADD_LIKE, false);
                    jest.spyOn(serviceFacade, 'save').mockReturnValue(of({}));
                    const router = TestBed.inject(Router);
                    jest.spyOn(router, 'navigate');

                    component.form.patchControlValue('code', 'S123');
                    tick(600);
                    fixture.detectChanges();
                    expect(getApplyActionButton(fixture).nativeElement.disabled).toBeFalsy();
                    getApplyActionButton(fixture).nativeElement.click();
                    tick(600);

                    expect(router.navigate).toHaveBeenCalledWith([`/maintenance/service/edit/S123`], {
                        relativeTo: parentRoute,
                    });
                }));
            });

            describe('add like button', () => {
                it('button should navigate to add like page', fakeAsync(() => {
                    jest.spyOn(component['roleFacade'], 'hasAnyRole').mockReturnValue(of(true));
                    const router = TestBed.inject(Router);
                    initialize(AccessMode.EDIT);
                    const serviceCode = component.model.code;
                    getAddLikeActionButton(fixture).nativeElement.click();
                    tick(600);
                    fixture.detectChanges();
                    expect(router.navigate).toHaveBeenCalledWith([`/maintenance/service/add-like/${serviceCode}`]);
                }));

                it('should only call add like once, even with double clicks', fakeAsync(() => {
                    jest.spyOn(component['roleFacade'], 'hasAnyRole').mockReturnValue(of(true));
                    const router = TestBed.inject(Router);
                    initialize(AccessMode.EDIT);
                    getAddLikeActionButton(fixture).nativeElement.click();
                    getAddLikeActionButton(fixture).nativeElement.click();
                    tick(600);
                    fixture.detectChanges();
                    expect(router.navigate).toHaveBeenCalledTimes(1);
                }));
            });
        });
    });
});
