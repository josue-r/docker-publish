import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DebugElement } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, waitForAsync, tick } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatMomentDateModule, MomentDateModule } from '@angular/material-moment-adapter';
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
import { StoreFacade, Store } from '@vioc-angular/central-ui/organization/data-access-store';
import { RouterService } from '@vioc-angular/central-ui/util-router';
import { CommonFunctionalityModule, Described } from '@vioc-angular/shared/common-functionality';
import { MessageFacade } from '@vioc-angular/shared/data-access-message';
import { UiActionBarModule } from '@vioc-angular/shared/ui-action-bar';
import { UiAddRemoveButtonModule } from '@vioc-angular/shared/ui-add-remove-button';
import { UiAuditModule } from '@vioc-angular/shared/ui-audit';
import { UiButtonModule } from '@vioc-angular/shared/ui-button';
import { UiDialogMockModule } from '@vioc-angular/shared/ui-dialog';
import { UiFilteredInputMockModule } from '@vioc-angular/shared/ui-filtered-input';
import { UiInfoButtonModule } from '@vioc-angular/shared/ui-info-button';
import { MockLoadingOverlayComponent, UiLoadingMockModule } from '@vioc-angular/shared/ui-loading';
import { UiSelectAndGoMockModule } from '@vioc-angular/shared/ui-select-and-go';
import { GATEWAY_TOKEN } from '@vioc-angular/shared/util-api';
import { UtilFormModule, FormFactory } from '@vioc-angular/shared/util-form';
import {
    expectInput,
    getApplyActionButton,
    getCancelActionButton,
    getSaveActionButton,
} from '@vioc-angular/test/util-test';
import { of, Subject } from 'rxjs';
import { StoreModuleForms } from '../store-module-forms';
import { StoreComponent } from './store.component';
import { formatDate } from '@angular/common';
import { RoleFacade } from '@vioc-angular/security/data-access-security';

