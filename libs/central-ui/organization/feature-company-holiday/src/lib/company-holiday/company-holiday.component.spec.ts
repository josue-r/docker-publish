import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { HttpClient } from '@angular/common/http';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCheckboxHarness } from '@angular/material/checkbox/testing';
import { MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, ActivatedRouteSnapshot, convertToParamMap, Router } from '@angular/router';
import {
    CompanyHoliday,
    CompanyHolidayFacade,
    StoreHoliday,
} from '@vioc-angular/central-ui/organization/data-access-company-holiday';
import { ResourceFacade, ResourceFilterCriteria } from '@vioc-angular/central-ui/organization/data-access-resources';
import { RouterService } from '@vioc-angular/central-ui/util-router';
import { CommonFunctionalityModule, Described } from '@vioc-angular/shared/common-functionality';
import { MessageFacade } from '@vioc-angular/shared/data-access-message';
import { UiActionBarModule } from '@vioc-angular/shared/ui-action-bar';
import { UiAuditModule } from '@vioc-angular/shared/ui-audit';
import { UiButtonModule } from '@vioc-angular/shared/ui-button';
import { UiCurrencyPrefixModule } from '@vioc-angular/shared/ui-currency-prefix';
import { UiDialogMockModule } from '@vioc-angular/shared/ui-dialog';
import { UiFilteredInputMockModule } from '@vioc-angular/shared/ui-filtered-input';
import { MockLoadingOverlayComponent, UiLoadingMockModule } from '@vioc-angular/shared/ui-loading';
import { UiSelectAndGoMockModule } from '@vioc-angular/shared/ui-select-and-go';
import { GATEWAY_TOKEN } from '@vioc-angular/shared/util-api';
import { FormFactory, TypedFormGroup, UtilFormModule } from '@vioc-angular/shared/util-form';
import { expectInput } from '@vioc-angular/test/util-test';
import { of, ReplaySubject, Subject } from 'rxjs';
import moment = require('moment');

import { By } from '@angular/platform-browser';
import { RoleFacade } from '@vioc-angular/security/data-access-security';
import { CompanyHolidayForms } from '../company-holiday-module-forms';
import { CompanyHolidayComponent } from './company-holiday.component';

