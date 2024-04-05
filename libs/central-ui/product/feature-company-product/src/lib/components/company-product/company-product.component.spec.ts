import { HttpClient } from '@angular/common/http';
import { DebugElement } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
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
import {
    CompanyExportFacade,
    CompanyExportValidators,
} from '@vioc-angular/central-ui/organization/company/data-access-company-export';
import { CompanyProduct, CompanyProductFacade } from '@vioc-angular/central-ui/product/data-access-company-product';
import { RouterService } from '@vioc-angular/central-ui/util-router';
import { AccessMode } from '@vioc-angular/security/util-authorization';
import { CommonFunctionalityModule, Described } from '@vioc-angular/shared/common-functionality';
import { MessageFacade } from '@vioc-angular/shared/data-access-message';
import { UiActionBarModule } from '@vioc-angular/shared/ui-action-bar';
import { UiAuditModule } from '@vioc-angular/shared/ui-audit';
import { MockLoadingOverlayComponent, UiLoadingMockModule } from '@vioc-angular/shared/ui-loading';
import { GATEWAY_TOKEN } from '@vioc-angular/shared/util-api';
import { FormFactory, TypedFormGroup, UtilFormModule } from '@vioc-angular/shared/util-form';
import { getApplyActionButton, getCancelActionButton, getSaveActionButton } from '@vioc-angular/test/util-test';
import { of, ReplaySubject, Subject } from 'rxjs';
import { CompanyProductModuleForms } from '../../company-product-module-forms';
import { CompanyProductComponent } from './company-product.component';
describe('CompanyProductComponent', () => {
    let component: CompanyProductComponent;
    let fixture: ComponentFixture<CompanyProductComponent>;
    let formFactory: FormFactory;
    let messageFacade: MessageFacade;
    let commonCodeFacade: CommonCodeFacade;
    let companyProductFacade: CompanyProductFacade;
    let companyExportFacade: CompanyExportFacade;

    // Configure values of these fields at the test level

    const companyProduct: CompanyProduct = {
        id: { productId: 1, companyId: 2 },
        version: 0,
        salesAccount: { code: 'c1' },
        costAccount: { code: 'c2' },
        active: true,
        company: { code: 'C', description: 'Company' },
        product: {
            id: 1,
            version: 0,
            code: 'P',
            description: 'Product',
            productCategory: { code: 'cat' },
        },
        uom: { code: 'qt' },
        reportOrder: 'test',
    };
    const routeParams = new Subject();
    const componentDestroyed = new ReplaySubject(1);

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CompanyProductComponent],
            imports: [
                ReactiveFormsModule,
                UiLoadingMockModule,
                NoopAnimationsModule,
                MatOptionModule,
                MatCheckboxModule,
                MatFormFieldModule,
                MatSelectModule,
                MatInputModule,
                MatButtonModule,
                UtilFormModule,
                UiAuditModule,
                UiActionBarModule,
                CommonFunctionalityModule,
            ],
            providers: [
                FormFactory,
                { provide: ActivatedRoute, useValue: { params: routeParams } },
                { provide: RouterService, useValue: { navigateToSearchPage: jest.fn() } },
                { provide: Router, useValue: { navigate: jest.fn() } },
                { provide: HttpClient, useValue: {} },
                { provide: MessageFacade, useValue: new MessageFacade(null) },
                { provide: GATEWAY_TOKEN, useValue: '//gateway/' },
                CompanyExportValidators,
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CompanyProductComponent);
        messageFacade = TestBed.inject(MessageFacade);
        component = fixture.componentInstance;
        companyProductFacade = component.companyProductFacade;
        commonCodeFacade = component.commonCodeFacade;
        companyExportFacade = component.companyExportFacade;
        formFactory = TestBed.inject(FormFactory);
        CompanyProductModuleForms.registerForms(
            formFactory,
            TestBed.inject(FormBuilder),
            TestBed.inject(CompanyExportValidators)
        );

        // Create common mocking
        jest.spyOn(messageFacade, 'addMessage').mockImplementation();
    });

    const initialize = (accessMode: AccessMode, companyCode = 'VAL', productCode = '54231') => {
        const route = TestBed.inject(ActivatedRoute);
        route.snapshot = {
            paramMap: convertToParamMap({
                accessMode: accessMode.urlSegement,
                productCode,
                companyCode,
            }),
        } as ActivatedRouteSnapshot;
        fixture.detectChanges();
    };

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display loading overlay if isLoading', fakeAsync(() => {
        jest.spyOn(companyProductFacade, 'findByCompanyAndProductCode').mockReturnValue(of(companyProduct));
        jest.spyOn(commonCodeFacade, 'findByType').mockReturnValue(of(Described.fromCodes('gal', 'qt')));
        jest.spyOn(companyExportFacade, 'findByCompanyAndType').mockReturnValue(of(Described.fromCodes('c1', 'c2')));
        initialize(AccessMode.EDIT);
        flush();
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
            jest.spyOn(companyProductFacade, 'findByCompanyAndProductCode').mockReturnValue(of(companyProduct));
            jest.spyOn(commonCodeFacade, 'findByType').mockReturnValue(of(Described.fromCodes('gal', 'qt')));
            jest.spyOn(companyExportFacade, 'findByCompanyAndType').mockReturnValue(
                of(Described.fromCodes('c1', 'c2'))
            );
            router = TestBed.inject(Router);
        });
        it('should navigate to the search page when clicking cancel button', fakeAsync(() => {
            initialize(AccessMode.EDIT);
            flush();
            fixture.debugElement.query(By.css('#cancel-action')).nativeElement.click();

            expect(router.navigate).toHaveBeenCalledWith(['search'], {
                relativeTo: TestBed.inject(ActivatedRoute).parent,
            });
        }));
    });

    describe('ngOnInit', () => {
        it('should convert the form and assume ADD mode if the form imput is set', () => {
            component.form = formFactory.group('CompanyProduct', companyProduct, componentDestroyed);
            jest.spyOn(component, 'createForm').mockImplementation();
            jest.spyOn(companyProductFacade, 'findByCompanyAndProductCode').mockImplementation();

            fixture.detectChanges();

            expect(component.createForm).toHaveBeenCalled();
            expect(companyProductFacade.findByCompanyAndProductCode).not.toHaveBeenCalled();
            expect(component.accessMode.isAdd).toEqual(true);
        });

        it('should build the form from the route params if form imput is set', fakeAsync(() => {
            jest.spyOn(companyProductFacade, 'findByCompanyAndProductCode').mockImplementation(() =>
                of({ id: { companyId: 1, productId: 2 } })
            );
            jest.spyOn(component, 'createForm').mockImplementation();

            initialize(AccessMode.EDIT, 'VAL', '1234');
            flush();

            expect(component.createForm).toHaveBeenCalledWith({ id: { companyId: 1, productId: 2 } });
        }));
    });

    describe('createForm', () => {
        const uoms = Described.fromCodes('qt', 'gal');
        const costs = Described.fromCodes('ca1', 'ca2');
        const sales = Described.fromCodes('sa1', 'sa2');

        it.each`
            accessMode | costAcntInModel | salesAcntInModel | uomInModel | costAcntDropdown | salesAcntDropdown | uomDropdown  | enabled
            ${'view'}  | ${undefined}    | ${null}          | ${uoms[0]} | ${[]}            | ${[]}             | ${[uoms[0]]} | ${false}
            ${'view'}  | ${costs[0]}     | ${sales[0]}      | ${uoms[0]} | ${[costs[0]]}    | ${[sales[0]]}     | ${[uoms[0]]} | ${false}
            ${'edit'}  | ${undefined}    | ${null}          | ${uoms[0]} | ${costs}         | ${sales}          | ${uoms}      | ${true}
            ${'edit'}  | ${costs[0]}     | ${sales[0]}      | ${uoms[0]} | ${costs}         | ${sales}          | ${uoms}      | ${true}
            ${'add'}   | ${undefined}    | ${null}          | ${uoms[0]} | ${costs}         | ${sales}          | ${uoms}      | ${true}
            ${'add'}   | ${costs[0]}     | ${sales[0]}      | ${uoms[0]} | ${costs}         | ${sales}          | ${uoms}      | ${true}
        `(
            `should set dropdowns with accessMode=$accessMode, costAccount=$costAcntInModel, salesAcount=$salesAcntInModel`,
            async ({
                accessMode,
                costAcntInModel,
                salesAcntInModel,
                uomInModel,
                costAcntDropdown,
                salesAcntDropdown,
                uomDropdown,
                enabled,
            }) => {
                jest.spyOn(formFactory, 'group').mockImplementation(() => new TypedFormGroup(new FormGroup({})));
                jest.spyOn(companyExportFacade, 'findByCompanyAndType').mockImplementation((company, type) =>
                    type === 'COST' ? of(costs) : of(sales)
                );
                jest.spyOn(commonCodeFacade, 'findByType').mockImplementation(() => of(uoms));

                component.accessMode = AccessMode.of(accessMode);
                component.createForm({
                    company: { code: 'VAL' },
                    costAccount: costAcntInModel,
                    salesAccount: salesAcntInModel,
                    uom: uomInModel,
                });

                expect(await component.costAccounts$.toPromise()).toEqual(costAcntDropdown);
                expect(await component.salesAccounts$.toPromise()).toEqual(salesAcntDropdown);
                expect(await component.unitOfMeasures$.toPromise()).toEqual(uomDropdown);
                expect(component.form.enabled).toEqual(enabled);
            }
        );
    });

    describe('add access', () => {
        // TODO: Migrate when add functionality is enabled
        // it('should hide non-add elements', fakeAsync(() => {
        //     component.form = formFactory.group('CompanyProduct', companyProduct, componentDestroyed);
        //     jest.spyOn(commonCodeFacade, 'findActiveByType').mockReturnValue(of(Described.fromCodes('gal', 'qt')));
        //     jest.spyOn(companyExportFacade, 'findByCompanyAndType').mockReturnValue(
        //         of(Described.fromCodes('c1', 'c2'))
        //     );
        //     fixture.detectChanges();
        //     //the action bar should not be displayed
        //     const actions = fixture.debugElement.query(By.css('.actions'));
        //     expect(actions).toBeFalsy();
        //     //product fields should be labeled Products with add access
        //     const product = fixture.debugElement.query(By.css('#product'));
        //     expect(product.nativeElement.placeholder).toBe('Products');
        //     //the product category not be displayed
        //     expect(fixture.debugElement.query(By.css('#product-category'))).toBeFalsy();
        //     //the inventory description not be displayed
        //     expect(fixture.debugElement.query(By.css('#invoice-description'))).toBeFalsy();
        // }));
    });

    describe.each`
        accessMode | saveVisible | applyVisible | cancelVisible
        ${'view'}  | ${false}    | ${false}     | ${true}
        ${'edit'}  | ${true}     | ${true}      | ${true}
        ${'add'}   | ${false}    | ${false}     | ${false}
    `(`with accessMode=$accessMode`, ({ accessMode, saveVisible, applyVisible, cancelVisible }) => {
        beforeEach(() => {
            jest.spyOn(companyProductFacade, 'findByCompanyAndProductCode').mockReturnValue(of(companyProduct));
            jest.spyOn(commonCodeFacade, 'findByType').mockReturnValue(of(Described.fromCodes('gal', 'qt')));
            jest.spyOn(companyExportFacade, 'findByCompanyAndType').mockReturnValue(
                of(Described.fromCodes('c1', 'c2'))
            );
            initialize(AccessMode.of(accessMode));
        });

        function testVisibility(button: DebugElement, visible: boolean) {
            if (visible) {
                expect(button).toBeTruthy();
            } else {
                expect(button).toBeFalsy();
            }
        }

        it(`save button should be ${saveVisible ? '' : 'not '}visible`, () => {
            testVisibility(getSaveActionButton(fixture), saveVisible);
        });

        it(`apply button should be ${applyVisible ? '' : 'not '}visible`, () => {
            testVisibility(getApplyActionButton(fixture), applyVisible);
        });

        it(`cancel button should be ${cancelVisible ? '' : 'not '}visible`, () => {
            testVisibility(getCancelActionButton(fixture), cancelVisible);
        });
    });

    describe.each`
        formState    | saveEnabled | applyEnabled | cancelEnabled
        ${'valid'}   | ${true}     | ${true}      | ${true}
        ${'invalid'} | ${false}    | ${false}     | ${true}
    `(`with $formState form`, ({ formState, saveEnabled, applyEnabled, cancelEnabled }) => {
        beforeEach(() => {
            jest.spyOn(companyProductFacade, 'findByCompanyAndProductCode').mockReturnValue(of(companyProduct));
            jest.spyOn(commonCodeFacade, 'findByType').mockReturnValue(of(Described.fromCodes('gal', 'qt')));
            jest.spyOn(companyExportFacade, 'findByCompanyAndType').mockReturnValue(
                of(Described.fromCodes('c1', 'c2'))
            );
            initialize(AccessMode.EDIT);
            if (formState !== 'valid') {
                component.form.setErrors({ invalid: true });
            }
            fixture.detectChanges();
        });

        it(`save button should be ${saveEnabled ? 'en' : 'dis'}abled`, () => {
            expect(getSaveActionButton(fixture).nativeElement.disabled).toBe(!saveEnabled);
        });

        it(`apply button should be ${applyEnabled ? 'en' : 'dis'}abled`, () => {
            expect(getApplyActionButton(fixture).nativeElement.disabled).toBe(!applyEnabled);
        });

        it(`cancel button should be ${cancelEnabled ? 'en' : 'dis'}abled`, () => {
            expect(getCancelActionButton(fixture).nativeElement.disabled).toBe(!cancelEnabled);
        });
    });

    describe('action buttons', () => {
        beforeEach(() => {
            jest.spyOn(companyProductFacade, 'findByCompanyAndProductCode').mockReturnValue(of(companyProduct));
            jest.spyOn(commonCodeFacade, 'findByType').mockReturnValue(of(Described.fromCodes('gal', 'qt')));
            jest.spyOn(companyExportFacade, 'findByCompanyAndType').mockReturnValue(
                of(Described.fromCodes('c1', 'c2'))
            );
        });

        describe('save button', () => {
            it('should trigger save only once on multiple clicks', fakeAsync(() => {
                initialize(AccessMode.EDIT);
                jest.spyOn(component.saveFacade, 'save').mockReturnValue(of({}));

                const saveButton = getSaveActionButton(fixture);
                expect(saveButton).toBeTruthy();

                saveButton.nativeElement.click();
                saveButton.nativeElement.click();
                saveButton.nativeElement.click();
                tick(600);
                fixture.detectChanges();
                expect(component.saveFacade.save).toHaveBeenCalledTimes(1);
            }));

            it('should save on click ', fakeAsync(() => {
                initialize(AccessMode.EDIT);
                jest.spyOn(component.saveFacade, 'save').mockReturnValue(of({}));

                getSaveActionButton(fixture).nativeElement.click();
                tick(600);
                expect(component.saveFacade.save).toHaveBeenCalled();
            }));

            it('should show loading overlay when processing', fakeAsync(() => {
                const saveSubject = new Subject();
                jest.spyOn(companyProductFacade, 'update').mockReturnValue(saveSubject);
                initialize(AccessMode.EDIT);
                getSaveActionButton(fixture).nativeElement.click();
                tick(600);
                fixture.detectChanges();
                expect(component.isLoading).toBeTruthy();
                saveSubject.next(null);
                expect(component.isLoading).toBeFalsy();
            }));

            it('should cancel loading overlay if an error occurs', fakeAsync(() => {
                const saveSubject = new Subject();
                jest.spyOn(companyProductFacade, 'update').mockReturnValue(saveSubject);
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
            it('should trigger apply only once on multiple clicks', fakeAsync(() => {
                initialize(AccessMode.EDIT);
                jest.spyOn(component.saveFacade, 'apply').mockReturnValue(of({}));

                const applyButton = getApplyActionButton(fixture);
                expect(applyButton).toBeTruthy();

                applyButton.nativeElement.click();
                applyButton.nativeElement.click();
                applyButton.nativeElement.click();
                tick(600);

                expect(component.saveFacade.apply).toHaveBeenCalledTimes(1);
            }));

            it('apply button should save on click ', fakeAsync(() => {
                initialize(AccessMode.EDIT);
                jest.spyOn(component.saveFacade, 'apply').mockReturnValue(of({}));
                getApplyActionButton(fixture).nativeElement.click();
                tick(600);
                expect(component.saveFacade.apply).toHaveBeenCalled();
            }));

            it('should show loading overlay when processing', fakeAsync(() => {
                const applySubject = new Subject();
                jest.spyOn(companyProductFacade, 'update').mockReturnValue(applySubject);
                initialize(AccessMode.EDIT);
                getApplyActionButton(fixture).nativeElement.click();
                tick(600);

                expect(component.isLoading).toBeTruthy();

                applySubject.next(null);

                expect(component.isLoading).toBeFalsy();
            }));

            it('should cancel loading overlay if an error occurs', fakeAsync(() => {
                const applySubject = new Subject();
                jest.spyOn(companyProductFacade, 'update').mockReturnValue(applySubject);
                initialize(AccessMode.EDIT);
                getApplyActionButton(fixture).nativeElement.click();
                tick(600);
                expect(component.isLoading).toBeTruthy();

                expect(() => {
                    applySubject.error('An error occurred');
                    flush();
                }).toThrow();

                expect(component.isLoading).toBeFalsy();
            }));
        });
    });

    it('should track unsaved changes if form is dirty', () => {
        jest.spyOn(companyProductFacade, 'findByCompanyAndProductCode').mockReturnValue(of(companyProduct));
        jest.spyOn(commonCodeFacade, 'findByType').mockReturnValue(of(Described.fromCodes('gal', 'qt')));
        jest.spyOn(companyExportFacade, 'findByCompanyAndType').mockReturnValue(of(Described.fromCodes('c1', 'c2')));
        initialize(AccessMode.EDIT);
        expect(component.unsavedChanges).toBeFalsy();

        component.form.markAsDirty();

        expect(component.unsavedChanges).toBeTruthy();
    });
});
