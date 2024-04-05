import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component, DebugElement, Input } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, ActivatedRouteSnapshot, Router, convertToParamMap } from '@angular/router';
import { DiscountOffer, Offer, OfferFacade, StoreDiscount } from '@vioc-angular/central-ui/discount/data-access-offers';
import { RouterService } from '@vioc-angular/central-ui/util-router';
import { AccessMode } from '@vioc-angular/security/util-authorization';
import { CommonFunctionalityModule, Described } from '@vioc-angular/shared/common-functionality';
import { MessageFacade } from '@vioc-angular/shared/data-access-message';
import { UiActionBarModule } from '@vioc-angular/shared/ui-action-bar';
import { UiAuditModule } from '@vioc-angular/shared/ui-audit';
import { UiDialogMockModule } from '@vioc-angular/shared/ui-dialog';
import { MockFilteredInputComponent, UiFilteredInputMockModule } from '@vioc-angular/shared/ui-filtered-input';
import { MockLoadingOverlayComponent, UiLoadingMockModule } from '@vioc-angular/shared/ui-loading';
import { UiSelectAndGoMockModule } from '@vioc-angular/shared/ui-select-and-go';
import { GATEWAY_TOKEN } from '@vioc-angular/shared/util-api';
import { FormFactory, TypedFormGroup, UtilFormModule } from '@vioc-angular/shared/util-form';
import {
    expectInput,
    getApplyActionButton,
    getCancelActionButton,
    getSaveActionButton,
} from '@vioc-angular/test/util-test';
import { ReplaySubject, Subject, of, throwError } from 'rxjs';
import { OfferModuleForms } from '../offer-module-forms';
import { OffersComponent } from './offers.component';

