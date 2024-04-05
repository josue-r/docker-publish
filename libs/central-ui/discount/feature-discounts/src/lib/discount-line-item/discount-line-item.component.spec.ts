import { ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';

import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ChangeDetectorRef } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCheckboxHarness } from '@angular/material/checkbox/testing';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { Discount } from '@vioc-angular/central-ui/discount/data-access-discount';
import { RouterService } from '@vioc-angular/central-ui/util-router';
import { AuthenticationFacade } from '@vioc-angular/security/data-access-security';
import { AccessMode } from '@vioc-angular/security/util-authorization';
import { CommonFunctionalityModule } from '@vioc-angular/shared/common-functionality';
import { MessageFacade } from '@vioc-angular/shared/data-access-message';
import { UiButtonModule } from '@vioc-angular/shared/ui-button';
import { UiFilteredInputMockModule } from '@vioc-angular/shared/ui-filtered-input';
import { UiLoadingMockModule } from '@vioc-angular/shared/ui-loading';
import { GATEWAY_TOKEN } from '@vioc-angular/shared/util-api';
import { FormFactory, TypedFormGroup, UtilFormModule } from '@vioc-angular/shared/util-form';
import { DiscountCategory } from 'libs/central-ui/discount/data-access-discount/src/lib/model/discount-category.model';
import { EMPTY, ReplaySubject } from 'rxjs';
import { DiscountModuleForms } from '../discount-module-forms';
import { DiscountsComponent } from '../discounts/discounts.component';
import { DiscountLineItemComponent } from './discount-line-item.component';

describe('DiscountLineItemComponent', () => {
    let component: DiscountLineItemComponent;
    let fixture: ComponentFixture<DiscountLineItemComponent>;
    let formBuilder: FormBuilder;
    let formFactory: FormFactory;
    let messageFacade: MessageFacade;
    let loader: HarnessLoader;
    let componentDestroyed: ReplaySubject<any>;

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
    const testExcludeLineItem = {
        id: '12',
        code: 'EXCLUDE_LINEITEM',
        description: 'Test Type EXCLUDE_LINEITEM',
        version: 0,
    };

    const testLineItem = {
        id: '12',
        code: 'LINEITEM',
        description: 'Test Type LINEITEM',
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
    const testNationalDiscount: Discount = {
        id: '100',
        company: null,
        startDate: '03-03-2024',
        expirationDate: '11-30-2024',
        endDate: '12-30-2024',
        code: 'testCode',
        description: 'Test Discount Description',
        type: testExcludeLineItem,
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

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [DiscountsComponent, DiscountLineItemComponent],
            imports: [
                NoopAnimationsModule,
                HttpClientTestingModule,
                ReactiveFormsModule,
                MatCheckboxModule,
                MatFormFieldModule,
                MatInputModule,
                MatSelectModule,
                MatTableModule,
                MatSortModule,
                UtilFormModule,
                UiLoadingMockModule,
                UiButtonModule,
                UiFilteredInputMockModule,
                CommonFunctionalityModule,
            ],
            providers: [
                FormFactory,
                { provide: GATEWAY_TOKEN, useValue: '//gateway/' },
                { provide: HttpClient, useValue: {} },
                { provide: Router, useValue: { navigate: jest.fn() } },
                { provide: MessageFacade, useValue: { addMessage: jest.fn() } },
                {
                    provide: AuthenticationFacade,
                    useValue: { getUser: () => EMPTY } as any as AuthenticationFacade,
                },
                { provide: RouterService, useValue: { navigateToSearchPage: jest.fn() } },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(DiscountLineItemComponent);
        component = fixture.componentInstance;
        formFactory = TestBed.inject(FormFactory);
        formBuilder = TestBed.inject(FormBuilder);
        loader = TestbedHarnessEnvironment.loader(fixture);
        DiscountModuleForms.registerForms(formFactory, formBuilder);
        componentDestroyed = new ReplaySubject(1);
    });

    const changeDetector = {} as ChangeDetectorRef;

    const initialize = (accessMode: 'view' | 'edit', discount = testNationalDiscount, andflush = true) => {
        const mode = AccessMode.of(accessMode);
        component.renderSelection = true;
        component.accessMode = mode;
        component.model = discount;
        component.form = formFactory.group('Discount', discount, componentDestroyed, {
            accessMode: mode,
            changeDetector: changeDetector,
        });
        component.category$.next(
            new MatTableDataSource(
                component.form.getArray('discountCategories').controls as TypedFormGroup<DiscountCategory>[]
            )
        );
        if (andflush) {
            flush();
        }
    };

    const getButton = async (selector: string): Promise<MatButtonHarness> =>
        await loader.getHarness(MatButtonHarness.with({ selector }));

    const clickButton = async (selector: string): Promise<void> => await (await getButton(selector)).click();

    const clickCheckbox = async (selector: string) => {
        const checkbox = await getCheckbox(selector);
        await checkbox.toggle();
    };

    const getCheckbox = (selector: string) => {
        return loader.getHarness(
            MatCheckboxHarness.with({
                selector,
            })
        );
    };

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should allow the user to select all records', fakeAsync(async () => {
        initialize('edit');
        await clickCheckbox('#master-checkbox');
        fixture.detectChanges();
        expect(component.selection.selected.length).toEqual(
            component.form.getArray('discountCategories').controls.length
        );
    }));

    it('should emit onRemove', fakeAsync(async () => {
        const spy = jest.spyOn(component.onRemove, 'emit');
        initialize('edit');
        await clickCheckbox('#master-checkbox');
        await clickButton('#remove-category-button');
        fixture.detectChanges();
        expect(component.selection.selected.length).toEqual(
            component.form.getArray('discountCategories').controls.length
        );
        expect(spy).toHaveBeenCalledWith({ selection: component.selection, table: component.table });
    }));

    describe.each`
        accessMode | type
        ${'edit'}  | ${testLineItem}
        ${'edit'}  | ${testExcludeLineItem}
        ${'view'}  | ${testLineItem}
        ${'view'}  | ${testExcludeLineItem}
    `(`while in accessMode $accessMode`, ({ accessMode, type }) => {
        it(`should display line item columns for #${type} type  while discount has a  ${accessMode} accessMode`, fakeAsync(() => {
            initialize(
                accessMode,
                {
                    ...testNationalDiscount,
                    type: type,
                },
                false
            );
            fixture.detectChanges();
            flush();
            if (type.code === component.discountExcludeLineItem) {
                expect(component.lineItemColumns).toEqual(component.excludedLineItemColumns);
            } else if (type.code === component.discountLineItem) {
                expect(component.lineItemColumns).toEqual(component.includedLineItemColumns);
            }
        }));
    });
});
