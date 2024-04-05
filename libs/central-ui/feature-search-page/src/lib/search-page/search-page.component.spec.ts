import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationFacade, RoleFacade } from '@vioc-angular/security/data-access-security';
import { QuerySort } from '@vioc-angular/shared/common-api-models';
import { FeatureConfiguration, FEATURE_CONFIGURATION_TOKEN } from '@vioc-angular/shared/common-feature-flag';
import { FeatureFlagFacade } from '@vioc-angular/shared/data-access-feature-flag';
import { MessageFacade } from '@vioc-angular/shared/data-access-message';
import { FeatureFeatureFlagModule } from '@vioc-angular/shared/feature-feature-flag';
import { MockSearchComponent, MockSearchFilterComponent } from '@vioc-angular/shared/feature-search';
import { booleanColumn, integerColumn, stringColumn } from '@vioc-angular/shared/util-column';
import { EMPTY, of, Subject, throwError } from 'rxjs';
import { SearchPageComponent } from './search-page.component';
import { By } from '@angular/platform-browser';
import { CommonFunctionalityModule } from '@vioc-angular/shared/common-functionality';

describe('SearchPageComponent', () => {
    let component: SearchPageComponent;
    let fixture: ComponentFixture<SearchPageComponent>;
    let router: Router;
    let messageFacade: MessageFacade;
    let roleFacade: RoleFacade;
    const columns = { integer: integerColumn, string: stringColumn, boolean: booleanColumn };
    const entityType = 'TestEntity';
    const mockSearchPageFacade = {
        search: jest.fn(),
        entityPatch: jest.fn(),
        dataSync: jest.fn(),
    };
    const routeParams = new Subject();
    const customViewRole = 'ROLE_TEST_ENTITY_CUSTOM_READ';
    const customEditRole = 'ROLE_TEST_ENTITY_CUSTOM_UPDATE';
    const customAddRole = 'ROLE_TEST_ENTITY_CUSTOM_ADD';

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                MatButtonModule,
                MatIconModule,
                MatMenuModule,
                MatTooltipModule,
                FeatureFeatureFlagModule,
                CommonFunctionalityModule,
            ],
            declarations: [SearchPageComponent, MockSearchComponent, MockSearchFilterComponent],
            providers: [
                { provide: Router, useValue: { url: '/app/domain/search', navigate: jest.fn() } },
                { provide: MessageFacade, useValue: { addMessage: jest.fn() } },
                { provide: RoleFacade, useValue: { hasAnyRole: jest.fn(() => of()) } },
                { provide: FeatureFlagFacade, useValue: { isEnabled: jest.fn(() => of()) } },
                {
                    provide: FEATURE_CONFIGURATION_TOKEN,
                    useValue: of({ default: true, features: {} } as FeatureConfiguration),
                },
                { provide: AuthenticationFacade, useValue: { getUser: () => EMPTY } as any as AuthenticationFacade },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        params: routeParams,
                        parent: '/app/domain/search',
                        snapshot: {
                            data: {
                                customViewRoles: [customViewRole],
                                customEditRoles: [customEditRole],
                                customAddRoles: [customAddRole],
                            },
                        },
                    },
                },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        jest.clearAllMocks();
        fixture = TestBed.createComponent(SearchPageComponent);
        component = fixture.componentInstance;
        router = TestBed.inject(Router);
        messageFacade = TestBed.inject(MessageFacade);
        roleFacade = TestBed.inject(RoleFacade);
        component.columns = columns;
        component.entityType = entityType;
        component.routePathVariables = jest.fn();
        component.searchPageFacade = mockSearchPageFacade;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit', () => {
        describe.each`
            input
            ${'columns'}
            ${'entityType'}
            ${'routePathVariables'}
            ${'searchPageFacade'}
        `('input checks', ({ input }) => {
            it(`should verify ${input} is set`, () => {
                component[input] = null;
                expect(() => component.ngOnInit()).toThrowError(`The "${input}" input must be set`);
            });
        });

        describe('defaulting', () => {
            describe.each`
                field                  | initialValue | expectedValue
                ${'routePrefix'}       | ${undefined} | ${'/app/domain'}
                ${'routePrefix'}       | ${'/test'}   | ${'/test'}
                ${'securityDomain'}    | ${undefined} | ${'TEST_ENTITY'}
                ${'securityDomain'}    | ${'FOO_BAR'} | ${'FOO_BAR'}
                ${'featureFlagPrefix'} | ${undefined} | ${'testEntity.search'}
            `('overridable fields', ({ field, initialValue, expectedValue }) => {
                it(`should have ${field} set to ${expectedValue} if given a value of ${initialValue}`, () => {
                    component[field] = initialValue;
                    component.ngOnInit();
                    expect(component[field]).toEqual(expectedValue);
                });
            });

            it('should setup search function to delegate to the searchPageFacade with the defaultSorts', () => {
                const testDefaultSorts = [new QuerySort(stringColumn), new QuerySort(integerColumn, 'desc')];
                component.defaultSorts = testDefaultSorts;
                component.searchFn({ queryRestrictions: null, page: null, sort: null });
                expect(mockSearchPageFacade.search).toHaveBeenCalledWith({
                    queryRestrictions: null,
                    page: null,
                    sort: null,
                    defaultSorts: testDefaultSorts,
                });
            });
            it('should setup save function to delegate to the searchPageFacade', () => {
                component.saveFn(null);
                expect(mockSearchPageFacade.entityPatch).toHaveBeenCalled();
            });
        });

        describe('subscriptions', () => {
            const verifySubscribe_roles = (
                spy: jest.SpyInstance,
                field: string,
                value: boolean,
                arg: any,
                callNumber: number
            ) => {
                spy.mockImplementation().mockReturnValue(of(value));
                component.ngOnInit();
                flush();
                expect(spy).nthCalledWith(callNumber, arg);
                expect(component[field]).toEqual(value);
            };

            const verifySubscribe = (spy: jest.SpyInstance, field: string, value: boolean, arg: any) => {
                spy.mockImplementation().mockReturnValue(of(value));
                component.ngOnInit();
                flush();
                expect(spy).toBeCalledWith(arg);
                expect(component[field]).toEqual(value);
            };

            // callNumber coordinates with the order in which access is checked on the search-page.component
            // Edit is checked first (1), then view (2), then add (3)
            describe.each`
                role                         | hasRole  | field              | callNumber | customRole
                ${'ROLE_TEST_ENTITY_READ'}   | ${true}  | ${'hasViewAccess'} | ${2}       | ${customViewRole}
                ${'ROLE_TEST_ENTITY_READ'}   | ${false} | ${'hasViewAccess'} | ${2}       | ${customViewRole}
                ${'ROLE_TEST_ENTITY_UPDATE'} | ${true}  | ${'hasEditAccess'} | ${1}       | ${customEditRole}
                ${'ROLE_TEST_ENTITY_UPDATE'} | ${false} | ${'hasEditAccess'} | ${1}       | ${customEditRole}
                ${'ROLE_TEST_ENTITY_ADD'}    | ${true}  | ${'hasAddAccess'}  | ${3}       | ${customAddRole}
                ${'ROLE_TEST_ENTITY_ADD'}    | ${false} | ${'hasAddAccess'}  | ${3}       | ${customAddRole}
            `('security', ({ role, hasRole, field, callNumber, customRole }) => {
                it(`should check for role ${role} and set ${field} to ${hasRole}`, fakeAsync(() => {
                    // Considering a custom update role on the verifications for edit access
                    verifySubscribe_roles(
                        jest.spyOn(roleFacade, 'hasAnyRole'),
                        field,
                        hasRole,
                        [role].concat(customRole),
                        callNumber
                    );
                }));
            });

            describe.each`
                feature                             | enabled  | field
                ${'testEntity.search.clickRow'}     | ${true}  | ${'_clickRowFeatureFlagEnabled'}
                ${'testEntity.search.clickRow'}     | ${false} | ${'_clickRowFeatureFlagEnabled'}
                ${'testEntity.search.clickRowEdit'} | ${true}  | ${'_clickRowEditFeatureFlagEnabled'}
                ${'testEntity.search.clickRowEdit'} | ${false} | ${'_clickRowEditFeatureFlagEnabled'}
                ${'testEntity.search.grid'}         | ${true}  | ${'_gridModeFeatureFlagEnabled'}
                ${'testEntity.search.grid'}         | ${false} | ${'_gridModeFeatureFlagEnabled'}
            `('features', ({ feature, enabled, field }) => {
                it(`should check for feature ${feature} and set ${field} to ${enabled}`, fakeAsync(() => {
                    verifySubscribe(jest.spyOn(component['featureFlagFacade'], 'isEnabled'), field, enabled, feature);
                }));
            });
        });
    });

    describe('triggerPreviousSearch', () => {
        it('should delegate to the searchComponent', () => {
            jest.spyOn(component.searchComponent, 'triggerPreviousSearch');
            component.triggerPreviousSearch();
            expect(component.searchComponent.triggerPreviousSearch).toHaveBeenCalled();
        });
    });

    describe.each`
        clickFeatFlag | hasEditAccess | editFeatFlag | hasViewAccess | routedAccessMode | reason
        ${false}      | ${true}       | ${true}      | ${false}      | ${null}          | ${'clicks disabled'}
        ${true}       | ${true}       | ${true}      | ${null}       | ${'edit'}        | ${'edit feature enabled and edit role present'}
        ${true}       | ${false}      | ${true}      | ${true}       | ${'view'}        | ${'edit role not present'}
        ${true}       | ${true}       | ${false}     | ${true}       | ${'view'}        | ${'edit feature disabled'}
        ${true}       | ${false}      | ${false}     | ${true}       | ${'view'}        | ${'navigates to view'}
        ${true}       | ${false}      | ${false}     | ${false}      | ${null}          | ${'Does not navigate since no view access'}
    `('open', ({ clickFeatFlag, hasEditAccess, editFeatFlag, hasViewAccess, routedAccessMode, reason }) => {
        const shouldNavigate = routedAccessMode !== null;
        const navigateDescription = shouldNavigate ? `navigate to ${routedAccessMode}` : 'not navigate';

        it(`should ${navigateDescription} since ${reason}`, () => {
            const testRouteVar = 'Test';
            component.routePathVariables = () => [testRouteVar];
            component.hasEditAccess = hasEditAccess;
            component.hasViewAccess = hasViewAccess;
            component['_clickRowFeatureFlagEnabled'] = clickFeatFlag;
            component['_clickRowEditFeatureFlagEnabled'] = editFeatFlag;
            jest.spyOn(router, 'navigate');

            component.open({});

            if (shouldNavigate) {
                expect(router.navigate).toHaveBeenCalledWith([component.routePrefix, routedAccessMode, testRouteVar]);
            } else {
                expect(router.navigate).not.toHaveBeenCalled();
            }
        });
    });

    describe('dataSync', () => {
        it('should send the ids of the selected rows to get datasynced', fakeAsync(() => {
            const selections = [
                { id: 1, desc: 'test1' },
                { id: 2, desc: 'test2' },
            ];
            component.searchComponent.selection.select(...selections);
            mockSearchPageFacade.dataSync.mockImplementation((args) => {
                expect(args).toEqual([1, 2]); // verify the ids
                expect(component.isLoading).toBeTruthy(); // loading overlay should be shown
                return of(selections.length);
            });
            component.dataSync();
            flush();
            expect(messageFacade.addMessage).toHaveBeenCalled(); // user message displayed
            expect(component.searchComponent.selection.isEmpty()).toBeTruthy(); // selections cleared
            expect(component.isLoading).toBeFalsy(); // loading overlay hidden
        }));
        it('should remove the loading overlay and pass on the error', fakeAsync(() => {
            const testError = 'test';
            mockSearchPageFacade.dataSync.mockImplementation(() => {
                expect(component.isLoading).toBeTruthy(); // loading overlay should be shown
                return throwError(testError);
            });
            expect(() => {
                component.dataSync();
                flush();
            }).toThrowError(testError);
            // loading overlay should be hidden after an error has been thrown
            expect(component.isLoading).toBeFalsy();
        }));

        it('should only call dataSync once, even with double clicks', fakeAsync(() => {
            component.dataSyncable = true;
            component.hasEditAccess = true;
            component.dataSyncFeatureFlagEnabled = true;
            fixture.detectChanges();

            const dataSyncButton = fixture.debugElement.query(By.css('#selection-datasync')).nativeElement;
            jest.spyOn(component.searchPageFacade, 'dataSync').mockReturnValue(of(1));
            jest.spyOn(messageFacade, 'addMessage').mockImplementation();

            dataSyncButton.click();
            dataSyncButton.click();
            dataSyncButton.click();
            tick(600);
            fixture.detectChanges();

            expect(component.searchPageFacade.dataSync).toBeCalledTimes(1);
            expect(messageFacade.addMessage).toHaveBeenCalledTimes(1);
        }));
    });

    describe.each`
        editAccess | gridModeEnabled | featureEnabled | expectedResult
        ${true}    | ${true}         | ${true}        | ${true}
        ${true}    | ${true}         | ${false}       | ${false}
        ${true}    | ${false}        | ${true}        | ${false}
        ${true}    | ${false}        | ${false}       | ${false}
        ${false}   | ${true}         | ${true}        | ${false}
        ${false}   | ${true}         | ${false}       | ${false}
        ${false}   | ${false}        | ${true}        | ${false}
        ${false}   | ${false}        | ${false}       | ${false}
    `('gridAccessible', ({ editAccess, gridModeEnabled, featureEnabled, expectedResult }) => {
        it(`should be ${expectedResult} if hasEditAcces=${editAccess}, gridModeEnabled=${gridModeEnabled} and _gridModeFeatureFlagEnabled=${featureEnabled}`, () => {
            component.hasEditAccess = editAccess;
            component.gridModeEnabled = gridModeEnabled;
            component['_gridModeFeatureFlagEnabled'] = featureEnabled;
            expect(component.gridAccessible).toEqual(expectedResult);
        });
    });
});
