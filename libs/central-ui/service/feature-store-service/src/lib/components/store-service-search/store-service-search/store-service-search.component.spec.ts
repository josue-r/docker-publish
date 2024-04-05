import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
// TODO: 04/29/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
// tslint:disable-next-line: nx-enforce-module-boundaries
import { FeatureSearchPageMockModule, MockSearchPageComponent } from '@vioc-angular/central-ui/feature-search-page';
import { StoreService } from '@vioc-angular/central-ui/service/data-access-store-service';
import { AuthenticationFacade } from '@vioc-angular/security/data-access-security';
import { FeatureConfiguration, FEATURE_CONFIGURATION_TOKEN } from '@vioc-angular/shared/common-feature-flag';
import { MessageFacade } from '@vioc-angular/shared/data-access-message';
// TODO: 04/29/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
// tslint:disable-next-line: nx-enforce-module-boundaries
import { FeatureDropdownColumnMockModule } from '@vioc-angular/shared/feature-dropdown-column';
import { FeatureFeatureFlagModule } from '@vioc-angular/shared/feature-feature-flag';
import { UiLoadingModule } from '@vioc-angular/shared/ui-loading';
import { GATEWAY_TOKEN } from '@vioc-angular/shared/util-api';
import { MockRouterLinkDirective } from '@vioc-angular/test/util-test';
import { EMPTY, of } from 'rxjs';
import { StoreServiceSearchComponent } from './store-service-search.component';
import { CommonFunctionalityModule } from '@vioc-angular/shared/common-functionality';

describe('StoreServiceSearchComponent', () => {
    let component: StoreServiceSearchComponent;
    let fixture: ComponentFixture<StoreServiceSearchComponent>;
    let messageFacade: MessageFacade;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                CommonModule,
                NoopAnimationsModule,
                UiLoadingModule,
                ReactiveFormsModule,
                MatButtonModule,
                FeatureSearchPageMockModule,
                FeatureDropdownColumnMockModule,
                FeatureFeatureFlagModule,
                CommonFunctionalityModule,
            ],
            declarations: [StoreServiceSearchComponent, MockRouterLinkDirective],
            providers: [
                { provide: GATEWAY_TOKEN, useValue: '//gateway/' },
                { provide: HttpClient, useValue: {} },
                {
                    provide: FEATURE_CONFIGURATION_TOKEN,
                    useValue: of({
                        default: true,
                        features: {
                            storeService: {
                                search: { massUpdate: true },
                            },
                        },
                    } as FeatureConfiguration),
                },
                { provide: AuthenticationFacade, useValue: { getUser: () => EMPTY } as any as AuthenticationFacade },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(StoreServiceSearchComponent);
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

        it('should accept the entityType', () => {
            expect(searchPage.entityType).toEqual('StoreService');
        });

        it('should accept the searchPageFacade', () => {
            expect(searchPage.searchPageFacade).toEqual(component.storeServiceFacade);
        });

        it('should accept the columns', () => {
            expect(searchPage.columns).toEqual(component.columns);
            expect(searchPage.columns['store']).toEqual(component.columns['store']);
        });

        it('should accept the routePathVariables function', () => {
            expect(searchPage.routePathVariables).toEqual(component.mapToPathVariables);
        });

        it('should pass the defaultSorts', () => {
            expect(searchPage.defaultSorts).toEqual(component.defaultSorts);
        });
    });

    describe('activate', () => {
        it('should activate, show a message and retrigger search', fakeAsync(() => {
            const storeService: StoreService = { id: { storeId: 1, serviceId: 2 } };
            jest.spyOn(messageFacade, 'addMessage');
            jest.spyOn(component.storeServiceFacade, 'activate').mockReturnValue(of(1));
            jest.spyOn(component.searchPage, 'triggerPreviousSearch');
            component.searchPage.searchComponent.selection.select(storeService);

            component.activate();
            flush();

            expect(messageFacade.addMessage).toHaveBeenCalledWith(
                expect.objectContaining({ message: '1 record(s) activated', severity: 'success' })
            );
            expect(component.searchPage.triggerPreviousSearch).toHaveBeenCalled();
            expect(component.storeServiceFacade.activate).toHaveBeenCalledWith([storeService.id]);
        }));

        it('should only call activate once, even with double clicks', fakeAsync(() => {
            component.searchPage.hasEditAccess = true;
            fixture.detectChanges();

            jest.spyOn(component.storeServiceFacade, 'activate').mockReturnValue(of(1));
            const activateButton = fixture.debugElement.query(By.css('#activate-button')).nativeElement;

            activateButton.click();
            activateButton.click();
            activateButton.click();
            tick(600);
            fixture.detectChanges();

            expect(component.storeServiceFacade.activate).toHaveBeenCalledTimes(1);
        }));
    });

    describe('deactivate', () => {
        it('should deactivate, show a message and retrigger search', fakeAsync(() => {
            const storeService: StoreService = { id: { storeId: 1, serviceId: 2 } };
            jest.spyOn(messageFacade, 'addMessage');
            jest.spyOn(component.storeServiceFacade, 'deactivate').mockReturnValue(of(1));
            jest.spyOn(component.searchPage, 'triggerPreviousSearch');
            component.searchPage.searchComponent.selection.select(storeService);

            component.deactivate();
            tick(600);

            expect(messageFacade.addMessage).toHaveBeenCalledWith(
                expect.objectContaining({ message: '1 record(s) deactivated', severity: 'success' })
            );
            expect(component.searchPage.triggerPreviousSearch).toHaveBeenCalled();
            expect(component.storeServiceFacade.deactivate).toHaveBeenCalledWith([storeService.id]);
        }));

        it('should only call deactivate once, even with double clicks', fakeAsync(() => {
            component.searchPage.hasEditAccess = true;
            fixture.detectChanges();

            jest.spyOn(component.storeServiceFacade, 'deactivate').mockReturnValue(of(1));
            const deactivateButton = fixture.debugElement.query(By.css('#deactivate-button')).nativeElement;

            deactivateButton.click();
            deactivateButton.click();
            deactivateButton.click();
            tick(600);
            fixture.detectChanges();

            expect(component.storeServiceFacade.deactivate).toHaveBeenCalledTimes(1);
        }));
    });

    describe('mass-update', () => {
        const getMassUpdateButton = () => fixture.debugElement.query(By.css('#mass-update-button'));

        beforeEach(() => {
            component.searchPage.hasEditAccess = true;
            fixture.detectChanges();
        });

        it('should navigate to mass-update', () => {
            const routerLink =
                getMassUpdateButton().injector.get<MockRouterLinkDirective>(MockRouterLinkDirective).routerLink;

            expect(routerLink).toEqual(['../mass-update']);
        });

        it('should not display if user does not have edit access', () => {
            expect(getMassUpdateButton()).toBeTruthy();
            component.searchPage.hasEditAccess = false;
            fixture.detectChanges();
            expect(getMassUpdateButton()).toBeFalsy();
        });
    });
});