describe('OffersComponent', () => {
    let component: OffersComponent;
    let fixture: ComponentFixture<OffersComponent>;
    let offerFacade: OfferFacade;
    let messageFacade: MessageFacade;
    let componentDestroyed: ReplaySubject<any>;
    let formFactory: FormFactory;
    let formBuilder: FormBuilder;
    let routerService: RouterService;
    let router: Router;
    const routeParams = new Subject();

    const testStoreDiscount: StoreDiscount = {
        id: {
            storeId: 9870,
            discountId: '3',
        },
        store: {
            id: 9870,
            code: 'testStoreCode',
            description: 'Store',
            version: 0,
        },
        assigned: true,
    };

    const testCompany = {
        id: '11',
        code: 'VAL',
        description: 'Test Company VAL',
        version: 0,
    };
    const testDiscount = {
        id: '3',
        company: {
            id: '4',
            code: 'testCompanyCode',
            description: 'Company',
            version: 0,
        },
        startDate: '10-12-2022',
        endDate: '10-12-2023',
        code: 'testDiscountCode',
        description: 'Discount',
        type: {
            id: '5',
            code: 'testDiscountOfferType',
            description: 'Discount Offer Content Type',
            version: 0,
        },
        active: true,
        national: false,
        version: 0,
    };

    const testOffer: Offer = {
        id: '1',
        discountOffer: {
            id: '2',
            name: 'Offer Name',
            company: testCompany,
        },
        company: testCompany,
        discount: testDiscount,
        store: null,
        active: true,
        version: 0,
        daysToExpire: 1,
        expirationDate: null,
        name: 'Offer Name',
        amount: 5,
        amountFormat: {
            id: '6',
            code: 'dollar_off',
            description: 'Dollar Off',
            version: 0,
        },
        storeDiscounts: [testStoreDiscount],
        offerContent: {
            id: 7,
            name: 'Offer Name',
        },
        updatedBy: 'v123456',
        updatedOn: '10-12-2022',
    };

    const testAddOffer: Offer = {
        id: null,
        discountOffer: null,
        company: testCompany,
        discount: testDiscount,
        store: null,
        active: false,
        version: null,
        daysToExpire: 1,
        expirationDate: null,
        name: 'Offer Name',
        amount: 5,
        amountFormat: {
            id: '6',
            code: 'dollar_off',
            description: 'Dollar Off',
            version: 0,
        },
        storeDiscounts: [],
        offerContent: {
            id: 7,
            name: 'Offer Name',
        },
        updatedBy: null,
        updatedOn: null,
    };

    @Component({
        selector: 'vioc-angular-offer-stores',
        template: '',
    })
    class MockOfferStoresComponent {
        /** Control that maintains the selected value of the region filter. */
        regionControl = new FormControl();
        /** Control that maintains the selected value of the market filter. */
        marketControl = new FormControl();
        @Input() form: TypedFormGroup<Offer>;
        @Input() model: Offer;
        @Input() accessMode: AccessMode;
        @Input() initiateRegionSearch: Described;
        @Input() initiateMarketSearch: Described;
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [OffersComponent, MockOfferStoresComponent],
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
                UiSelectAndGoMockModule,
                UiFilteredInputMockModule,
                UiDialogMockModule,
                CommonFunctionalityModule,
            ],
            providers: [
                FormFactory,
                { provide: ActivatedRoute, useValue: { params: routeParams, parent: '/offers/search' } },
                { provide: Router, useValue: { navigate: jest.fn() } },
                { provide: RouterService, useValue: { navigateToSearchPage: jest.fn() } },
                { provide: MessageFacade, useValue: { addMessage: jest.fn() } },
                { provide: GATEWAY_TOKEN, useValue: '//gateway/' },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        OfferModuleForms.registerForms(TestBed.inject(FormFactory), TestBed.inject(FormBuilder));
        fixture = TestBed.createComponent(OffersComponent);
        component = fixture.componentInstance;
        formFactory = TestBed.inject(FormFactory);
        formBuilder = TestBed.inject(FormBuilder);
        routerService = TestBed.inject(RouterService);
        router = TestBed.inject(Router);
        offerFacade = component.offerFacade;
        componentDestroyed = new ReplaySubject(1);
        component.discountFacade.findByCodeAndCompany = jest.fn(() => of(null));
    });

    /** Initialize the the component with the given access mode and id. */
    const initialize = (accessMode: 'view' | 'edit' | 'add', model: Offer = testOffer, andflush = true) => {
        const route = TestBed.inject(ActivatedRoute);
        route.snapshot = {
            paramMap: convertToParamMap({
                accessMode: accessMode,
                offerId: model.id,
            }),
        } as ActivatedRouteSnapshot;

        const offer = { ...new Offer(), ...model };
        jest.spyOn(component.offerFacade, 'findById').mockReturnValue(of(offer));
        fixture.detectChanges();
        if (andflush) {
            flush();
        }
    };

    const verifySaveAndMessage = (model: Offer = testOffer) => {
        expect(offerFacade.save).toHaveBeenCalledWith(model);
        expect(messageFacade.addMessage).toHaveBeenCalledWith({
            message: `Offer ${model.id} saved successfully`,
            severity: 'info',
        });
    };

    const findById = (id: string) => fixture.debugElement.query(By.css(`#${id}`));

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('unsavedChanges', () => {
        it('should track if the form has been modified', fakeAsync(() => {
            initialize('edit');
            expect(component.unsavedChanges).toBeFalsy();
            component.form.markAsDirty();
            expect(component.unsavedChanges).toBeTruthy();
        }));
    });

    describe('onInit', () => {
        it('should display a loading overlay until the form is loaded', fakeAsync(() => {
            initialize('view');
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

        it.each`
            accessMode
            ${'add-like'}
        `('should throw and error with an unsupported accessMode: $accessMode', ({ accessMode }) => {
            const route = TestBed.inject(ActivatedRoute);
            route.snapshot = {
                paramMap: convertToParamMap({
                    accessMode: accessMode,
                    offerId: '1',
                }),
            } as ActivatedRouteSnapshot;

            expect(() => fixture.detectChanges()).toThrowError(`Unhandled Access Mode: ${accessMode}`);
        });

        describe.each`
            accessMode | formDisabled
            ${'edit'}  | ${false}
            ${'view'}  | ${true}
        `('with ${accessMode} access', ({ accessMode, formDisabled }) => {
            const initEntry = (access: 'edit' | 'view') => {
                initialize(access);
            };

            it('should load the correct model', fakeAsync(() => {
                jest.spyOn(offerFacade, 'findById');
                initialize(accessMode, { ...testOffer, discountOffer: new DiscountOffer() });
                expect(offerFacade.findById).toHaveBeenCalledWith(testOffer.id);
                expect(component.model.discountOffer.company).toBeDefined();
            }));

            it('should initialize the form', fakeAsync(() => {
                jest.spyOn(offerFacade, 'findById');
                initEntry(accessMode);
                expect(offerFacade.findById).toHaveBeenCalledWith(testOffer.id);
                expect(component.form).toBeTruthy();
                expect(component.form.disabled).toEqual(formDisabled);
                expect(component.form.getRawValue()).toEqual(testOffer);
            }));

            it('should not initialize the form if one exists', fakeAsync(() => {
                jest.spyOn(formFactory, 'group');
                component.form = new TypedFormGroup<Offer>(
                    formBuilder.group(testOffer, { accessMode }),
                    componentDestroyed
                );
                initEntry(accessMode);
                expect(formFactory.group).not.toHaveBeenCalled();
            }));

            it('should display the stores table', fakeAsync(() => {
                initialize(accessMode);
                expect(fixture.debugElement.query(By.css('#store-table'))).toBeTruthy();
            }));
        });
    });

    describe('edit', () => {
        describe.each`
            field                    | disabled
            ${'company'}             | ${true}
            ${'discountCode'}        | ${true}
            ${'discountDescription'} | ${true}
            ${'startDate'}           | ${true}
            ${'endDate'}             | ${true}
            ${'active'}              | ${false}
            ${'offerContentType'}    | ${false}
            ${'amount'}              | ${false}
            ${'amountFormat'}        | ${false}
            ${'daysToExpire'}        | ${false}
            ${'expirationDays'}      | ${false}
        `('disable fields', ({ field, disabled }) => {
            it(`should ${disabled === true ? '' : 'not '}display a disabled input for ${field}`, fakeAsync(() => {
                initialize('edit');
                expectInput(fixture, { id: `${field}` }).toBeEnabled(!disabled);
            }));
        });
    });

    describe('Action Bar', () => {
        beforeEach(() => {
            offerFacade.save = jest.fn(() => of(null));
            messageFacade = TestBed.inject(MessageFacade);
            router = TestBed.inject(Router);
        });

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

        describe('apply button', () => {
            it('should save and reload the page', fakeAsync(() => {
                initialize('edit');
                jest.spyOn(component, 'ngOnInit');
                jest.spyOn(offerFacade, 'save').mockReturnValue(of(null));
                const storesComponent: MockOfferStoresComponent = fixture.debugElement.query(
                    By.directive(MockOfferStoresComponent)
                ).componentInstance;
                expect(storesComponent.initiateRegionSearch).toEqual(undefined);
                expect(storesComponent.initiateMarketSearch).toEqual(undefined);
                getApplyActionButton(fixture).nativeElement.click();
                tick(600); // tick to account for debounce time and time to re-enable button
                expect(offerFacade.save).toHaveBeenCalled();
                expect(component.ngOnInit).toHaveBeenCalled();
            }));

            it('should show loading overlay when processing', fakeAsync(() => {
                const applySubject = new Subject();
                offerFacade.save = jest.fn(() => applySubject);
                initialize('edit');
                const storesComponent: MockOfferStoresComponent = fixture.debugElement.query(
                    By.directive(MockOfferStoresComponent)
                ).componentInstance;
                expect(storesComponent.initiateRegionSearch).toEqual(undefined);
                expect(storesComponent.initiateMarketSearch).toEqual(undefined);
                getApplyActionButton(fixture).nativeElement.click();
                tick(600); // tick to account for debounce time and time to re-enable button
                expect(component.isLoading).toBeTruthy();

                applySubject.next(null);
                flush();

                expect(component.isLoading).toBeFalsy();
            }));
        });

        describe('save button', () => {
            it('should save and navigate back to the search page', fakeAsync(() => {
                jest.spyOn(component.saveFacade, 'save');
                initialize('edit');

                getSaveActionButton(fixture).nativeElement.click();
                tick(600); // tick to account for debounce time and time to re-enable button
                verifySaveAndMessage();
                expect(component.saveFacade.save).toHaveBeenCalledWith(component.form, testOffer, component['route']);

                expect(routerService.navigateToSearchPage).toHaveBeenCalled();
            }));

            it('should show loading overlay when processing', fakeAsync(() => {
                const saveSubject = new Subject();
                offerFacade.save = jest.fn(() => saveSubject);
                initialize('edit');
                getSaveActionButton(fixture).nativeElement.click();
                fixture.detectChanges();
                tick(600); // tick to account for debounce time and time to re-enable button
                expect(component.isLoading).toBeTruthy();

                saveSubject.next(null);
                flush();

                expect(component.isLoading).toBeFalsy();
            }));
        });

        describe('cancel button', () => {
            it.each`
                accessMode
                ${'view'}
                ${'edit'}
                ${'add'}
            `(
                'should redirect to the search screen in accessMode: $accessMode',
                fakeAsync(({ accessMode }) => {
                    initialize(accessMode);
                    expect(getCancelActionButton(fixture)).toBeTruthy();
                    getCancelActionButton(fixture).nativeElement.click();
                    expect(router.navigate).toHaveBeenCalledWith(['search'], {
                        relativeTo: TestBed.inject(ActivatedRoute).parent,
                    });
                })
            );
        });
    });

    describe('add mode', () => {
        const fieldsViewableAfterGenerated = [
            'discountDescription',
            'type',
            'startDate',
            'endDate',
            'active',
            'offerContentType',
            'amount',
            'amountFormat',
            'daysToExpire',
            'expirationDate',
        ];

        const setCompanyDropdown = (companyDropdown) => {
            companyDropdown.valueControl.setValue(testOffer.company);
            tick(200); // company value change logic has a 200 debounce time
            fixture.detectChanges();
        };

        const setRequiredFields = () => {
            component.form.setControlValue('offerContent', testOffer.offerContent);
            component.form.setControlValue('amount', testOffer.amount);
            component.form.setControlValue('amountFormat', testOffer.amountFormat);
            component.form.setControlValue('daysToExpire', testOffer.daysToExpire);
            fixture.detectChanges();
        };

        beforeEach(() => {
            offerFacade.save = jest.fn(() => of(testAddOffer));
            messageFacade = TestBed.inject(MessageFacade);
            router = TestBed.inject(Router);
        });

        it('should initially only render a select component with a company dropdown', fakeAsync(async () => {
            initialize('add');
            const addDiscountsSearch = findById('discount-search').nativeElement;
            const addDiscountsComponent = findById('discount-go').nativeElement;
            // Expecting only Company to be rendered
            fieldsViewableAfterGenerated.forEach((control) => expectInput(fixture, control).not.toBePresent());
            // Verify Company dropdowns
            const companyDropdown = findById('company-input').injector.get(MockFilteredInputComponent);
            // Initially, company is selectable and discount is disabled
            expect(companyDropdown.editable).toBeTruthy();
            expect(component.discountFacade.findByCodeAndCompany).not.toHaveBeenCalled();
            expect(addDiscountsSearch.disabled).toBeTruthy();
            expect(addDiscountsComponent.disabled).toBeTruthy();

            companyDropdown.valueControl.setValue(testOffer.company);
            tick(200); // company value change logic has a 200 debounce time
            fixture.detectChanges();
            // Discount search input should be enabled after selecting a company, discount go button should be disabled
            expect(component.form.getControlValue('company')).toEqual(testOffer.company);
            expect(addDiscountsSearch.disabled).toBeFalsy();
            expect(addDiscountsComponent.disabled).toBeTruthy();
        }));

        it('should throw an error when a discount is not found for the provided discount code and company', fakeAsync(async () => {
            jest.spyOn(component.discountFacade, 'findByCodeAndCompany').mockReturnValueOnce(throwError(new Error()));
            initialize('add');
            const companyDropdown = findById('company-input').injector.get(MockFilteredInputComponent);
            setCompanyDropdown(companyDropdown);

            component.discountCodeControl.setValue(testOffer.discount.code);
            fixture.detectChanges();

            const addDiscountsComponent = findById('discount-go');
            addDiscountsComponent.nativeElement.click();

            expect(component.messageFacade.addMessage).toHaveBeenCalledWith({
                message: `Discount ${testOffer.discount.code} not found for Company ${testOffer.company.code}`,
                severity: 'error',
            });
        }));

        it('should disable company and discount after selection', fakeAsync(async () => {
            jest.spyOn(component.discountFacade, 'findByCodeAndCompany').mockReturnValue(of(testOffer.discount));
            initialize('add');
            const companyDropdown = findById('company-input').injector.get(MockFilteredInputComponent);
            setCompanyDropdown(companyDropdown);

            component.discountCodeControl.setValue(testOffer.discount.code);
            fixture.detectChanges();

            const addDiscountsComponent = findById('discount-go');
            addDiscountsComponent.nativeElement.click();

            tick(100); // clear timers in queue
            expect(component.discountGenerated).toBeTruthy();
            expect(companyDropdown.editable).toEqual(false);
            expect(component.discountCodeControl.disabled).toBeTruthy();
        }));

        it('should default to the available company if the user only has access to a single company', fakeAsync(() => {
            const company = { id: 1, code: 'C1', description: 'Company 1' };
            jest.spyOn(component.resourceFacade, 'findCompaniesByRoles').mockReturnValue(
                of({ resources: [company], allCompanies: false })
            );
            initialize('add');
            tick(200); // company value change logic has a 200 debounce time
            expect(component.form.getControlValue('company')).toEqual(company);
        }));

        describe.each`
            formState    | saveEnabled | applyEnabled | cancelEnabled
            ${'valid'}   | ${true}     | ${true}      | ${true}
            ${'invalid'} | ${false}    | ${false}     | ${true}
        `(`with $formState form`, ({ formState, saveEnabled, applyEnabled, cancelEnabled }) => {
            beforeEach(fakeAsync(async () => {
                jest.spyOn(component.discountFacade, 'findByCodeAndCompany').mockReturnValue(of(testOffer.discount));
                initialize('add');
                if (formState === 'invalid') {
                    component.form.setErrors({ invalid: true });
                }
                if (formState === 'valid') {
                    // Create a valid form, all required fields should be populated
                    const companyDropdown = findById('company-input').injector.get(MockFilteredInputComponent);
                    setCompanyDropdown(companyDropdown);

                    component.discountCodeControl.setValue(testOffer.discount.code);
                    fixture.detectChanges();

                    const addDiscountsComponent = findById('discount-go');
                    addDiscountsComponent.nativeElement.click();
                    setRequiredFields();
                }
                fixture.detectChanges();
                tick(100); // clear timers in queue
            }));

            it(`save button should be ${saveEnabled ? 'en' : 'dis'}abled`, fakeAsync(async () => {
                expect(getSaveActionButton(fixture).nativeElement.disabled).toBe(!saveEnabled);
            }));
            it(`apply button should be ${applyEnabled ? 'en' : 'dis'}abled`, fakeAsync(async () => {
                expect(getApplyActionButton(fixture).nativeElement.disabled).toBe(!applyEnabled);
            }));
            it(`cancel button should be ${cancelEnabled ? 'en' : 'dis'}abled`, fakeAsync(async () => {
                expect(getCancelActionButton(fixture).nativeElement.disabled).toBe(!cancelEnabled);
            }));
        });

        describe('apply button', () => {
            it('should call apply only once when clicked multiple times and navigate to the edit page', fakeAsync(() => {
                jest.spyOn(component, 'ngOnInit');
                jest.spyOn(component.discountFacade, 'findByCodeAndCompany').mockReturnValue(of(testOffer.discount));
                jest.spyOn(offerFacade, 'save').mockReturnValue(of(testOffer));
                initialize('add');
                // Create a valid form, all required fields should be populated
                const companyDropdown = findById('company-input').injector.get(MockFilteredInputComponent);
                setCompanyDropdown(companyDropdown);

                component.discountCodeControl.setValue(testOffer.discount.code);
                fixture.detectChanges();

                const addDiscountsComponent = findById('discount-go');
                addDiscountsComponent.nativeElement.click();
                setRequiredFields();
                getApplyActionButton(fixture).nativeElement.click();
                // multiple clicks testing
                getApplyActionButton(fixture).nativeElement.click();
                getApplyActionButton(fixture).nativeElement.click();
                getApplyActionButton(fixture).nativeElement.click();
                tick(600); // tick to account for debounce time and time to re-enable button
                // Expect default values to be set
                expect(component.form.getControlValue('active')).toBeFalsy();
                expect(component.form.getControlValue('name')).toEqual(testOffer.offerContent.name);
                // Expect save and navigation
                expect(offerFacade.save).toHaveBeenCalled();
                expect(router.navigate).toHaveBeenCalledWith(
                    [`/digital/offers/edit/${testOffer.id}`],
                    expect.anything()
                );
                expect(component.messageFacade.addMessage).toHaveBeenCalledTimes(1);
            }));

            it('should clear store discounts if active is changed to false', fakeAsync(() => {
                jest.spyOn(component, 'ngOnInit');
                jest.spyOn(component, 'unassignStoreDiscountsIfInactive');
                jest.spyOn(component.discountFacade, 'findByCodeAndCompany').mockReturnValue(of(testOffer.discount));
                jest.spyOn(offerFacade, 'save').mockReturnValue(of(testOffer));
                initialize('add');
                // Create a valid form, all required fields should be populated
                const companyDropdown = findById('company-input').injector.get(MockFilteredInputComponent);
                setCompanyDropdown(companyDropdown);

                component.discountCodeControl.setValue(testOffer.discount.code);
                fixture.detectChanges();

                const addDiscountsComponent = findById('discount-go');
                addDiscountsComponent.nativeElement.click();
                setRequiredFields();
                // Set active to false
                component.form.patchControlValue('active', false);
                getApplyActionButton(fixture).nativeElement.click();

                tick(600); // tick to account for debounce time and time to re-enable button
                // Expect store discounts to be cleared
                expect(component.unassignStoreDiscountsIfInactive).toHaveBeenCalledWith();
                expect(component.form.getControlValue('active')).toBeFalsy();
                expect(component.form.getArrayValue('storeDiscounts')).toEqual([]);
                // Expect save and navigation
                expect(offerFacade.save).toHaveBeenCalled();
                expect(offerFacade.save).toHaveBeenCalled();
                expect(router.navigate).toHaveBeenCalledWith(
                    [`/digital/offers/edit/${testOffer.id}`],
                    expect.anything()
                );
            }));

            it('should show loading overlay when processing', fakeAsync(() => {
                const applySubject = new Subject();
                offerFacade.save = jest.fn(() => applySubject);
                jest.spyOn(component.discountFacade, 'findByCodeAndCompany').mockReturnValue(of(testOffer.discount));
                initialize('add');
                // Create a valid form, all required fields should be populated
                const companyDropdown = findById('company-input').injector.get(MockFilteredInputComponent);
                setCompanyDropdown(companyDropdown);

                component.discountCodeControl.setValue(testOffer.discount.code);
                fixture.detectChanges();

                const addDiscountsComponent = findById('discount-go');
                addDiscountsComponent.nativeElement.click();
                setRequiredFields();
                getApplyActionButton(fixture).nativeElement.click();
                tick(600); // tick to account for debounce time and time to re-enable button
                expect(component.isLoading).toBeTruthy();

                applySubject.next(null);
                flush();

                expect(component.isLoading).toBeFalsy();
            }));

            it('should display an error if discount already exists', fakeAsync(() => {
                jest.spyOn(component, 'ngOnInit');
                jest.spyOn(component.discountFacade, 'findByCodeAndCompany').mockReturnValue(of(testOffer.discount));
                jest.spyOn(offerFacade, 'save').mockReturnValueOnce(throwError(new Error()));
                initialize('add');
                // Create a valid form, all required fields should be populated
                const companyDropdown = findById('company-input').injector.get(MockFilteredInputComponent);
                setCompanyDropdown(companyDropdown);

                component.discountCodeControl.setValue(testOffer.discount.code);
                fixture.detectChanges();

                const addDiscountsComponent = findById('discount-go');
                addDiscountsComponent.nativeElement.click();
                setRequiredFields();
                getApplyActionButton(fixture).nativeElement.click();

                tick(600); // tick to account for debounce time and time to re-enable button
                // Expect default values to be set
                expect(component.form.getControlValue('active')).toBeFalsy();
                expect(component.form.getControlValue('name')).toEqual(testOffer.offerContent.name);
                // Expect save to be called and error thrown
                expect(offerFacade.save).toHaveBeenCalled();
                expect(component.messageFacade.addMessage).toHaveBeenCalledWith({
                    message: `Discount offer for ${testOffer.company.code} with discount code ${testOffer.discount.code} and discount name ${testOffer.name} already exists.`,
                    severity: 'error',
                });
            }));
        });

        describe('save button', () => {
            it('should call save only once when clicked multiple times and navigate back to the search page', fakeAsync(() => {
                jest.spyOn(component.saveFacade, 'save');
                jest.spyOn(component.discountFacade, 'findByCodeAndCompany').mockReturnValue(of(testAddOffer.discount));
                initialize('add');
                // Create a valid form, all required fields should be populated
                const companyDropdown = findById('company-input').injector.get(MockFilteredInputComponent);
                setCompanyDropdown(companyDropdown);

                component.discountCodeControl.setValue(testAddOffer.discount.code);
                fixture.detectChanges();

                const addDiscountsComponent = findById('discount-go');
                addDiscountsComponent.nativeElement.click();
                setRequiredFields();
                // click on save button
                getSaveActionButton(fixture).nativeElement.click();
                // multiple clicks testing
                getSaveActionButton(fixture).nativeElement.click();
                getSaveActionButton(fixture).nativeElement.click();
                getSaveActionButton(fixture).nativeElement.click();
                tick(600);
                // Expect default values to be set
                expect(component.form.getControlValue('active')).toBeFalsy();
                expect(component.form.getControlValue('name')).toEqual(testAddOffer.offerContent.name);
                // Expect save and navigation
                expect(offerFacade.save).toHaveBeenCalledWith(testAddOffer);
                expect(messageFacade.addMessage).toHaveBeenCalledWith({
                    message: `Offer saved successfully`,
                    severity: 'info',
                });

                expect(component.saveFacade.save).toHaveBeenCalledWith(
                    component.form,
                    component.model,
                    component['route']
                );

                expect(routerService.navigateToSearchPage).toHaveBeenCalled();
                expect(component.messageFacade.addMessage).toHaveBeenCalledTimes(1);
            }));

            it('should show loading overlay when processing', fakeAsync(() => {
                const saveSubject = new Subject();
                offerFacade.save = jest.fn(() => saveSubject);
                jest.spyOn(component.discountFacade, 'findByCodeAndCompany').mockReturnValue(of(testOffer.discount));
                initialize('add');
                // Create a valid form, all required fields should be populated
                const companyDropdown = findById('company-input').injector.get(MockFilteredInputComponent);
                setCompanyDropdown(companyDropdown);

                component.discountCodeControl.setValue(testOffer.discount.code);
                fixture.detectChanges();

                const addDiscountsComponent = findById('discount-go');
                addDiscountsComponent.nativeElement.click();
                setRequiredFields();

                getSaveActionButton(fixture).nativeElement.click();
                fixture.detectChanges();
                tick(600);
                expect(component.isLoading).toBeTruthy();

                saveSubject.next(null);
                flush();

                expect(component.isLoading).toBeFalsy();
            }));

            it('should display an error if discount already exists', fakeAsync(() => {
                jest.spyOn(offerFacade, 'save').mockReturnValueOnce(throwError(new Error()));
                jest.spyOn(component.saveFacade, 'save');
                jest.spyOn(component.discountFacade, 'findByCodeAndCompany').mockReturnValue(of(testAddOffer.discount));
                initialize('add');
                // Create a valid form, all required fields should be populated
                const companyDropdown = findById('company-input').injector.get(MockFilteredInputComponent);
                setCompanyDropdown(companyDropdown);

                component.discountCodeControl.setValue(testAddOffer.discount.code);
                fixture.detectChanges();

                const addDiscountsComponent = findById('discount-go');
                addDiscountsComponent.nativeElement.click();
                setRequiredFields();
                getSaveActionButton(fixture).nativeElement.click();
                tick(600); // tick to account for debounce time and time to re-enable button
                // Expect default values to be set
                expect(component.form.getControlValue('active')).toBeFalsy();
                expect(component.form.getControlValue('name')).toEqual(testAddOffer.offerContent.name);
                // Expect save to be called and an error thrown
                expect(offerFacade.save).toHaveBeenCalledWith(testAddOffer);
                expect(component.saveFacade.save).toHaveBeenCalledWith(
                    component.form,
                    component.model,
                    component['route']
                );
                expect(component.messageFacade.addMessage).toHaveBeenCalledWith({
                    message: `Discount offer for ${testAddOffer.company.code} with discount code ${testAddOffer.discount.code} and discount name ${testAddOffer.name} already exists.`,
                    severity: 'error',
                });
            }));
        });

        describe('discount search', () => {
            describe.each`
                accessMode
                ${'edit'}
                ${'view'}
            `('with ${accessMode} access', ({ accessMode }) => {
                it('should not be displayed if not in add mode', fakeAsync(() => {
                    initialize(accessMode);
                    expect(fixture.debugElement.query(By.css('#discount-search'))).toBeNull();
                }));
            });

            it('should openSearchDialog when clicked', fakeAsync(() => {
                jest.spyOn(component, 'openSearchDialog').mockImplementation(() => {});
                initialize('add');
                const companyDropdown = findById('company-input').injector.get(MockFilteredInputComponent);
                setCompanyDropdown(companyDropdown);
                fixture.debugElement.query(By.css('#discount-search')).nativeElement.click();
                expect(component.openSearchDialog).toHaveBeenCalled();
            }));

            it('should be disabled until company is selected', fakeAsync(() => {
                initialize('add');
                expect(fixture.debugElement.query(By.css('#discount-search')).nativeElement.disabled).toBeTruthy();
                const companyDropdown = findById('company-input').injector.get(MockFilteredInputComponent);
                setCompanyDropdown(companyDropdown);
                expect(fixture.debugElement.query(By.css('#discount-search')).nativeElement.disabled).toBeFalsy();
            }));
        });
    });
});