describe('CompanyHolidayComponent', () => {
    let component: CompanyHolidayComponent;
    let fixture: ComponentFixture<CompanyHolidayComponent>;
    let companyHolidayFacade: CompanyHolidayFacade;
    let resourceFacade: ResourceFacade;
    let loader: HarnessLoader;
    let routerService: RouterService;
    let componentDestroyed: ReplaySubject<any>;
    const routeParams = new Subject();
    // default test data
    const storeHoliday1: StoreHoliday = {
        id: 1,
        store: { id: 1, code: 'store1', description: 'store1', version: 0 },
        closed: true,
    };
    const storeHoliday2: StoreHoliday = {
        id: 2,
        store: { id: 2, code: 'store2', description: 'store2', version: 0 },
        closed: true,
    };
    const storeHoliday3: StoreHoliday = {
        id: 3,
        store: { id: 3, code: 'store3', description: 'store3', version: 0 },
        closed: true,
    };

    const testUnsortedStoreHolidays: StoreHoliday[] = [storeHoliday1, storeHoliday2, storeHoliday3];
    const company: Described = {
        id: 2,
        code: '001',
        description: 'description',
    };

    const testCompanyHoliday: CompanyHoliday = {
        id: 0,
        version: 0,
        company: company,
        name: 'valid_name',
        holidayDate: '2022-08-07',
        storeClosed: true,
        holiday: { id: 2, description: 'desc' },
        storeHolidays: testUnsortedStoreHolidays,
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CompanyHolidayComponent],
            imports: [
                ReactiveFormsModule,
                MatButtonModule,
                MatCheckboxModule,
                MatFormFieldModule,
                MatIconModule,
                MatInputModule,
                MatOptionModule,
                MatPaginatorModule,
                MatSelectModule,
                MatSortModule,
                MatTableModule,
                MatTooltipModule,
                MatDatepickerModule,
                MatMomentDateModule,
                NoopAnimationsModule,
                UiActionBarModule,
                UiAuditModule,
                UiCurrencyPrefixModule,
                UiLoadingMockModule,
                UtilFormModule,
                UiFilteredInputMockModule,
                UiDialogMockModule,
                UiSelectAndGoMockModule,
                UiButtonModule,
                CommonFunctionalityModule,
            ],
            providers: [
                FormFactory,
                {
                    provide: ActivatedRoute,
                    useValue: { params: routeParams, parent: '/organization/search' },
                },
                { provide: GATEWAY_TOKEN, useValue: '//gateway/' },
                { provide: HttpClient, useValue: { get: jest.fn(() => of()) } },
                { provide: MessageFacade, useValue: { addMessage: jest.fn() } },
                { provide: RoleFacade, useValue: { getMyRoles: jest.fn(() => of()) } },
                { provide: Router, useValue: { navigate: jest.fn() } },
                { provide: RouterService, useValue: { navigateToSearchPage: jest.fn(), back: jest.fn() } },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        CompanyHolidayForms.registerForms(TestBed.inject(FormFactory), TestBed.inject(FormBuilder));
        fixture = TestBed.createComponent(CompanyHolidayComponent);
        loader = TestbedHarnessEnvironment.loader(fixture);
        component = fixture.componentInstance;
        companyHolidayFacade = component.companyHolidayFacade;
        resourceFacade = component.resourceFacade;
        routerService = TestBed.inject(RouterService);
    });

    /** Initialize the the component with the given access mode, company code and holiday date */
    const initialize = (
        accessMode: 'view' | 'edit',
        model: CompanyHoliday = testCompanyHoliday,
        andFlush = true,
        queryParams = {}
    ) => {
        const route = TestBed.inject(ActivatedRoute);
        jest.spyOn(component['roleFacade'], 'getMyRoles').mockReturnValue(of(['ROLE_1']));
        route.snapshot = {
            paramMap: convertToParamMap({
                accessMode: accessMode,
                companyCode: model.company?.code,
                holidayDate: model.holidayDate,
            }),
            queryParamMap: convertToParamMap(queryParams),
        } as ActivatedRouteSnapshot;
        const companyHoliday = { ...new CompanyHoliday(), ...model };
        jest.spyOn(companyHolidayFacade, 'findByCompanyAndDate').mockReturnValue(of(companyHoliday));
        fixture.detectChanges();
        if (andFlush) {
            flush();
        }
    };

    const getCheckbox = (selector: string) => {
        return loader.getHarness(
            MatCheckboxHarness.with({
                selector,
            })
        );
    };

    const clickCheckbox = async (selector: string) => {
        const checkbox = await getCheckbox(selector);
        await checkbox.toggle();
    };

    const isChecked = (selector: string) => {
        return getCheckbox(selector).then((checkbox) => checkbox.isChecked());
    };

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit', () => {
        beforeEach(() => (componentDestroyed = new ReplaySubject(1)));
        afterEach(() => componentDestroyed.next());

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

        it('should initialize the from', fakeAsync(() => {
            jest.spyOn(component, 'initializeForm');
            jest.spyOn(component, 'initializeTable');
            jest.spyOn(component, 'refreshStoreDataOnControlChange');
            initialize('edit');
            expect(component.companyHolidayFacade.findByCompanyAndDate).toBeCalled();
            expect(component.initializeForm).toBeCalled();
            expect(component.initializeTable).toBeCalled();
            expect(component.refreshStoreDataOnControlChange).not.toBeCalled();
            expect(component.storeHolidayDataSource.data).toEqual(
                component.form.getArray('storeHolidays').controls as TypedFormGroup<StoreHoliday>[]
            );
            expect(component.displayedColumns).toContain('store.code');
            expect(component.displayedColumns).toContain('store.description');
            expect(component.displayedColumns).toContain('closed');
        }));

        it('should refresh the storeList on market change', fakeAsync(() => {
            const regionCode = '123';
            const marketCode = '231';
            const reasonFilter = ResourceFilterCriteria.byRegion(testCompanyHoliday.company.code, regionCode);
            const marketFilter = ResourceFilterCriteria.byMarket(
                testCompanyHoliday.company.code,
                regionCode,
                marketCode
            );
            const resSpy = jest
                .spyOn(resourceFacade, 'findStoresByRoles')
                .mockReturnValue(of({ resources: [{ id: 0 }], allCompanies: false }));
            initialize('edit');
            component.regionControl.patchValue({ code: regionCode, description: 'regionDescription' });
            component.marketControl.patchValue({ code: marketCode, description: 'marketDescription' });
            flush();
            tick(300);
            expect(resSpy).toBeCalledWith(['ROLE_1'], 'ACTIVE', false, [{ criteria: reasonFilter.criteria }]);
            expect(resSpy).toBeCalledWith(['ROLE_1'], 'ACTIVE', false, [{ criteria: marketFilter.criteria }]);
        }));

        it('should refresh the storeList on blank market change', fakeAsync(() => {
            const regionCode = '123';
            const regionFilter = ResourceFilterCriteria.byRegion(testCompanyHoliday.company.code, regionCode);
            const resSpy = jest
                .spyOn(resourceFacade, 'findStoresByRoles')
                .mockReturnValue(of({ resources: [{ id: 0 }], allCompanies: false }));
            initialize('edit');
            component.regionControl.patchValue({ code: regionCode, description: 'description123' });
            component.marketControl.patchValue(null);
            flush();
            tick(300);
            expect(resSpy).toHaveBeenCalledWith(['ROLE_1'], 'ACTIVE', false, [{ criteria: regionFilter.criteria }]);
            expect(fixture.debugElement.query(By.css('#store-holiday-table'))).toBeTruthy();
        }));

        it('should refresh the storeList on region change', fakeAsync(() => {
            const regionCode = '123';
            const elementsCount = component.storeHolidayDataSource.data?.values?.length;
            const regionFilter = ResourceFilterCriteria.byRegion(testCompanyHoliday.company.code, regionCode);
            const resSpy = jest
                .spyOn(resourceFacade, 'findStoresByRoles')
                .mockReturnValue(of({ resources: [{ id: 0 }], allCompanies: false }));
            initialize('edit');
            component.regionControl.patchValue({ code: regionCode, description: 'description123' });
            flush();
            tick(300);
            expect(resSpy).toHaveBeenCalledWith(['ROLE_1'], 'ACTIVE', false, [{ criteria: regionFilter.criteria }]);
            expect(component.marketControl.value).toBe(null);
            expect(component.storeHolidayDataSource.data.values.length).toBeLessThanOrEqual(elementsCount);
            expect(fixture.debugElement.query(By.css('#store-holiday-table'))).toBeTruthy();
        }));

        it('should display the store holiday table', fakeAsync(() => {
            initialize('edit');
            expect(fixture.debugElement.query(By.css('#store-holiday-table'))).toBeTruthy();
        }));

        it('should reset the market on region changes', fakeAsync(() => {
            initialize('edit');
            const resourceSpy = jest
                .spyOn(resourceFacade, 'findMarketsByRolesAndCompanyAndRegion')
                .mockReturnValue(of({ resources: [{ id: 0 }, { id: 1 }], allCompanies: false }));
            component.marketControl.patchValue({ code: '111', description: 'marketDescription' }, { emitEvent: false });
            component.regionControl.patchValue({ code: '222', description: 'regionDescription' });
            flush();
            tick(300);
            expect(resourceSpy).toBeCalledTimes(1);
            expect(component.marketControl.value).toBe(null);
        }));

        it('should have refresh the store data on undefined/blank region changes', fakeAsync(() => {
            initialize('edit');
            const elementsCount = component.storeHolidayDataSource.data?.values?.length;
            const resourceSpy = jest
                .spyOn(resourceFacade, 'findMarketsByRolesAndCompanyAndRegion')
                .mockReturnValue(of({ resources: [{ id: 0 }, { id: 1 }], allCompanies: false }));
            component.regionControl.patchValue(undefined);
            flush();
            tick(300);
            expect(component.marketControl.value).toBe(null);
            expect(resourceSpy).not.toHaveBeenCalled();
            expect(fixture.debugElement.query(By.css('#store-holiday-table'))).toBeTruthy();
            expect(component.storeHolidayDataSource.data.values.length).toBeGreaterThanOrEqual(elementsCount);
        }));

        it('should set the region', fakeAsync(async () => {
            const regionSpy = jest
                .spyOn(resourceFacade, 'findRegionsByRolesAndCompany')
                .mockReturnValue(of({ resources: [{ id: 0 }], allCompanies: false }));
            expect(component.regions$).toBe(undefined);
            initialize('edit');
            expect(await component.regions$.toPromise()).toEqual([{ id: 0 }]);
            expect(regionSpy).toBeCalled();
        }));

        it('should throw an error when an unhandled access mode is specified', () => {
            // Assuming add-like is unsupported
            TestBed.inject(ActivatedRoute).snapshot = {
                paramMap: convertToParamMap({ accessMode: 'add-like' }),
            } as ActivatedRouteSnapshot;
            expect(() => fixture.detectChanges()).toThrowError('Unhandled Access Mode: add-like');
        });

        describe('in edit mode', () => {
            it('should load a enabled form', fakeAsync(() => {
                initialize('edit', {
                    ...testCompanyHoliday,
                });
                expect(component.form.enabled).toBeTruthy();
            }));

            describe.each`
                field            | value
                ${'holidayDate'} | ${testCompanyHoliday.holidayDate}
            `('disabled fields', ({ field, value }) => {
                it(`should display a disabled input for ${field} as ${value}`, fakeAsync(() => {
                    initialize('edit', {
                        ...testCompanyHoliday,
                        company: { id: 1, code: '001', description: 'description1' },
                        holiday: { id: 2, code: '002', description: 'description2' },
                    });
                    expectInput(fixture, { id: `${field}-input` })
                        .toHaveValue(value)
                        .toBeEnabled(false);
                }));
            });
        });

        describe('row selection', () => {
            beforeEach(fakeAsync(() => {
                initialize('edit');
            }));

            it('should allow the user to select all records & set to yes', async () => {
                jest.spyOn(component, 'masterToggle');
                jest.spyOn(component, 'setSelectedToClosed');
                await clickCheckbox('#master-checkbox-holiday');
                expect(component.masterToggle).toHaveBeenCalled();
                component.form
                    .getArray('storeHolidays')
                    .controls.filter((c: TypedFormGroup<StoreHoliday>) => c.disabled)
                    .forEach(async (v: TypedFormGroup<StoreHoliday>, i) => {
                        expect(await isChecked(`#checkbox-${i}`)).toEqual(true);
                        expect(component.selection.isSelected(v)).toEqual(true);
                    });
                const setToYesBtn = fixture.debugElement.query(By.css('#close-action-yes')).nativeElement;
                setToYesBtn.click();
                expect(component.storeHolidayDataSource.data[0].getControlValue('closed')).toEqual(true);
                fixture.detectChanges();
                expect(component.setSelectedToClosed).toBeCalledTimes(1);
            });

            it('should allow the user to select all records & set to no', async () => {
                jest.spyOn(component, 'masterToggle');
                jest.spyOn(component, 'setSelectedToClosed');
                await clickCheckbox('#master-checkbox-holiday');
                const setToNoBtn = fixture.debugElement.query(By.css('#close-action-no')).nativeElement;
                setToNoBtn.click();
                expect(component.storeHolidayDataSource.data[0].getControlValue('closed')).toEqual(false);
                fixture.detectChanges();
                expect(component.setSelectedToClosed).toBeCalledTimes(1);
            });

            it('should allow the user to select individual rows', async () => {
                await clickCheckbox('#checkbox-0');
                expect(await isChecked('#checkbox-0')).toEqual(true);
                expect(component.selection.isSelected(component.storeHolidayDataSource.data[0])).toEqual(true);
                // nothing else should be selected
                expect(await isChecked('#checkbox-1')).toEqual(false);
                expect(component.selection.isSelected(component.storeHolidayDataSource.data[1])).toEqual(false);
            });
        });

        describe('when saving', () => {
            const getSaveBtn = async () => loader.getHarness(MatButtonHarness.with({ selector: '#save-action' }));

            const getApplyBtn = async () => loader.getHarness(MatButtonHarness.with({ selector: '#apply-action' }));

            describe('in edit mode', () => {
                beforeEach(fakeAsync(() => {
                    initialize('edit');
                    jest.spyOn(companyHolidayFacade, 'save').mockReturnValue(of({}));
                    jest.spyOn(component.messageFacade, 'addMessage');
                }));

                describe('save button', () => {
                    it('should call companyHolidayFacade only once when save is clicked multiple times', fakeAsync(async () => {
                        jest.spyOn(component.saveFacade, 'save');
                        // click on finalize button
                        (await getSaveBtn()).click();
                        fixture.detectChanges();
                        // multiple clicks testing
                        (await getSaveBtn()).click();
                        (await getSaveBtn()).click();
                        (await getSaveBtn()).click();
                        tick(600);
                        fixture.detectChanges();

                        expect(component.saveFacade.save).toHaveBeenCalledWith(
                            component.form,
                            testCompanyHoliday,
                            component['route']
                        );
                        // only one product should be saved even if save is clicked multiple times
                        expect(component.messageFacade.addMessage).toHaveBeenCalledTimes(1);
                    }));

                    it('should call the companyHolidayFacade to save and navigate back to the previous page', fakeAsync(async () => {
                        jest.spyOn(component.saveFacade, 'save');
                        (await getSaveBtn()).click();
                        tick(600); // tick to account for debounce time and time to re-enable button
                        flush();

                        expect(component.saveFacade.save).toHaveBeenCalledWith(
                            component.form,
                            testCompanyHoliday,
                            component['route']
                        );

                        expect(companyHolidayFacade.save).toHaveBeenCalledWith(testCompanyHoliday);
                        expect(component.messageFacade.addMessage).toHaveBeenCalledWith({
                            message: `Company Holiday ${
                                testCompanyHoliday.id ? testCompanyHoliday.name + ' ' : ''
                            }saved successfully`,
                            severity: 'info',
                        });
                        expect(routerService.navigateToSearchPage).toHaveBeenCalled();
                    }));
                });

                describe('apply button', () => {
                    it('should call companyHolidayFacade only once when apply is clicked multiple times', fakeAsync(async () => {
                        jest.spyOn(component.saveFacade, 'apply');
                        jest.spyOn(component, 'ngOnInit').mockImplementation(() => {});
                        const currentForm = component.form;
                        // click on finalize button
                        (await getApplyBtn()).click();
                        fixture.detectChanges();
                        // multiple clicks testing
                        (await getApplyBtn()).click();
                        (await getApplyBtn()).click();
                        (await getApplyBtn()).click();
                        tick(600);
                        fixture.detectChanges();

                        expect(component.saveFacade.apply).toHaveBeenCalledWith(
                            currentForm,
                            testCompanyHoliday,
                            expect.anything()
                        );
                        // only one product should be saved even if apply is clicked multiple times
                        expect(component.messageFacade.addMessage).toHaveBeenCalledTimes(1);
                    }));

                    it('should call the companyHolidayFacade to save and reload the component', fakeAsync(async () => {
                        jest.spyOn(component.saveFacade, 'apply');
                        jest.spyOn(component, 'ngOnInit').mockImplementation(() => {});
                        const currentForm = component.form;
                        (await getApplyBtn()).click();
                        flush();
                        tick(600); // tick to account for debounce time and time to re-enable button
                        expect(component.saveFacade.apply).toHaveBeenCalledWith(
                            currentForm,
                            testCompanyHoliday,
                            expect.anything()
                        );
                        expect(companyHolidayFacade.save).toHaveBeenCalledWith(testCompanyHoliday);
                        expect(component.messageFacade.addMessage).toHaveBeenCalledWith({
                            message: `Company Holiday ${
                                testCompanyHoliday.id ? testCompanyHoliday.name + ' ' : ''
                            }saved successfully`,
                            severity: 'info',
                        });
                        expect(component.ngOnInit).toHaveBeenCalled();
                        expect(component.form).toBeFalsy();
                    }));

                    it('should call refreshStoreDataOnControlChange for dataSource refresh on re-click apply button', fakeAsync(async () => {
                        jest.spyOn(component, 'initializeTable');
                        jest.spyOn(component, 'refreshStoreDataOnControlChange');

                        initialize('edit');
                        component.regionControl.patchValue({ code: 'code', description: 'description' });
                        flush();
                        tick(300);
                        (await getApplyBtn()).click();
                        flush();
                        tick(600); // tick to account for debounce time and time to re-enable button
                        expect(component.initializeTable).toHaveBeenCalled();
                        expect(component.refreshStoreDataOnControlChange).toHaveBeenCalled();
                        (await getApplyBtn()).click();
                        tick(600); // tick to account for debounce time and time to re-enable button
                        flush();
                        expect(component.initializeTable).toHaveBeenCalled();
                        expect(component.refreshStoreDataOnControlChange).toHaveBeenCalled();
                        expect(fixture.debugElement.query(By.css('#store-holiday-table'))).toBeTruthy();
                        expect(component.storeHolidayDataSource.data).toBeTruthy();
                    }));

                    it('should maintain region & market filter on page reload', fakeAsync(async () => {
                        initialize('edit');
                        const region = { code: 'code', id: 'id', description: 'description', version: 1 };
                        const market = { code: 'code99', id: 'id99', description: 'description99', version: 99 };
                        component.regionControl.patchValue(region);
                        flush();
                        tick(300);
                        component.marketControl.patchValue(market);
                        (await getApplyBtn()).click();
                        tick(600); // tick to account for debounce time and time to re-enable button
                        flush();
                        expect(component.regionControl.value).toEqual(region);
                        expect(component.marketControl.value).toEqual(market);
                    }));
                });
            });
        });
    });

    describe('in view mode', () => {
        it('should load a disabled form', fakeAsync(() => {
            initialize('view');
            expect(component.form.enabled).toBeFalsy();
        }));

        describe.each`
            field            | value
            ${'holidayDate'} | ${testCompanyHoliday.holidayDate}
        `('disabled fields', ({ field, value }) => {
            it(`should display a disabled input for ${field} as ${value}`, fakeAsync(() => {
                initialize('view', {
                    ...testCompanyHoliday,
                    company: { id: 1, code: '001', description: 'description1' },
                    holiday: { id: 2, code: '002', description: 'description2' },
                });
                expectInput(fixture, { id: `${field}-input` })
                    .toHaveValue(value)
                    .toBeEnabled(false);
            }));
        });

        it('should load a list of stores', fakeAsync(() => {
            initialize('view', {
                ...testCompanyHoliday,
            });

            expect(fixture.nativeElement.querySelector('#store-holiday-table').rows.length).toBeGreaterThanOrEqual(
                testCompanyHoliday.storeHolidays.length
            );
        }));

        it('should NOT render store list table', fakeAsync(() => {
            initialize('view', {
                ...testCompanyHoliday,
                storeHolidays: [],
            });

            expect(fixture.nativeElement.querySelector('#store-holiday-table')).toBeFalsy();
        }));

        it('should not display checkboxes for store selection', fakeAsync(() => {
            initialize('view', {
                ...testCompanyHoliday,
            });

            expect(fixture.debugElement.query(By.css('#store-holiday-table'))).toBeTruthy();
            // select checkbox container and assert that is empty
            expect(fixture.debugElement.query(By.css('.mat-column-select')).children.length).toBeLessThanOrEqual(0);
        }));
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
