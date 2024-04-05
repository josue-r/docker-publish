import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { HttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonHarness } from '@angular/material/button/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
// tslint:disable-next-line: nx-enforce-module-boundaries
import { FeatureSearchPageMockModule, MockSearchPageComponent } from '@vioc-angular/central-ui/feature-search-page';
import { TechnicalAlert } from '@vioc-angular/central-ui/technical/data-access-technical-alert';
import { AuthenticationFacade } from '@vioc-angular/security/data-access-security';
import { FeatureConfiguration, FEATURE_CONFIGURATION_TOKEN } from '@vioc-angular/shared/common-feature-flag';
import { MessageFacade } from '@vioc-angular/shared/data-access-message';
import { FeatureFeatureFlagModule } from '@vioc-angular/shared/feature-feature-flag';
import { UiLoadingModule } from '@vioc-angular/shared/ui-loading';
import { GATEWAY_TOKEN } from '@vioc-angular/shared/util-api';
import { MockRouterLinkDirective } from '@vioc-angular/test/util-test';
import { EMPTY, of } from 'rxjs';
import { TechnicalAlertSearchComponent } from './technical-alert-search.component';
import { CommonFunctionalityModule } from '@vioc-angular/shared/common-functionality';

describe('TechnicalAlertSearchComponent', () => {
    let component: TechnicalAlertSearchComponent;
    let fixture: ComponentFixture<TechnicalAlertSearchComponent>;
    let messageFacade: MessageFacade;
    let loader: HarnessLoader;

    const technicalAlert = {
        id: 1,
    } as TechnicalAlert;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                UiLoadingModule,
                MatButtonModule,
                FeatureSearchPageMockModule,
                FeatureFeatureFlagModule,
                CommonFunctionalityModule,
            ],
            declarations: [TechnicalAlertSearchComponent, MockRouterLinkDirective],
            providers: [
                { provide: GATEWAY_TOKEN, useValue: '//gateway/' },
                { provide: HttpClient, useValue: {} },
                { provide: Router, useValue: { navigate: jest.fn() } },
                { provide: AuthenticationFacade, useValue: { getUser: () => EMPTY } as any as AuthenticationFacade },
                {
                    provide: FEATURE_CONFIGURATION_TOKEN,
                    useValue: of({
                        default: true,
                        features: {
                            technicalAlert: {
                                search: {
                                    add: true,
                                    activateDeactivate: true,
                                },
                            },
                        },
                    } as FeatureConfiguration),
                },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TechnicalAlertSearchComponent);
        loader = TestbedHarnessEnvironment.loader(fixture);
        component = fixture.componentInstance;
        messageFacade = TestBed.inject(MessageFacade);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('searchPage', () => {
        let searchPage: MockSearchPageComponent;
        beforeEach(() => {
            searchPage = fixture.debugElement.query(By.directive(MockSearchPageComponent)).componentInstance;
            fixture.detectChanges();
        });

        it('should pass the entityType', () => {
            expect(searchPage.entityType).toEqual('TechnicalAlert');
        });

        it('should pass the searchPagefacade', () => {
            expect(searchPage.searchPageFacade).toEqual(component.technicalAlertFacade);
        });

        it('should pass the columns', () => {
            expect(searchPage.columns).toEqual(component.columns);
        });

        it('should accept the routePathVariables function', () => {
            expect(searchPage.routePathVariables).toEqual(component.toStringId);
        });

        it('should pass the defaultSorts', () => {
            expect(searchPage.defaultSorts).toEqual(component.defaultSorts);
        });
    });

    describe('when activating', () => {
        const getActivateButton = async () =>
            loader.getHarness(
                MatButtonHarness.with({
                    selector: '#activate-button',
                })
            );
        const clickActivateButton = async () => (await getActivateButton()).click();

        beforeEach(() => {
            component.searchPage.searchComponent.selection.select(technicalAlert);
            jest.spyOn(component.technicalAlertFacade, 'activate').mockReturnValue(of(1));
            component.searchPage.hasEditAccess = true;
            fixture.detectChanges();
        });

        it('should send the activation request and get the number of updated records', async () => {
            jest.spyOn(messageFacade, 'addMessage');
            await clickActivateButton();
            expect(component.technicalAlertFacade.activate).toHaveBeenLastCalledWith([technicalAlert.id]);
            expect(messageFacade.addMessage).toHaveBeenCalledWith({
                message: '1 record(s) activated',
                severity: 'success',
            });
        });

        it('should only call activate once, even with double clicks', fakeAsync(async () => {
            jest.spyOn(messageFacade, 'addMessage');

            await clickActivateButton();
            await clickActivateButton();
            tick(600);

            fixture.detectChanges();
            expect(component.technicalAlertFacade.activate).toHaveBeenCalledTimes(1);
        }));

        it('should redo previous search', async () => {
            jest.spyOn(component.searchPage, 'triggerPreviousSearch');

            await clickActivateButton();

            expect(component.searchPage.triggerPreviousSearch).toHaveBeenCalled();
        });

        it('should not show activate button if user does not have edit access', async () => {
            expect(await getActivateButton()).toBeTruthy();
            component.searchPage.hasEditAccess = false;
            return expect(async () => await getActivateButton()).rejects.toThrow();
        });
    });

    describe('when deactivating', () => {
        const getDeactivateButton = async () =>
            loader.getHarness(
                MatButtonHarness.with({
                    selector: '#deactivate-button',
                })
            );
        const clickDeactivateButton = async () => (await getDeactivateButton()).click();

        beforeEach(() => {
            component.searchPage.searchComponent.selection.select(technicalAlert);
            jest.spyOn(component.technicalAlertFacade, 'deactivate').mockReturnValue(of(1));
            component.searchPage.hasEditAccess = true;
            fixture.detectChanges();
        });

        it('should send the deactivation request and get the number of updated records', fakeAsync(async () => {
            jest.spyOn(messageFacade, 'addMessage');
            await clickDeactivateButton();
            tick(600);

            expect(component.technicalAlertFacade.deactivate).toHaveBeenCalledWith([technicalAlert.id]);
            expect(messageFacade.addMessage).toHaveBeenCalledWith({
                message: '1 record(s) deactivated',
                severity: 'success',
            });
        }));

        it('should only call deactivate once, even with double clicks', fakeAsync(async () => {
            jest.spyOn(messageFacade, 'addMessage');

            await clickDeactivateButton();
            await clickDeactivateButton();
            tick(600);

            fixture.detectChanges();
            expect(component.technicalAlertFacade.deactivate).toHaveBeenCalledTimes(1);
        }));

        it('should redo previous search', fakeAsync(async () => {
            jest.spyOn(component.searchPage, 'triggerPreviousSearch');
            await clickDeactivateButton();
            tick(600);

            expect(component.searchPage.triggerPreviousSearch).toHaveBeenCalled();
        }));

        it('should not show deactivate button if user does not have edit access', async () => {
            expect(await getDeactivateButton()).toBeTruthy();
            component.searchPage.hasEditAccess = false;
            return expect(async () => await getDeactivateButton()).rejects.toThrow();
        });
    });

    describe('add button', () => {
        it('should navigate to add page', () => {
            fixture.detectChanges();
            component.searchPage.hasAddAccess = true;
            fixture.detectChanges();
            const routerLink = fixture.debugElement
                .query(By.css('#add-button'))
                .injector.get<MockRouterLinkDirective>(MockRouterLinkDirective).routerLink;
            expect(routerLink).toEqual(['../add']);
        });

        it('should hide if no add access', () => {
            fixture.detectChanges();
            component.searchPage.hasAddAccess = false;
            fixture.detectChanges();
            const addButton = fixture.debugElement.query(By.css('#add-button'));
            expect(addButton).toBeFalsy();
        });
    });
});