describe('StoreComponent', () => {
    let component: StoreComponent;
    let fixture: ComponentFixture<StoreComponent>;
    let storeFacade: StoreFacade;
    let commonCodeFacade: CommonCodeFacade;
    let routerService: RouterService;
    let messageFacade: MessageFacade;
    let roleFacade: RoleFacade = new RoleFacade('//gateway', null, null);
    let router: Router;
    const routeParams = new Subject();
    const parentRoute: ActivatedRoute = new ActivatedRoute();

    const testCompany: Described = {
        id: 1,
        code: 'testCompany',
        description: 'Test Company',
        version: 0,
    };

    const testRegion: Described = {
        id: 2,
        code: 'testRegion',
        description: 'Test Region',
        version: 0,
    };

    const testMarket: Described = {
        id: 3,
        code: 'testMarket',
        description: 'Test Market',
        version: 0,
    };

    const testArea: Described = {
        id: 4,
        code: 'testArea',
        description: 'Test Area',
        version: 0,
    };

    const testState: Described = {
        id: 5,
        code: 'KY',
        description: 'Kentucky',
        version: 0,
    };

    const testStore: Store = {
        id: 123456,
        code: 'test',
        description: 'Test Store',
        active: true,
        company: testCompany,
        region: testRegion,
        market: testMarket,
        area: testArea,
        address: {
            city: 'Lexington',
            state: testState,
            zip: '40509',
            line1: '100 Valvoline Way',
            line2: 'Unit 1',
        },
        phone: '111-222-3333',
        fax: '444-555-6666',
        emergencyPhone: '777-888-9999',
        bayCount: 4,
        storeOpenDate: '2022-06-14',
        storeCloseDate: '3022-15-25',
        manager: {
            firstName: 'John',
            lastName: 'Doe',
            id: 'v123456',
        },
        oilChangePrice: 1,
        currentStore: {
            code: 'test',
            description: 'Test Store',
            id: 123456,
            version: 0,
        },
        marketingArea: testMarket,
        brand: {
            code: 'testBrand',
            description: 'Test Brand',
            id: 1,
            version: 0,
        },
        latitude: 80.45045,
        longitude: 120.12012,
        locationDirections: 'Directions to Valvoline',
        communitiesServed: 'Community A',
        version: 0,
        classification: {
            code: 'testClassification',
            description: 'Test Classification',
            id: '2',
            version: 0,
        },
        sameStoreReporting: true,
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [StoreComponent],
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
                MatMomentDateModule,
                MomentDateModule,
                UiActionBarModule,
                UiAddRemoveButtonModule,
                UiAuditModule,
                UiInfoButtonModule,
                UtilFormModule,
                UiLoadingMockModule,
                UiLoadingMockModule,
                UiDialogMockModule,
                UiButtonModule,
                UiFilteredInputMockModule,
                UiSelectAndGoMockModule,
                CommonFunctionalityModule,
            ],
            providers: [
                FormFactory,
                { provide: ActivatedRoute, useValue: { params: routeParams, parent: '/maintenance/store' } },
                { provide: Router, useValue: { navigate: jest.fn() } },
                { provide: RouterService, useValue: { navigateToSearchPage: jest.fn() } },
                { provide: MessageFacade, useValue: { addMessage: jest.fn() } },
                { provide: GATEWAY_TOKEN, useValue: '//gateway/' },
                { provide: HttpClient, useValue: {} },
                { provide: ActivatedRoute, useValue: { params: new Subject(), parent: parentRoute } },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        StoreModuleForms.registerForms(TestBed.inject(FormFactory), TestBed.inject(FormBuilder));
        fixture = TestBed.createComponent(StoreComponent);
        component = fixture.componentInstance;
        storeFacade = component.storeFacade;
        commonCodeFacade = component.commonCodeFacade;
        roleFacade = component.roleFacade;

        // Common mocking
        commonCodeFacade.findByType = jest.fn();
    });

    /** Initialize the the component with the given access mode and store. */
    const initialize = (
        accessMode: 'view' | 'edit',
        role = 'ROLE_STORE_UPDATE',
        model: Store = testStore,
        andflush = true
    ) => {
        const route = TestBed.inject(ActivatedRoute);
        route.snapshot = {
            paramMap: convertToParamMap({ accessMode: accessMode, storeCode: model.code }),
        } as ActivatedRouteSnapshot;
        const store = { ...new Store(), ...model };
        jest.spyOn(storeFacade, 'findByCode').mockReturnValue(of(store));
        jest.spyOn(roleFacade, 'getMyRoles').mockReturnValue(of([role]));
        fixture.detectChanges();
        if (andflush) {
            tick(100); // clear timers in queue
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

    describe('cancel button', () => {
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
        let dateFormat = 'mediumDate';
        let dateLocale = 'en-Us';
        describe('view mode', () => {
            it('should load store data, should not load dropdown data, and should disable the form', fakeAsync(() => {
                initialize('view');
                expect(storeFacade.findByCode).toHaveBeenCalledWith(testStore.code);
                expect(commonCodeFacade.findByType).not.toHaveBeenCalled();
                expect(component.form.enabled).toBeFalsy();
            }));

            describe.each`
                control                     | value                                               | enabled
                ${'code'}                   | ${'test'}                                           | ${false}
                ${'description'}            | ${'Test Store'}                                     | ${false}
                ${'active'}                 | ${true}                                             | ${false}
                ${{ id: 'storeOpenDate' }}  | ${formatDate('2022-06-14', dateFormat, dateLocale)} | ${false}
                ${{ id: 'company' }}        | ${'testCompany - Test Company'}                     | ${false}
                ${{ id: 'market' }}         | ${'testMarket - Test Market'}                       | ${false}
                ${{ id: 'region' }}         | ${'testRegion - Test Region'}                       | ${false}
                ${{ id: 'area' }}           | ${'testArea - Test Area'}                           | ${false}
                ${{ id: 'storeManager' }}   | ${'John Doe'}                                       | ${false}
                ${{ id: 'storeManagerId' }} | ${'v123456'}                                        | ${false}
                ${{ id: 'street' }}         | ${'100 Valvoline Way'}                              | ${false}
                ${{ id: 'apt' }}            | ${'Unit 1'}                                         | ${false}
                ${{ id: 'city' }}           | ${'Lexington'}                                      | ${false}
                ${{ id: 'state' }}          | ${'KY'}                                             | ${false}
                ${{ id: 'zip' }}            | ${'40509'}                                          | ${false}
                ${'phone'}                  | ${'111-222-3333'}                                   | ${false}
                ${'fax'}                    | ${'444-555-6666'}                                   | ${false}
                ${'emergencyPhone'}         | ${'777-888-9999'}                                   | ${false}
                ${'latitude'}               | ${'80.45045'}                                       | ${false}
                ${'longitude'}              | ${'120.12012'}                                      | ${false}
                ${'locationDirections'}     | ${'Directions to Valvoline'}                        | ${false}
                ${'classification'}         | ${'Test Classification'}                            | ${false}
                ${'sameStoreReporting'}     | ${true}                                             | ${false}
            `('values', ({ control, value, enabled }) => {
                it(`should display input for ${control} as ${value} and ${
                    enabled ? '' : 'not'
                } be enabled`, fakeAsync(() => {
                    initialize(
                        'view',
                        'ROLE_STORE_UPDATE',
                        {
                            ...testStore,
                            storeOpenDate: '2022-06-14',
                            address: {
                                // state is a described in the model but returned as a string from the api in the component
                                // this works in the code because we only want the code to display, so being a string doesn't matter
                                // however with testing it is trying to check the value of a described against a string, so by setting
                                // state as a string we can 'mock' what is happening in the application
                                state: 'KY' as any,
                                city: testStore.address.city,
                                line1: testStore.address.line1,
                                line2: testStore.address.line2,
                                zip: testStore.address.zip,
                            },
                        },
                        true
                    );
                    expectInput(fixture, control).toHaveValue(value).toBeEnabled(enabled);
                }));
            });
        });

        describe('edit mode', () => {
            it('should load store data and dropdown data', fakeAsync(() => {
                initialize('edit');

                expect(storeFacade.findByCode).toHaveBeenCalledWith(testStore.code);
                expect(commonCodeFacade.findByType).toHaveBeenCalledWith('STATE', true);
                expect(commonCodeFacade.findByType).toHaveBeenCalledWith('STORE CLASSIFICATION', true);
            }));

            describe.each`
                control                 | value                        | enabled  | role
                ${'code'}               | ${'test'}                    | ${false} | ${'ROLE_STORE_LATITUDE_LONGITUDE_UPDATE'}
                ${'description'}        | ${'Test Store'}              | ${false} | ${'ROLE_STORE_LATITUDE_LONGITUDE_UPDATE'}
                ${'active'}             | ${true}                      | ${false} | ${'ROLE_STORE_LATITUDE_LONGITUDE_UPDATE'}
                ${'classification'}     | ${'Test Classification'}     | ${false} | ${'ROLE_STORE_LATITUDE_LONGITUDE_UPDATE'}
                ${'phone'}              | ${'111-222-3333'}            | ${false} | ${'ROLE_STORE_LATITUDE_LONGITUDE_UPDATE'}
                ${'fax'}                | ${'444-555-6666'}            | ${false} | ${'ROLE_STORE_LATITUDE_LONGITUDE_UPDATE'}
                ${'emergencyPhone'}     | ${'777-888-9999'}            | ${false} | ${'ROLE_STORE_LATITUDE_LONGITUDE_UPDATE'}
                ${'locationDirections'} | ${'Directions to Valvoline'} | ${false} | ${'ROLE_STORE_LATITUDE_LONGITUDE_UPDATE'}
                ${'communitiesServed'}  | ${'Community A'}             | ${false} | ${'ROLE_STORE_LATITUDE_LONGITUDE_UPDATE'}
                ${'latitude'}           | ${'80.45045'}                | ${true}  | ${'ROLE_STORE_LATITUDE_LONGITUDE_UPDATE'}
                ${'longitude'}          | ${'120.12012'}               | ${true}  | ${'ROLE_STORE_LATITUDE_LONGITUDE_UPDATE'}
                ${'code'}               | ${'test'}                    | ${false} | ${'ROLE_STORE_LOCATION_CONTENT_UPDATE'}
                ${'description'}        | ${'Test Store'}              | ${false} | ${'ROLE_STORE_LOCATION_CONTENT_UPDATE'}
                ${'active'}             | ${true}                      | ${false} | ${'ROLE_STORE_LOCATION_CONTENT_UPDATE'}
                ${'classification'}     | ${'Test Classification'}     | ${false} | ${'ROLE_STORE_LOCATION_CONTENT_UPDATE'}
                ${'phone'}              | ${'111-222-3333'}            | ${false} | ${'ROLE_STORE_LOCATION_CONTENT_UPDATE'}
                ${'fax'}                | ${'444-555-6666'}            | ${false} | ${'ROLE_STORE_LOCATION_CONTENT_UPDATE'}
                ${'emergencyPhone'}     | ${'777-888-9999'}            | ${false} | ${'ROLE_STORE_LOCATION_CONTENT_UPDATE'}
                ${'locationDirections'} | ${'Directions to Valvoline'} | ${true}  | ${'ROLE_STORE_LOCATION_CONTENT_UPDATE'}
                ${'communitiesServed'}  | ${'Community A'}             | ${true}  | ${'ROLE_STORE_LOCATION_CONTENT_UPDATE'}
                ${'latitude'}           | ${'80.45045'}                | ${false} | ${'ROLE_STORE_LOCATION_CONTENT_UPDATE'}
                ${'longitude'}          | ${'120.12012'}               | ${false} | ${'ROLE_STORE_LOCATION_CONTENT_UPDATE'}
            `('values', ({ control, value, enabled, role }) => {
                it(`should display input for ${control} as ${value} and ${
                    enabled ? '' : 'not'
                } be enabled with role ${role}`, fakeAsync(() => {
                    jest.spyOn(commonCodeFacade, 'findByType').mockReturnValue(of([testStore.classification]));
                    jest.spyOn(component, 'disableFormFieldsExceptAuthorized');
                    initialize(
                        'edit',
                        role,
                        {
                            ...testStore,
                            storeOpenDate: '2022-06-14',
                        },
                        true
                    );
                    expect(component.disableFormFieldsExceptAuthorized).toHaveBeenLastCalledWith([role]);
                    expectInput(fixture, control).toHaveValue(value).toBeEnabled(enabled);
                }));
            });

            describe.each`
                control                     | value                                               | enabled
                ${'code'}                   | ${'test'}                                           | ${false}
                ${'description'}            | ${'Test Store'}                                     | ${false}
                ${'active'}                 | ${true}                                             | ${false}
                ${{ id: 'storeOpenDate' }}  | ${formatDate('2022-06-14', dateFormat, dateLocale)} | ${false}
                ${{ id: 'company' }}        | ${'testCompany - Test Company'}                     | ${false}
                ${{ id: 'market' }}         | ${'testMarket - Test Market'}                       | ${false}
                ${{ id: 'region' }}         | ${'testRegion - Test Region'}                       | ${false}
                ${{ id: 'area' }}           | ${'testArea - Test Area'}                           | ${false}
                ${{ id: 'storeManager' }}   | ${'John Doe'}                                       | ${false}
                ${{ id: 'storeManagerId' }} | ${'v123456'}                                        | ${false}
                ${{ id: 'street' }}         | ${'100 Valvoline Way'}                              | ${false}
                ${{ id: 'apt' }}            | ${'Unit 1'}                                         | ${false}
                ${{ id: 'city' }}           | ${'Lexington'}                                      | ${false}
                ${{ id: 'state' }}          | ${'KY'}                                             | ${false}
                ${{ id: 'zip' }}            | ${'40509'}                                          | ${false}
                ${'phone'}                  | ${'111-222-3333'}                                   | ${false}
                ${'fax'}                    | ${'444-555-6666'}                                   | ${false}
                ${'emergencyPhone'}         | ${'777-888-9999'}                                   | ${false}
                ${'latitude'}               | ${'80.45045'}                                       | ${true}
                ${'longitude'}              | ${'120.12012'}                                      | ${true}
                ${'locationDirections'}     | ${'Directions to Valvoline'}                        | ${true}
                ${'classification'}         | ${'Test Classification'}                            | ${true}
                ${'sameStoreReporting'}     | ${true}                                             | ${true}
            `('values', ({ control, value, enabled }) => {
                it(`should display input for ${control} as ${value} and ${
                    enabled ? '' : 'not'
                } be enabled`, fakeAsync(() => {
                    jest.spyOn(commonCodeFacade, 'findByType').mockReturnValue(of([testStore.classification]));
                    initialize(
                        'edit',
                        'ROLE_STORE_UPDATE',
                        {
                            ...testStore,
                            storeOpenDate: '2022-06-14',
                            address: {
                                // state is a described in the model but returned as a string from the api in the component
                                // this works in the code because we only want the code to display, so being a string doesn't matter
                                // however with testing it is trying to check the value of a described against a string, so by setting
                                // state as a string we can 'mock' what is happening in the application
                                state: 'KY' as any,
                                city: testStore.address.city,
                                line1: testStore.address.line1,
                                line2: testStore.address.line2,
                                zip: testStore.address.zip,
                            },
                        },
                        true
                    );
                    expectInput(fixture, control).toHaveValue(value).toBeEnabled(enabled);
                }));
            });
        });
    });

    describe('Action Bar', () => {
        describe.each`
            accessMode | saveDisplayed | applyDisplayed | cancelDisplayed
            ${'view'}  | ${false}      | ${false}       | ${true}
            ${'edit'}  | ${true}       | ${true}        | ${true}
            ${'view'}  | ${false}      | ${false}       | ${true}
            ${'edit'}  | ${true}       | ${true}        | ${true}
        `('in $accessMode mode', ({ accessMode, saveDisplayed, applyDisplayed, cancelDisplayed }) => {
            const verifyDisplayedState = (element: DebugElement, shouldBeDisplayed: boolean) => {
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
            formState    | saveEnabled | applyEnabled | cancelEnabled
            ${'valid'}   | ${true}     | ${true}      | ${true}
            ${'invalid'} | ${false}    | ${false}     | ${true}
            ${'valid'}   | ${true}     | ${true}      | ${true}
            ${'invalid'} | ${false}    | ${false}     | ${true}
        `(`with $formState form`, ({ formState, saveEnabled, applyEnabled, cancelEnabled }) => {
            beforeEach(waitForAsync(() => {
                initialize('edit', 'ROLE_STORE_UPDATE', testStore, false);
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
            const verifySaveAndMessage = (code = testStore.code) => {
                expect(storeFacade.save).toHaveBeenCalled();
                expect(messageFacade.addMessage).toHaveBeenCalledWith({
                    message: `Store ${code} saved successfully`,
                    severity: 'info',
                });
            };

            beforeEach(() => {
                storeFacade.save = jest.fn(() => of(null));
                messageFacade = TestBed.inject(MessageFacade);
                routerService = TestBed.inject(RouterService);
                router = TestBed.inject(Router);
            });

            describe('save button', () => {
                it('should save, add an info message, and navigate to previous page', fakeAsync(() => {
                    initialize('edit');
                    getSaveActionButton(fixture).nativeElement.click();
                    tick(600);
                    verifySaveAndMessage();
                    expect(routerService.navigateToSearchPage).toHaveBeenCalled();
                }));

                it('should only call save once, even with double clicks', fakeAsync(async () => {
                    initialize('edit');
                    getSaveActionButton(fixture).nativeElement.click();
                    getSaveActionButton(fixture).nativeElement.click();
                    tick(600);
                    verifySaveAndMessage();
                    expect(routerService.navigateToSearchPage).toHaveBeenCalledTimes(1);
                }));

                it('should show loading overlay when processing', fakeAsync(() => {
                    const saveSubject = new Subject();
                    storeFacade.save = jest.fn(() => saveSubject);
                    initialize('edit');
                    getSaveActionButton(fixture).nativeElement.click();
                    tick(600);
                    expect(component.isLoading).toBeTruthy();

                    saveSubject.next(null);
                    flush();

                    expect(component.isLoading).toBeFalsy();
                }));

                it('should cancel loading overlay if an error occurs', fakeAsync(() => {
                    const saveSubject = new Subject();
                    storeFacade.save = jest.fn(() => saveSubject);
                    initialize('edit');
                    getSaveActionButton(fixture).nativeElement.click();
                    tick(600);
                    expect(component.isLoading).toBeTruthy();

                    expect(() => {
                        saveSubject.error('An error occurred');
                        flush();
                    }).toThrow();

                    expect(component.isLoading).toBeFalsy();
                }));
            });

            describe('apply button', () => {
                it('should reload model in edit mode', fakeAsync(() => {
                    initialize('edit');
                    jest.spyOn(component, 'ngOnInit');
                    getApplyActionButton(fixture).nativeElement.click();
                    tick(600);
                    verifySaveAndMessage();
                    expect(component.ngOnInit).toHaveBeenCalled();
                }));

                it('should only call apply once, even with double clicks', fakeAsync(async () => {
                    initialize('edit');
                    jest.spyOn(component, 'ngOnInit');
                    getApplyActionButton(fixture).nativeElement.click();
                    getApplyActionButton(fixture).nativeElement.click();
                    tick(600);
                    verifySaveAndMessage();
                    expect(component.ngOnInit).toHaveBeenCalledTimes(1);
                }));

                it('should show loading overlay when processing', fakeAsync(() => {
                    const applySubject = new Subject();
                    storeFacade.save = jest.fn(() => applySubject);
                    initialize('edit');
                    getApplyActionButton(fixture).nativeElement.click();
                    tick(600);
                    expect(component.isLoading).toBeTruthy();

                    applySubject.next(null);
                    flush();

                    expect(component.isLoading).toBeFalsy();
                }));

                it('should cancel loading overlay if an error occurs', fakeAsync(() => {
                    const applySubject = new Subject();
                    storeFacade.save = jest.fn(() => applySubject);
                    initialize('edit');
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
    });

    describe('unsavedChanges', () => {
        it('should track if the form has been modified', fakeAsync(() => {
            initialize('edit');
            expect(component.unsavedChanges).toBeFalsy();
            component.form.markAsDirty();
            expect(component.unsavedChanges).toBeTruthy();
        }));
    });

    it('should throw an error with an unsupported access mode', fakeAsync(() => {
        const route = TestBed.inject(ActivatedRoute);
        route.snapshot = {
            paramMap: convertToParamMap({
                accessMode: 'add-like',
            }),
        } as ActivatedRouteSnapshot;
        expect(() => fixture.detectChanges()).toThrowError('Unhandled Access Mode: add-like');
    }));
});
