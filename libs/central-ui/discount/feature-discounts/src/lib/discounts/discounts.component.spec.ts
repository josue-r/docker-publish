import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component, DebugElement, Input } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOption, MatOptionModule } from '@angular/material/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, ActivatedRouteSnapshot, Router, convertToParamMap } from '@angular/router';
import { Discount, DiscountFacade } from '@vioc-angular/central-ui/discount/data-access-discount';
import { ProductCategory, ProductCategoryFacade } from '@vioc-angular/central-ui/product/data-access-product-category';
import { ServiceCategory, ServiceCategoryFacade } from '@vioc-angular/central-ui/service/data-access-service-category';
import { RouterService } from '@vioc-angular/central-ui/util-router';
import { AccessMode } from '@vioc-angular/security/util-authorization';
import { CommonFunctionalityModule, Described } from '@vioc-angular/shared/common-functionality';
import { MessageFacade } from '@vioc-angular/shared/data-access-message';
import { UiActionBarModule } from '@vioc-angular/shared/ui-action-bar';
import { UiAuditModule } from '@vioc-angular/shared/ui-audit';
import { UiDialogMockModule } from '@vioc-angular/shared/ui-dialog';
import { UiFilteredInputMockModule } from '@vioc-angular/shared/ui-filtered-input';
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
import { SelectionModel } from '@angular/cdk/collections';
import { Store } from '@vioc-angular/central-ui/organization/data-access-store';
import { DiscountCategory } from 'libs/central-ui/discount/data-access-discount/src/lib/model/discount-category.model';
import { ReplaySubject, Subject, of } from 'rxjs';
import { DiscountLineItemComponent } from '../discount-line-item/discount-line-item.component';
import { DiscountModuleForms } from '../discount-module-forms';
import { ProductCategoryAddInputComponent } from '../product-category-add-input/product-category-add-input.component';
import { ServiceCategoryAddInputComponent } from '../service-category-add-input/service-category-add-input.component';
import { DiscountsComponent } from './discounts.component';
import moment = require('moment');

describe('DiscountsComponent', () => {
    let component: DiscountsComponent;
    let fixture: ComponentFixture<DiscountsComponent>;
    let discountFacade: DiscountFacade;
    let productCategoryFacade: ProductCategoryFacade;
    let serviceCategoryFacade: ServiceCategoryFacade;
    let messageFacade: MessageFacade;
    let componentDestroyed: ReplaySubject<any>;
    let formFactory: FormFactory;
    let formBuilder: FormBuilder;
    let routerService: RouterService;
    let router: Router;
    const routeParams = new Subject();

    const testCompany = {
        id: '2',
        code: 'VAL',
        description: 'Test Company VAL',
        version: 0,
    };
    const testRegion = {
        id: '22',
        code: 'Test_Region',
        description: 'Test Region',
        version: 0,
    };
    const testMarket = {
        id: '222',
        code: 'Test_Market',
        description: 'Test Market',
        version: 0,
    };
    const testDevice = {
        id: '4',
        code: 'MOBILE',
        description: 'Test Device MOBILE',
        version: 0,
    };
    const testAudience = {
        id: '5',
        code: 'STANDARD',
        description: 'Test Audience STANDARD',
        version: 0,
    };
    const testChannel = {
        id: '6',
        code: 'EMAIL',
        description: 'Test Channel EMAIL',
        version: 0,
    };
    const testProgram = {
        id: '7',
        code: 'CNW',
        description: 'Test Program CNW',
        version: 0,
    };
    const testOwner = {
        id: '8',
        code: 'OPERATIONS',
        description: 'Test Owner OPERATIONS',
        version: 0,
    };
    const testServiceOffer = {
        id: '9',
        code: 'OC',
        description: 'Test Service Offer OC',
        version: 0,
    };
    const testExcludeType = {
        id: '12',
        code: 'EXCLUDE_LINEITEM',
        description: 'Test Type EXCLUDE_LINEITEM',
        version: 0,
    };

    const testIncludeType = {
        id: '12',
        code: 'LINEITEM',
        description: 'Test Type LINEITEM',
        version: 0,
    };

    const testInvoiceType = {
        id: '212',
        code: 'INVOICE',
        description: 'Test Type Invoice',
        version: 0,
    };

    const testApproach = {
        id: '13',
        code: 'PERCENT',
        description: 'Test Approach PERCENT',
        version: 0,
    };
    const testDiscountClassification = {
        id: '14',
        code: 'Classification',
        description: 'Test Discount Classification',
        version: 0,
    };
    const testSecurityRestriction = {
        id: '15',
        code: 'SRTECH',
        description: 'Test Security Restriction SRTECH',
        version: 0,
    };

    const testCategory1 = {
        id: '16',
        code: 'AIRFILTER',
        description: 'Test AirFilter',
        version: 0,
    };

    const testCategory2 = {
        id: '17',
        code: 'BT',
        description: 'Test bt',
        version: 0,
    };

    const testProductCategory: DiscountCategory = {
        discountTarget: 'PRODUCT',
        category: testCategory1,
        amount: 30,
        approach: testApproach,
    };

    const testServiceCategory: DiscountCategory = {
        discountTarget: 'SERVICE',
        category: testCategory2,
        amount: 30,
        approach: testApproach,
    };
    // startDate requires day to be after or equal to current day
    const today = moment().startOf('day');
    const formatDate = (date: moment.Moment) => date.format('MM-DD-YYYY');

    const testNationalDiscount: Discount = {
        id: '100',
        company: null,
        startDate: formatDate(today),
        expirationDate: formatDate(today.add(1, 'day')),
        endDate: formatDate(today.add(1, 'day')),
        code: 'test1',
        description: 'Test Discount Description',
        type: testExcludeType,
        active: true,
        national: true,
        approach: testApproach,
        version: 0,
        updatedBy: 'tester123',
        updatedOn: '03-04-2024',
        owner: testOwner,
        channel: testChannel,
        uniqueCodeRequired: false,
        discountClassification: testDiscountClassification,
        explanationRequired: false,
        amount: 25,
        overridable: true,
        device: testDevice,
        program: testProgram,
        fleetOnly: false,
        audience: testAudience,
        overrideMinAmount: 20.22,
        overrideMaxAmount: 30.33,
        percentMaxAmount: 40.44,
        serviceOffer: testServiceOffer,
        securityRestriction: testSecurityRestriction,
        extraChargesSupported: false,
        maxUses: 50,
        discountCategories: [testProductCategory, testServiceCategory],
        storeDiscounts: [],
    };

    const testLocalDiscount: Discount = {
        id: '101',
        company: testCompany,
        startDate: formatDate(today),
        expirationDate: formatDate(today.add(1, 'day')),
        endDate: formatDate(today.add(1, 'day')),
        code: 'test2',
        description: 'Test Discount Description',
        type: testExcludeType,
        active: true,
        national: false,
        approach: testApproach,
        version: 0,
        updatedBy: 'tester123',
        updatedOn: '03-04-2024',
        owner: testOwner,
        channel: testChannel,
        uniqueCodeRequired: false,
        discountClassification: testDiscountClassification,
        explanationRequired: false,
        amount: 25,
        overridable: true,
        device: testDevice,
        program: testProgram,
        fleetOnly: false,
        audience: testAudience,
        overrideMinAmount: 20.22,
        overrideMaxAmount: 30.33,
        percentMaxAmount: 40.44,
        serviceOffer: testServiceOffer,
        securityRestriction: testSecurityRestriction,
        extraChargesSupported: false,
        maxUses: 50,
        discountCategories: [testProductCategory, testServiceCategory],
        storeDiscounts: [],
    };

    const testAddLocalDiscount: Discount = {
        id: null,
        code: 'VAtest2',
        description: testLocalDiscount.description,
        startDate: testLocalDiscount.startDate,
        endDate: testLocalDiscount.endDate,
        company: testLocalDiscount.company,
        updatedBy: null,
        updatedOn: null,
        version: null,
        expirationDate: null,
        type: testInvoiceType,
        active: false,
        national: false,
        approach: testApproach,
        owner: null,
        channel: null,
        uniqueCodeRequired: false,
        discountClassification: null,
        explanationRequired: false,
        amount: testLocalDiscount.amount,
        overridable: false,
        device: null,
        program: null,
        fleetOnly: false,
        audience: null,
        overrideMinAmount: null,
        overrideMaxAmount: null,
        percentMaxAmount: null,
        serviceOffer: null,
        securityRestriction: null,
        extraChargesSupported: false,
        maxUses: null,
        discountCategories: [],
        storeDiscounts: [],
    };

    @Component({
        selector: 'vioc-angular-discounts-store-assignment',
        template: '',
    })
    class MockDiscountsStoreAssignmentComponent {
        /** Control that maintains the selected value of the company filter. */
        companyControl = new FormControl();
        /** Control that maintains the selected value of the region filter. */
        regionControl = new FormControl();
        /** Control that maintains the selected value of the market filter. */
        marketControl = new FormControl();
        /** Used to maintain the selected values in the table. */
        selection = new SelectionModel<TypedFormGroup<Store>>(true, []);
        @Input() form: TypedFormGroup<Discount>;
        @Input() model: Discount;
        @Input() accessMode: AccessMode;
        @Input() initiateCompanySearch: Described;
        @Input() initiateRegionSearch: Described;
        @Input() initiateMarketSearch: Described;
        @Input() hideCompanyFilter: boolean;
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [
                DiscountsComponent,
                DiscountLineItemComponent,
                ProductCategoryAddInputComponent,
                ServiceCategoryAddInputComponent,
                MockDiscountsStoreAssignmentComponent,
            ],
            imports: [
                NoopAnimationsModule,
                HttpClientTestingModule,
                ReactiveFormsModule,
                MatCheckboxModule,
                MatFormFieldModule,
                MatExpansionModule,
                MatInputModule,
                MatButtonModule,
                MatSelectModule,
                MatOptionModule,
                MatSortModule,
                MatTableModule,
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
                { provide: ActivatedRoute, useValue: { params: routeParams, parent: '/discounts/search' } },
                { provide: Router, useValue: { navigate: jest.fn() } },
                { provide: RouterService, useValue: { navigateToSearchPage: jest.fn() } },
                { provide: MessageFacade, useValue: { addMessage: jest.fn() } },
                { provide: GATEWAY_TOKEN, useValue: '//gateway/' },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        DiscountModuleForms.registerForms(TestBed.inject(FormFactory), TestBed.inject(FormBuilder));
        fixture = TestBed.createComponent(DiscountsComponent);
        component = fixture.componentInstance;
        formFactory = TestBed.inject(FormFactory);
        formBuilder = TestBed.inject(FormBuilder);
        routerService = TestBed.inject(RouterService);
        router = TestBed.inject(Router);
        discountFacade = component.discountFacade;
        productCategoryFacade = component.productCategoryFacade;
        serviceCategoryFacade = component.serviceCategoryFacade;
        componentDestroyed = new ReplaySubject(1);

        jest.spyOn(component.roleFacade, 'getMyRoles').mockReturnValue(
            of([
                'ROLE_NATIONAL_DISCOUNT_UPDATE',
                'ROLE_LOCAL_DISCOUNT_UPDATE',
                'ROLE_NATIONAL_DISCOUNT_ADD',
                'ROLE_LOCAL_DISCOUNT_ADD',
            ])
        );
    });

    /** Initialize the the component with the given access mode and id. Default is national discount. */
    const initialize = (accessMode: 'view' | 'edit' | 'add', type: 'national' | 'local', andflush = true) => {
        let discountModel = null;
        if (type == 'local') {
            discountModel = testLocalDiscount;
        } else {
            discountModel = testNationalDiscount;
        }
        initializeModel(accessMode, discountModel, andflush);
    };

    const initializeModel = (
        accessMode: 'view' | 'edit' | 'add',
        discountModel: Discount = testLocalDiscount,
        andflush = true
    ) => {
        const route = TestBed.inject(ActivatedRoute);
        route.snapshot = {
            paramMap: convertToParamMap({
                accessMode: accessMode,
                discountCode: discountModel.code,
                companyCode: discountModel.company ? discountModel.company.code : null,
            }),
        } as ActivatedRouteSnapshot;

        const discount = { ...new Discount(), ...discountModel };
        jest.spyOn(component.resourceFacade, 'findCompaniesByRoles').mockReturnValue(
            of({ resources: [testCompany], allCompanies: false })
        );
        jest.spyOn(component.discountFacade, 'findByCodeAndCompanyV2').mockReturnValue(of(discount));
        fixture.detectChanges();
        if (andflush) {
            tick(100);
        }
    };

    const verifySaveAndMessage = (model: Discount = testLocalDiscount) => {
        expect(discountFacade.save).toHaveBeenCalledWith(model);
        expect(messageFacade.addMessage).toHaveBeenCalledWith({
            message: `Discount ${model.code} saved successfully`,
            severity: 'info',
        });
    };

    const openDropdown = (id: string) => {
        const dropdownField = fixture.debugElement.query(By.css(id));
        expect(dropdownField).toBeTruthy();
        dropdownField.nativeElement.click();
        fixture.detectChanges();
    };

    const clickOption = (index: number) => {
        const options = fixture.debugElement.queryAll(By.directive(MatOption));
        options[index].nativeElement.click();
        fixture.detectChanges();
    };

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe.each`
        accessMode | discountType
        ${'edit'}  | ${'national'}
        ${'edit'}  | ${'local'}
        ${'add'}   | ${'national'}
        ${'add'}   | ${'local'}
    `('unsavedChanges', ({ accessMode, discountType }) => {
        it(`should track if the form has been modified for ${discountType} discounts`, fakeAsync(() => {
            initialize(accessMode, discountType);
            expect(component.unsavedChanges).toBeFalsy();
            component.form.markAsDirty();
            expect(component.unsavedChanges).toBeTruthy();
        }));
    });

    describe.each`
        accessMode | discountType  | formDisabled
        ${'edit'}  | ${'national'} | ${false}
        ${'edit'}  | ${'local'}    | ${false}
        ${'view'}  | ${'national'} | ${true}
        ${'view'}  | ${'local'}    | ${true}
    `('OnInit', ({ accessMode, discountType, formDisabled }) => {
        it(`should display a loading overlay until the form is loaded for ${discountType}`, fakeAsync(() => {
            initialize(accessMode, discountType);
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

        it('should load the correct model', fakeAsync(() => {
            jest.spyOn(discountFacade, 'findByCodeAndCompanyV2');
            initialize(accessMode, discountType);
            expectDiscount();
        }));

        it('should initialize the form', fakeAsync(() => {
            jest.spyOn(discountFacade, 'findByCodeAndCompanyV2');
            initialize(accessMode, discountType);
            const testDiscount = discountType == 'national' ? testNationalDiscount : testLocalDiscount;
            expectDiscount();
            expect(component.form).toBeTruthy();
            expect(component.form.disabled).toEqual(formDisabled);
            expect(component.form.getRawValue()).toEqual(testDiscount);
        }));

        describe(`with product category data in ${accessMode} access mode`, () => {
            it('should load category table', fakeAsync(() => {
                initialize(accessMode, discountType);
                const table = fixture.debugElement.query(By.css('#category-table'));
                expect(table).toBeTruthy();
            }));

            it('should load data source', () => {
                initialize(accessMode, discountType, false);
                expect(component.category$.value.data).toBeTruthy();
            });

            it('should display amount from category', fakeAsync(() => {
                initializeModel(
                    accessMode,
                    {
                        ...testLocalDiscount,
                        type: testIncludeType,
                    },
                    false
                );
                tick(100);
                expect(component.form.getControlValue('type').code).toEqual(component.discountLineItem);
                expect(+fixture.nativeElement.querySelector('#amount-0').value).toEqual(testProductCategory.amount);
            }));
        });

        describe.each`
            header
            ${'categoryHeader'}
            ${'discountTargetHeader'}
        `('with headers', ({ header }) => {
            it(`should call custom sorting accessor when clicking on ${header}`, () => {
                initializeModel(
                    accessMode,
                    {
                        ...testLocalDiscount,
                        type: testIncludeType,
                    },
                    false
                );
                const sort = jest.spyOn(component.category$.value, 'sortingDataAccessor');
                // find header and click. using nativeElement querySelector due to jest's shallow dom rendering
                const headerButton = fixture.nativeElement.querySelector(`#${header}`);
                headerButton.click();
                fixture.detectChanges();
                expect(sort).toHaveBeenCalled();
            });
        });

        const expectDiscount = () => {
            if (discountType == 'national') {
                expect(discountFacade.findByCodeAndCompanyV2).toHaveBeenCalledWith(testNationalDiscount.code, null);
            } else {
                expect(discountFacade.findByCodeAndCompanyV2).toHaveBeenCalledWith(
                    testLocalDiscount.code,
                    testLocalDiscount.company.code
                );
            }
        };
    });

    describe('edit', () => {
        // Local vs National only has the difference of company displayed
        describe.each`
            field                    | disabled | discountType
            ${'company'}             | ${true}  | ${'local'}
            ${'discountCode'}        | ${true}  | ${'national'}
            ${'discountType'}        | ${true}  | ${'national'}
            ${'active'}              | ${false} | ${'national'}
            ${'description'}         | ${false} | ${'national'}
            ${'startDate'}           | ${true}  | ${'national'}
            ${'expirationDate'}      | ${false} | ${'national'}
            ${'endDate'}             | ${false} | ${'national'}
            ${'uniqueCodeRequired'}  | ${false} | ${'national'}
            ${'explanationRequired'} | ${false} | ${'national'}
            ${'fleetOnly'}           | ${false} | ${'national'}
            ${'securityRestriction'} | ${false} | ${'national'}
            ${'percentMaxAmount'}    | ${false} | ${'national'}
            ${'overridable'}         | ${false} | ${'national'}
            ${'overrideMinAmount'}   | ${false} | ${'national'}
            ${'overrideMaxAmount'}   | ${false} | ${'national'}
            ${'category'}            | ${false} | ${'national'}
            ${'device'}              | ${false} | ${'national'}
            ${'audience'}            | ${false} | ${'national'}
            ${'channel'}             | ${false} | ${'national'}
            ${'program'}             | ${false} | ${'national'}
            ${'owner'}               | ${false} | ${'national'}
            ${'serviceOffer'}        | ${false} | ${'national'}
        `('disable fields', ({ field, disabled, discountType }) => {
            it(`should ${disabled === true ? '' : 'not '}display a disabled input for ${field}`, fakeAsync(() => {
                initialize('edit', discountType);
                expectInput(fixture, { id: `${field}` }).toBeEnabled(!disabled);
            }));
        });

        it('should disable everything and act as a view screen if LOCAL_DISCOUNT_UPDATE role views a national discount', fakeAsync(() => {
            jest.spyOn(component.roleFacade, 'getMyRoles').mockReturnValue(of(['ROLE_LOCAL_DISCOUNT_UPDATE']));
            initialize('edit', 'national');
            expect(component.form.disabled).toBeTruthy();
            expect(component.accessMode).toEqual(AccessMode.VIEW);
        }));

        it('should disable everything and act as a view screen if NATIONAL_DISCOUNT_UPDATE role views a local discount', fakeAsync(() => {
            jest.spyOn(component.roleFacade, 'getMyRoles').mockReturnValue(of(['ROLE_NATIONAL_DISCOUNT_UPDATE']));
            initialize('edit', 'local');
            expect(component.form.disabled).toBeTruthy();
            expect(component.accessMode).toEqual(AccessMode.VIEW);
        }));

        it('should allow selecting an applies to value', fakeAsync(() => {
            jest.spyOn(component.commonCodeFacade, 'findByType').mockReturnValue(
                of([testExcludeType, testIncludeType, testInvoiceType])
            );
            initialize('edit', 'local');
            openDropdown('#appliesTo');
            clickOption(3);
            tick(200); // clear timers in queue
            expect(component.form.getControlValue('type')).toEqual(testInvoiceType);
        }));

        it('should allow selecting an applies to value', fakeAsync(() => {
            jest.spyOn(component, 'initializeTable');
            jest.spyOn(component.commonCodeFacade, 'findByType').mockReturnValue(
                of([testExcludeType, testIncludeType, testInvoiceType])
            );
            initialize('edit', 'local');
            openDropdown('#appliesTo');
            clickOption(1);
            tick(200); // clear timers in queue
            expect(component.initializeTable).toHaveBeenCalled();
            expect(component.form.getControlValue('type')).toEqual(testExcludeType);
            expect(component.form.getControlValue('approach')).toEqual(testLocalDiscount.approach);
            expect(component.form.getControlValue('amount')).toEqual(testLocalDiscount.amount);
        }));
    });

    describe('Action Bar', () => {
        beforeEach(() => {
            discountFacade.save = jest.fn(() => of(null));
            messageFacade = TestBed.inject(MessageFacade);
            router = TestBed.inject(Router);
        });

        describe.each`
            accessMode | discountType  | saveDisplayed | applyDisplayed | cancelDisplayed
            ${'view'}  | ${'national'} | ${false}      | ${false}       | ${true}
            ${'edit'}  | ${'national'} | ${true}       | ${true}        | ${true}
            ${'view'}  | ${'local'}    | ${false}      | ${false}       | ${true}
            ${'edit'}  | ${'local'}    | ${true}       | ${true}        | ${true}
        `('in $accessMode mode', ({ accessMode, discountType, saveDisplayed, applyDisplayed, cancelDisplayed }) => {
            const verifyDisplayedState = (element: DebugElement, shouldBeDisplayed: boolean) => {
                initialize(accessMode, discountType);
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
            formState    | discountType  | saveEnabled | applyEnabled | cancelEnabled
            ${'valid'}   | ${'national'} | ${true}     | ${true}      | ${true}
            ${'invalid'} | ${'national'} | ${false}    | ${false}     | ${true}
            ${'valid'}   | ${'local'}    | ${true}     | ${true}      | ${true}
            ${'invalid'} | ${'local'}    | ${false}    | ${false}     | ${true}
        `(`with $formState form`, ({ formState, discountType, saveEnabled, applyEnabled, cancelEnabled }) => {
            beforeEach(fakeAsync(() => {
                initialize('edit', discountType);
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
                initialize('edit', 'local');
                jest.spyOn(component, 'ngOnInit');
                jest.spyOn(discountFacade, 'save').mockReturnValue(of(null));
                const storesComponent: MockDiscountsStoreAssignmentComponent = fixture.debugElement.query(
                    By.directive(MockDiscountsStoreAssignmentComponent)
                ).componentInstance;
                expect(storesComponent.initiateCompanySearch).toEqual(undefined);
                expect(storesComponent.initiateRegionSearch).toEqual(undefined);
                expect(storesComponent.initiateMarketSearch).toEqual(undefined);
                getApplyActionButton(fixture).nativeElement.click();
                tick(600); // tick to account for debounce time and time to re-enable button
                expect(discountFacade.save).toHaveBeenCalled();
                expect(component.ngOnInit).toHaveBeenCalled();
            }));

            it('should maintain the filter values after apply', fakeAsync(() => {
                initialize('edit', 'local');
                jest.spyOn(component, 'ngOnInit');
                jest.spyOn(discountFacade, 'save').mockReturnValue(of(null));
                const storesComponent: MockDiscountsStoreAssignmentComponent = fixture.debugElement.query(
                    By.directive(MockDiscountsStoreAssignmentComponent)
                ).componentInstance;
                storesComponent.companyControl.setValue(testCompany);
                storesComponent.regionControl.setValue(testRegion);
                storesComponent.marketControl.setValue(testMarket);
                // Should not have an initial value on first load
                expect(component.initiateCompanySearch).toEqual(undefined);
                expect(component.initiateRegionSearch).toEqual(undefined);
                expect(component.initiateMarketSearch).toEqual(undefined);
                getApplyActionButton(fixture).nativeElement.click();
                tick(600); // tick to account for debounce time and time to re-enable button
                expect(discountFacade.save).toHaveBeenCalled();
                expect(component.ngOnInit).toHaveBeenCalled();
                // Should be set to the last filters the user set
                expect(component.initiateCompanySearch).toEqual(storesComponent.companyControl.value);
                expect(component.initiateRegionSearch).toEqual(storesComponent.regionControl.value);
                expect(component.initiateMarketSearch).toEqual(storesComponent.marketControl.value);
            }));

            it('should unassign storeDiscounts when active is false', fakeAsync(() => {
                initialize('edit', 'local');
                jest.spyOn(component, 'ngOnInit');
                jest.spyOn(component, 'unassignStoreDiscountsIfInactive');
                jest.spyOn(discountFacade, 'save').mockReturnValue(of(null));
                component.form.setControlValue('active', false);
                fixture.detectChanges();
                getApplyActionButton(fixture).nativeElement.click();
                tick(600); // tick to account for debounce time and time to re-enable button
                expect(discountFacade.save).toHaveBeenCalled();
                expect(component.unassignStoreDiscountsIfInactive).toHaveBeenCalled();
                component.form.getControlValue('storeDiscounts').forEach((sd) => {
                    expect(sd.active).toBe(false);
                });
                expect(component.ngOnInit).toHaveBeenCalled();
            }));

            it('should show loading overlay when processing', fakeAsync(() => {
                const applySubject = new Subject();
                discountFacade.save = jest.fn(() => applySubject);
                initialize('edit', 'local');
                const storesComponent: MockDiscountsStoreAssignmentComponent = fixture.debugElement.query(
                    By.directive(MockDiscountsStoreAssignmentComponent)
                ).componentInstance;
                expect(storesComponent.initiateCompanySearch).toEqual(undefined);
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
                initialize('edit', 'local');

                getSaveActionButton(fixture).nativeElement.click();
                tick(600); // tick to account for debounce time and time to re-enable button
                verifySaveAndMessage();
                expect(component.saveFacade.save).toHaveBeenCalledWith(
                    component.form,
                    testLocalDiscount,
                    component['route']
                );

                expect(routerService.navigateToSearchPage).toHaveBeenCalled();
            }));

            it('should show loading overlay when processing', fakeAsync(() => {
                const saveSubject = new Subject();
                discountFacade.save = jest.fn(() => saveSubject);
                initialize('edit', 'local');
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
                    initialize(accessMode, 'local');
                    expect(getCancelActionButton(fixture)).toBeTruthy();
                    getCancelActionButton(fixture).nativeElement.click();
                    expect(router.navigate).toHaveBeenCalledWith(['search'], {
                        relativeTo: TestBed.inject(ActivatedRoute).parent,
                    });
                })
            );
        });

        describe('with discount category table', () => {
            describe('with "Remove Category" button', () => {
                const getRowsWithCheckboxes = () => fixture.nativeElement.querySelectorAll('.line-item-checkbox');
                const getRemoveCategoryButton = () => fixture.nativeElement.querySelector('#remove-category-button');

                const selectCategory = (checkbox: number) => {
                    // precheck: expect one header, two products
                    const productRows = getRowsWithCheckboxes();
                    expect(productRows.length).toBe(3);

                    // click checkbox on `checkbox`th row
                    productRows[checkbox].querySelector('input').click();
                    fixture.detectChanges();
                };

                it('should be disabled there are no products selected', fakeAsync(() => {
                    initializeModel('edit');
                    expect(getRemoveCategoryButton().disabled).toEqual(true);
                }));

                it('should be enabled if products are selected', fakeAsync(() => {
                    initializeModel('edit');
                    selectCategory(0);
                    expect(getRemoveCategoryButton().disabled).toEqual(false);
                }));

                describe.each`
                    accessMode | isRendered | expectedCheckboxes | removeButtonShown
                    ${'view'}  | ${false}   | ${0}               | ${false}
                    ${'edit'}  | ${true}    | ${3}               | ${true}
                    ${'add'}   | ${true}    | ${0}               | ${false}
                `(
                    `while in accessMode $accessMode`,
                    ({ accessMode, isRendered, expectedCheckboxes, removeButtonShown }) => {
                        it(`should ${
                            isRendered ? '' : 'not '
                        }render #${expectedCheckboxes} checkboxes and "Remove products" button while discount has ${accessMode} accessMode`, fakeAsync(() => {
                            initializeModel(accessMode);

                            // validate that button and checkboxes are rendered as needed for status and access mode
                            expect(getRowsWithCheckboxes().length).toBe(expectedCheckboxes);
                            if (isRendered && removeButtonShown) {
                                expect(getRemoveCategoryButton()).toBeTruthy();
                            } else {
                                expect(getRemoveCategoryButton()).toBeFalsy();
                            }
                        }));
                    }
                );

                describe.each`
                    selectedCheckboxes | expectedRemainingRowCount | expectedRemainingCodes
                    ${[0]}             | ${0}                      | ${[]}
                    ${[1]}             | ${2}                      | ${['BT']}
                    ${[2]}             | ${2}                      | ${['AIRFILTER']}
                    ${[1, 2]}          | ${0}                      | ${[]}
                `('with checkboxes', ({ selectedCheckboxes, expectedRemainingRowCount, expectedRemainingCodes }) => {
                    it(`should have ${expectedRemainingRowCount} rows remaining, including the header, when checkboxes #${selectedCheckboxes} is clicked and "Remove Product(s)" button is clicked `, fakeAsync(() => {
                        initializeModel('edit');
                        // precheck: expect all three discounts to be present
                        expect(fixture.nativeElement.querySelector('#category-0').textContent).toEqual('AIRFILTER');
                        expect(fixture.nativeElement.querySelector('#category-1').textContent).toEqual('BT');

                        // select and remove discount(s)
                        selectedCheckboxes.forEach((selectedCheckboxIndex: number) =>
                            selectCategory(selectedCheckboxIndex)
                        );
                        getRemoveCategoryButton().click();
                        fixture.detectChanges();
                        tick(100); // clear timers in queue

                        // validate record(s) were removed from table
                        expect(getRowsWithCheckboxes().length).toBe(expectedRemainingRowCount);
                        // since rows are in fixed order (first row is always 0, then 1, etc) and test data could change, iterate through test data by index
                        for (let rowIndex = 0; rowIndex < 2; rowIndex++) {
                            // if there are expected codes, validate row exists
                            if (rowIndex < expectedRemainingCodes.length) {
                                // expect rows to be present with accompanying product code
                                expect(
                                    fixture.nativeElement.querySelector(`#category-${rowIndex}`).textContent
                                ).toEqual(expectedRemainingCodes[rowIndex]);
                            } else {
                                // expect row to not be present
                                expect(fixture.nativeElement.querySelector(`#category-${rowIndex}`)).toBeFalsy();
                            }
                        }
                    }));
                });

                it('should mark product form group as dirty when removing a product', fakeAsync(() => {
                    // initialize and prevalidate
                    initializeModel('edit');
                    expect(component.form.dirty).toEqual(false);

                    // select and remove category
                    selectCategory(1);
                    getRemoveCategoryButton().click();
                    fixture.detectChanges();
                    tick(100); // clear timers in queue

                    // validate that form is dirty
                    expect(component.form.dirty).toEqual(true);
                }));
            });

            describe('Validation', () => {
                describe.each`
                    accessMode | field         | type                  | value   | error         | showError
                    ${'edit'}  | ${'approach'} | ${'INVOICE'}          | ${null} | ${'required'} | ${true}
                    ${'edit'}  | ${'amount'}   | ${'INVOICE'}          | ${null} | ${'required'} | ${true}
                    ${'edit'}  | ${'approach'} | ${'EXCLUDE_LINEITEM'} | ${null} | ${'required'} | ${true}
                    ${'edit'}  | ${'amount'}   | ${'EXCLUDE_LINEITEM'} | ${null} | ${'required'} | ${true}
                    ${'edit'}  | ${'approach'} | ${'LINEITEM'}         | ${null} | ${'required'} | ${false}
                    ${'edit'}  | ${'amount'}   | ${'LINEITEM'}         | ${null} | ${'required'} | ${false}
                    ${'add'}   | ${'approach'} | ${'INVOICE'}          | ${null} | ${'required'} | ${true}
                    ${'add'}   | ${'amount'}   | ${'INVOICE'}          | ${null} | ${'required'} | ${true}
                    ${'add'}   | ${'approach'} | ${'EXCLUDE_LINEITEM'} | ${null} | ${'required'} | ${true}
                    ${'add'}   | ${'amount'}   | ${'EXCLUDE_LINEITEM'} | ${null} | ${'required'} | ${true}
                    ${'add'}   | ${'approach'} | ${'LINEITEM'}         | ${null} | ${'required'} | ${false}
                    ${'add'}   | ${'amount'}   | ${'LINEITEM'}         | ${null} | ${'required'} | ${false}
                `('form', ({ field, type, value, error, showError }) => {
                    it(`should ${
                        showError ? '' : 'not '
                    }show error ${error} for field ${field} with value ${value} for ${type}
            }`, () => {
                        const applyTo = { code: type };
                        initializeModel('edit', testLocalDiscount, false);
                        component.form.getControl(field).setValue(value);
                        component.form.getControl('type').setValue(applyTo);
                        component.form.getControl(field).updateValueAndValidity();
                        component.form.getControl('type').updateValueAndValidity();
                        component.applyValidators(applyTo);
                        expect(component.form.getControl(field).hasError(error)).toBe(showError);
                    });
                });

                describe.each`
                    field         | type                  | value                                                                                                                                  | error         | showError
                    ${'amount'}   | ${'LINEITEM'}         | ${[{ ...new DiscountCategory(), discountTarget: 'PRODUCT', category: testCategory1, approach: { code: 'PERCENTOFF' }, amount: 20 }]}   | ${'required'} | ${false}
                    ${'amount'}   | ${'LINEITEM'}         | ${[{ ...new DiscountCategory(), discountTarget: 'PRODUCT', category: testCategory1, approach: { code: 'PERCENTOFF' }, amount: null }]} | ${'required'} | ${true}
                    ${'approach'} | ${'LINEITEM'}         | ${[{ ...new DiscountCategory(), discountTarget: 'PRODUCT', category: testCategory1, approach: { code: 'PERCENTOFF' }, amount: 20 }]}   | ${'required'} | ${false}
                    ${'approach'} | ${'LINEITEM'}         | ${[{ ...new DiscountCategory(), discountTarget: 'PRODUCT', category: testCategory1, approach: null, amount: 20 }]}                     | ${'required'} | ${true}
                    ${'approach'} | ${'EXCLUDE_LINEITEM'} | ${[{ ...new DiscountCategory(), discountTarget: 'PRODUCT', category: testCategory1, approach: null, amount: null }]}                   | ${'required'} | ${false}
                    ${'amount'}   | ${'EXCLUDE_LINEITEM'} | ${[{ ...new DiscountCategory(), discountTarget: 'PRODUCT', category: testCategory1, approach: null, amount: null }]}                   | ${'required'} | ${false}
                    ${'amount'}   | ${'INVOICE'}          | ${[]}                                                                                                                                  | ${'required'} | ${false}
                `('form', ({ field, type, value, error, showError }) => {
                    it(`should ${showError ? '' : 'not '}show error ${error} for field ${field} with approach ${
                        value[0]?.approach?.code
                    } and amount  ${value[0]?.amount} for ${type}
        }`, fakeAsync(() => {
                        const applyTo = { code: type };
                        initializeModel(
                            'edit',
                            {
                                ...testLocalDiscount,
                                type: applyTo,
                                discountCategories: value,
                            },
                            false
                        );
                        component.applyValidators(applyTo);
                        fixture.detectChanges();
                        tick(100);
                        component.form.getArray('discountCategories').controls.forEach((c: any) => {
                            expect(c.getControl(field).hasError(error)).toBe(showError);
                        });
                    }));
                });
            });
        });

        describe('product category add input', () => {
            const productAddInputComponent = () => {
                return fixture.debugElement.query(By.css('#product-add-input'))
                    .componentInstance as ProductCategoryAddInputComponent;
            };
            const addedCategories = [{ id: 100, code: 'P100' }];

            it('should accept isLoading as a parameter for addDisabled', fakeAsync(() => {
                initializeModel(
                    'edit',
                    {
                        ...testLocalDiscount,
                        type: testIncludeType,
                    },
                    true
                );
                expect(productAddInputComponent().addDisabled).toEqual(component.isLoading);

                component.isLoading = true;
                fixture.detectChanges();

                expect(productAddInputComponent().addDisabled).toEqual(component.isLoading);
            }));

            it('should accept the existing product codes as a parameter for existingProductCategoryCodes', fakeAsync(() => {
                initializeModel('edit');
                expect(productAddInputComponent().existingProductCategoryCodes).toContainEqual(
                    testProductCategory.category.code
                );
            }));

            it('should accept a search function as a parameter for searchFn', fakeAsync(() => {
                initializeModel('edit');
                expect(productAddInputComponent().searchFn).toEqual(component.searchProductsFn);
            }));

            it('should output category information to the addRequestedCategories method', fakeAsync(() => {
                jest.spyOn(component, 'addRequestedCategories');
                jest.spyOn(component, 'generateProductCategories').mockImplementationOnce(() => {});
                initializeModel('edit');
                expect(component.isLoading).toEqual(false);

                productAddInputComponent().categories.emit(addedCategories);

                expect(component.isLoading).toEqual(true);
                expect(component.addRequestedCategories).toHaveBeenCalledWith(addedCategories, 'PRODUCT');
                expect(component.generateProductCategories).toHaveBeenCalledWith(
                    component.form.getArray('discountCategories').getRawValue(),
                    addedCategories.map((p) => p.code)
                );
            }));

            it('should not be displayed if not in edit mode', fakeAsync(() => {
                initializeModel('view');
                expect(fixture.debugElement.query(By.css('#product-add-input'))).toBeNull();
            }));

            it('should mark product form group as dirty when adding a product', fakeAsync(() => {
                jest.spyOn(component, 'addRequestedCategories');
                jest.spyOn(component, 'generateProductCategories').mockImplementationOnce(() => {});
                initializeModel('edit');
                expect(component.form.dirty).toEqual(false);
                expect(component.unsavedChanges).toBeFalsy();

                // add a product
                productAddInputComponent().categories.emit(addedCategories);

                // validate that form is dirty
                expect(component.form.dirty).toEqual(true);
                expect(component.unsavedChanges).toBeTruthy();
            }));

            it('should not add a duplicate product', fakeAsync(() => {
                const generateProductCategoryResponse = new Subject<ProductCategory[]>();

                const testCategory1: ProductCategory = {
                    id: 16,
                    code: 'AIRFILTER',
                    description: 'Test AirFilter',
                    version: 0,
                };

                const testCategory2: ProductCategory = {
                    id: 17,
                    code: 'BT',
                    description: 'Test AirFilter',
                    version: 0,
                };

                jest.spyOn(component, 'addRequestedCategories');
                jest.spyOn(productCategoryFacade, 'generateCategories').mockReturnValue(
                    generateProductCategoryResponse
                );
                initializeModel('edit');

                const addProductsComponent = fixture.debugElement.query(By.css('#product-add-input'));
                addProductsComponent.triggerEventHandler('categories', [
                    { code: `${testCategory2.code}, ${testCategory1.code}` },
                ]); // add a product
                generateProductCategoryResponse.next([testCategory1, testCategory2]);
                fixture.detectChanges();
                flush();
                expect(component.messageFacade.addMessage).toHaveBeenCalledWith({
                    severity: 'error',
                    message: `Product category code(s) ${testCategory1.code} already added.`,
                    hasTimeout: true,
                });
                expect(component.existingProductCategoryCodes).toContainEqual(testCategory1.code);
                expect(component.existingProductCategoryCodes).toContainEqual(testCategory2.code);
            }));
        });

        describe('service category add input', () => {
            const ServiceCategoryAddInputComponent = () => {
                return fixture.debugElement.query(By.css('#service-add-input'))
                    .componentInstance as ServiceCategoryAddInputComponent;
            };
            const addedCategories = [{ id: 100, code: 'P100' }];

            it('should accept isLoading as a parameter for addDisabled', fakeAsync(() => {
                initializeModel(
                    'edit',
                    {
                        ...testLocalDiscount,
                        type: testIncludeType,
                    },
                    true
                );
                expect(ServiceCategoryAddInputComponent().addDisabled).toEqual(component.isLoading);

                component.isLoading = true;
                fixture.detectChanges();

                expect(ServiceCategoryAddInputComponent().addDisabled).toEqual(component.isLoading);
            }));

            it('should accept the existing product codes as a parameter for existingProductCategoryCodes', fakeAsync(() => {
                initializeModel('edit');
                expect(ServiceCategoryAddInputComponent().existingServiceCategoryCodes).toContainEqual(
                    testServiceCategory.category.code
                );
            }));

            it('should accept a search function as a parameter for searchFn', fakeAsync(() => {
                initializeModel('edit');
                expect(ServiceCategoryAddInputComponent().searchFn).toEqual(component.searchServicesFn);
            }));

            it('should output category information to the addRequestedCategories method', fakeAsync(() => {
                jest.spyOn(component, 'addRequestedCategories');
                jest.spyOn(component, 'generateServiceCategories').mockImplementationOnce(() => {});
                initializeModel('edit');
                expect(component.isLoading).toEqual(false);

                ServiceCategoryAddInputComponent().categories.emit(addedCategories);

                expect(component.isLoading).toEqual(true);
                expect(component.addRequestedCategories).toHaveBeenCalledWith(addedCategories, 'SERVICE');
                expect(component.generateServiceCategories).toHaveBeenCalledWith(
                    component.form.getArray('discountCategories').getRawValue(),
                    addedCategories.map((p) => p.code)
                );
            }));

            it('should not be displayed if not in edit mode', fakeAsync(() => {
                initializeModel('view');
                expect(fixture.debugElement.query(By.css('#service-add-input'))).toBeNull();
            }));

            it('should mark service form group as dirty when adding a service', fakeAsync(() => {
                jest.spyOn(component, 'addRequestedCategories');
                jest.spyOn(component, 'generateServiceCategories').mockImplementationOnce(() => {});
                initializeModel('edit');
                expect(component.form.dirty).toEqual(false);
                expect(component.unsavedChanges).toBeFalsy();

                // add a product
                ServiceCategoryAddInputComponent().categories.emit(addedCategories);

                // validate that form is dirty
                expect(component.form.dirty).toEqual(true);
                expect(component.unsavedChanges).toBeTruthy();
            }));

            it('should not add a duplicate services', fakeAsync(() => {
                const generateServiceCategoryResponse = new Subject<ServiceCategory[]>();

                const testCategory1: ServiceCategory = {
                    id: 16,
                    code: 'BT',
                    description: 'Test AirFilter',
                    version: 0,
                };

                const testCategory2: ServiceCategory = {
                    id: 17,
                    code: 'AIRFILTER',
                    description: 'Test AirFilter',
                    version: 0,
                };

                jest.spyOn(component, 'addRequestedCategories');
                jest.spyOn(serviceCategoryFacade, 'generateCategories').mockReturnValue(
                    generateServiceCategoryResponse
                );
                initializeModel('edit');

                const addServiceComponent = fixture.debugElement.query(By.css('#service-add-input'));
                addServiceComponent.triggerEventHandler('categories', [
                    { code: `${testCategory2.code}, ${testCategory1.code}` },
                ]); // add a product
                generateServiceCategoryResponse.next([testCategory1, testCategory2]);
                fixture.detectChanges();
                flush();
                expect(component.messageFacade.addMessage).toHaveBeenCalledWith({
                    severity: 'error',
                    message: `Service category code(s) ${testCategory1.code} already added.`,
                    hasTimeout: true,
                });
                expect(component.existingServiceCategoryCodes).toContainEqual(testCategory1.code);
                expect(component.existingServiceCategoryCodes).toContainEqual(testCategory2.code);
            }));
        });
    });

    describe('add mode', () => {
        const setRequiredFields = (discount: Discount) => {
            component.form.setControlValue('code', discount.code);
            component.form.setControlValue('description', discount.description);
            component.form.setControlValue('startDate', discount.startDate);
            component.form.setControlValue('endDate', discount.endDate);
            component.form.setControlValue('type', discount.type);
            component.form.setControlValue('approach', discount.approach);
            component.form.setControlValue('amount', discount.amount);
            fixture.detectChanges();
            tick(200); // clear timers in queue
            component.form.updateValueAndValidity();
        };

        beforeEach(() => {
            discountFacade.save = jest.fn(() => of(testAddLocalDiscount));
            messageFacade = TestBed.inject(MessageFacade);
            router = TestBed.inject(Router);
            jest.spyOn(component.commonCodeFacade, 'findByType').mockReturnValue(
                of([testExcludeType, testIncludeType, testInvoiceType])
            );
            jest.spyOn(component, 'setDiscountType');
            jest.spyOn(component, 'setDiscountCode');
            jest.spyOn(component, 'storeAssignment');
        });

        it('should populate company dropdown with companies user has security for', fakeAsync(() => {
            initialize('add', 'local');
            openDropdown('#company-dropdown');
            const options = fixture.debugElement.queryAll(By.directive(MatOption));
            // including blank option
            expect(options.length).toEqual(2);
            expect(options[1].nativeElement.textContent).toEqual(` ${testCompany.code} - ${testCompany.description} `);
        }));

        it('should include a blank option for company dropdown', fakeAsync(() => {
            initialize('add', 'local');
            openDropdown('#company-dropdown');
            const options = fixture.debugElement.queryAll(By.directive(MatOption));
            expect(options[0].nativeElement.textContent.trim()).toEqual('');
        }));

        it('should allow selecting a company', fakeAsync(() => {
            initialize('add', 'local');
            openDropdown('#company-dropdown');
            clickOption(1);
            expect(component.form.getControlValue('company')).toEqual(testCompany);
        }));

        it('should require a company for local discount add', fakeAsync(() => {
            jest.spyOn(component.roleFacade, 'getMyRoles').mockReturnValue(
                of(['ROLE_LOCAL_DISCOUNT_UPDATE', 'ROLE_LOCAL_DISCOUNT_ADD'])
            );
            initialize('add', 'local');
            component.form.patchControlValue('company', null);
            component.form.updateValueAndValidity();
            expect(component.form.getControl('company').hasError('required')).toBe(true);
        }));

        it('should clear stores selected if company changes before save', fakeAsync(() => {
            jest.spyOn(component, 'clearSelected');
            initialize('add', 'local');
            // Trigger a selection change on company field and ensure store selection reset
            fixture.debugElement.query(By.css('#company-dropdown')).triggerEventHandler('selectionChange');
            fixture.detectChanges();
            expect(component.clearSelected).toHaveBeenCalledTimes(1);
        }));

        it('should allow selecting an applies to value', fakeAsync(() => {
            initialize('add', 'local');
            openDropdown('#appliesTo');
            clickOption(3);
            tick(200); // clear timers in queue
            expect(component.form.getControlValue('type')).toEqual(testInvoiceType);
        }));

        describe.each`
            formState    | saveEnabled | applyEnabled | cancelEnabled
            ${'valid'}   | ${true}     | ${true}      | ${true}
            ${'invalid'} | ${false}    | ${false}     | ${true}
        `(`with $formState form`, ({ formState, saveEnabled, applyEnabled, cancelEnabled }) => {
            beforeEach(fakeAsync(async () => {
                initialize('add', 'national');
                if (formState === 'invalid') {
                    component.form.setErrors({ invalid: true });
                }
                if (formState === 'valid') {
                    // Create a valid form, all required fields should be populated
                    setRequiredFields({
                        ...testNationalDiscount,
                        type: testInvoiceType,
                        approach: testApproach,
                        amount: 5,
                    });
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
            it('should save once and redirect to the edit page for local discounts', fakeAsync(() => {
                jest.spyOn(component, 'ngOnInit');
                jest.spyOn(discountFacade, 'save').mockReturnValue(of(testLocalDiscount));
                initialize('add', 'local');

                const storesComponent: MockDiscountsStoreAssignmentComponent = fixture.debugElement.query(
                    By.directive(MockDiscountsStoreAssignmentComponent)
                ).componentInstance;
                expect(storesComponent.initiateCompanySearch).toEqual(undefined);
                expect(storesComponent.initiateRegionSearch).toEqual(undefined);
                expect(storesComponent.initiateMarketSearch).toEqual(undefined);

                // Create valid form
                component.form.setControlValue('company', testLocalDiscount.company);
                setRequiredFields(testLocalDiscount);

                // Click apply
                getApplyActionButton(fixture).nativeElement.click();
                // Adding extra clicks to ensure save is called once
                getApplyActionButton(fixture).nativeElement.click();
                getApplyActionButton(fixture).nativeElement.click();
                tick(600); // tick to account for debounce time and time to re-enable button
                const discountCodeWithPrefix = testLocalDiscount.company.code
                    .slice(0, 2)
                    .concat(testLocalDiscount.code);
                expect(component.setDiscountCode).toHaveBeenCalled();
                expect(component.setDiscountType).toHaveBeenCalled();
                expect(component.storeAssignment).toHaveBeenCalled();
                expect(discountFacade.save).toHaveBeenCalledTimes(1);
                expect(router.navigate).toHaveBeenCalledWith(
                    [`/maintenance/discount/edit/${testLocalDiscount.company.code}/${discountCodeWithPrefix}`],
                    expect.anything()
                );
                expect(component.messageFacade.addMessage).toHaveBeenCalledTimes(1);
            }));

            it('should save once and redirect to the edit page for national discounts', fakeAsync(() => {
                jest.spyOn(component, 'ngOnInit');
                jest.spyOn(discountFacade, 'save').mockReturnValue(of(testNationalDiscount));
                initialize('add', 'national');

                // Create valid form for national discount
                component.form.setControlValue('company', null);
                setRequiredFields(testNationalDiscount);

                // Click apply
                getApplyActionButton(fixture).nativeElement.click();
                // Adding extra clicks to ensure save is called once
                getApplyActionButton(fixture).nativeElement.click();
                getApplyActionButton(fixture).nativeElement.click();
                tick(600); // tick to account for debounce time and time to re-enable button
                const discountCodeWithPrefix = 'NA'.concat(testNationalDiscount.code);
                expect(component.setDiscountCode).toHaveBeenCalled();
                expect(component.setDiscountType).toHaveBeenCalled();
                expect(component.storeAssignment).toHaveBeenCalled();
                expect(discountFacade.save).toHaveBeenCalledTimes(1);
                expect(router.navigate).toHaveBeenCalledWith(
                    [`/maintenance/discount/edit/${discountCodeWithPrefix}`],
                    expect.anything()
                );
                expect(component.messageFacade.addMessage).toHaveBeenCalledTimes(1);
            }));

            it('should be redirected to the edit page after apply and maintain filter values', fakeAsync(() => {
                initialize('add', 'local');
                jest.spyOn(component, 'ngOnInit');
                jest.spyOn(discountFacade, 'save').mockReturnValue(of(testLocalDiscount));
                const storesComponent: MockDiscountsStoreAssignmentComponent = fixture.debugElement.query(
                    By.directive(MockDiscountsStoreAssignmentComponent)
                ).componentInstance;
                storesComponent.companyControl.setValue(testCompany);
                storesComponent.regionControl.setValue(testRegion);
                storesComponent.marketControl.setValue(testMarket);
                // Should not have an initial value on first load
                expect(component.initiateCompanySearch).toEqual(undefined);
                expect(component.initiateRegionSearch).toEqual(undefined);
                expect(component.initiateMarketSearch).toEqual(undefined);

                // Create valid form
                component.form.setControlValue('company', testLocalDiscount.company);
                setRequiredFields(testLocalDiscount);

                // Click apply
                getApplyActionButton(fixture).nativeElement.click();
                tick(600); // tick to account for debounce time and time to re-enable button
                const discountCodeWithPrefix = testLocalDiscount.company.code
                    .slice(0, 2)
                    .concat(testLocalDiscount.code);
                expect(component.setDiscountCode).toHaveBeenCalled();
                expect(component.setDiscountType).toHaveBeenCalled();
                expect(component.storeAssignment).toHaveBeenCalled();
                expect(discountFacade.save).toHaveBeenCalledTimes(1);
                expect(router.navigate).toHaveBeenCalledWith(
                    [`/maintenance/discount/edit/${testLocalDiscount.company.code}/${discountCodeWithPrefix}`],
                    expect.anything()
                );
                expect(component.messageFacade.addMessage).toHaveBeenCalledTimes(1);
                // Should be set to the last filters the user set
                expect(component.initiateCompanySearch).toEqual(storesComponent.companyControl.value);
                expect(component.initiateRegionSearch).toEqual(storesComponent.regionControl.value);
                expect(component.initiateMarketSearch).toEqual(storesComponent.marketControl.value);
            }));

            it('should show loading overlay when processing', fakeAsync(() => {
                const applySubject = new Subject();
                discountFacade.save = jest.fn(() => applySubject);
                initialize('add', 'local');
                const storesComponent: MockDiscountsStoreAssignmentComponent = fixture.debugElement.query(
                    By.directive(MockDiscountsStoreAssignmentComponent)
                ).componentInstance;
                expect(storesComponent.initiateCompanySearch).toEqual(undefined);
                expect(storesComponent.initiateRegionSearch).toEqual(undefined);
                expect(storesComponent.initiateMarketSearch).toEqual(undefined);

                // Create valid form
                component.form.setControlValue('company', testLocalDiscount.company);
                setRequiredFields(testLocalDiscount);

                // Click apply
                getApplyActionButton(fixture).nativeElement.click();
                tick(600); // tick to account for debounce time and time to re-enable button
                expect(component.isLoading).toBeTruthy();

                applySubject.next(null);
                flush();

                expect(component.isLoading).toBeFalsy();
            }));
        });

        describe('save button', () => {
            it('should save once and navigate back to the search page', fakeAsync(() => {
                jest.spyOn(component.saveFacade, 'save');
                initialize('add', 'local');

                // Create valid form
                component.form.setControlValue('company', testLocalDiscount.company);
                setRequiredFields({ ...testLocalDiscount, type: testInvoiceType });

                // Click apply
                getSaveActionButton(fixture).nativeElement.click();
                // Adding additional save clicks to ensure save is only called once
                getSaveActionButton(fixture).nativeElement.click();
                getSaveActionButton(fixture).nativeElement.click();

                tick(600); // tick to account for debounce time and time to re-enable button
                const discountCodeWithPrefix = testLocalDiscount.company.code
                    .slice(0, 2)
                    .concat(testLocalDiscount.code);
                expect(component.setDiscountCode).toHaveBeenCalled();
                expect(component.setDiscountType).toHaveBeenCalled();
                expect(component.storeAssignment).toHaveBeenCalled();
                expect(discountFacade.save).toHaveBeenCalledWith(testAddLocalDiscount);
                expect(messageFacade.addMessage).toHaveBeenCalledWith({
                    message: `Discount ${discountCodeWithPrefix} saved successfully`,
                    severity: 'info',
                });
                expect(component.saveFacade.save).toHaveBeenCalledTimes(1);
                expect(component.saveFacade.save).toHaveBeenCalledWith(
                    component.form,
                    component.model,
                    component['route']
                );

                expect(routerService.navigateToSearchPage).toHaveBeenCalled();
            }));

            it('should show loading overlay when processing', fakeAsync(() => {
                const saveSubject = new Subject();
                discountFacade.save = jest.fn(() => saveSubject);
                initialize('add', 'local');
                // Create valid form
                component.form.setControlValue('company', testLocalDiscount.company);
                setRequiredFields(testLocalDiscount);

                // Click apply
                getSaveActionButton(fixture).nativeElement.click();
                fixture.detectChanges();
                tick(600); // tick to account for debounce time and time to re-enable button
                expect(component.isLoading).toBeTruthy();

                saveSubject.next(null);
                flush();

                expect(component.isLoading).toBeFalsy();
            }));
        });
    });
});
