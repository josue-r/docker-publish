import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
// TODO: 04/03/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
// tslint:disable-next-line: nx-enforce-module-boundaries
import { FeatureSearchPageMockModule, MockSearchPageComponent } from '@vioc-angular/central-ui/feature-search-page';
import { StoreProduct } from '@vioc-angular/central-ui/product/data-access-store-product';
import { AuthenticationFacade } from '@vioc-angular/security/data-access-security';
import { FEATURE_CONFIGURATION_TOKEN, FeatureConfiguration } from '@vioc-angular/shared/common-feature-flag';
import { CommonFunctionalityModule, Described } from '@vioc-angular/shared/common-functionality';
import { MessageFacade } from '@vioc-angular/shared/data-access-message';
// TODO: 04/03/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
// tslint:disable-next-line: nx-enforce-module-boundaries
import { FeatureDropdownColumnModule } from '@vioc-angular/shared/feature-dropdown-column';
import { FeatureFeatureFlagModule } from '@vioc-angular/shared/feature-feature-flag';
import { UiLoadingModule } from '@vioc-angular/shared/ui-loading';
import { GATEWAY_TOKEN } from '@vioc-angular/shared/util-api';
import { MockRouterLinkDirective } from '@vioc-angular/test/util-test';
import { EMPTY, of } from 'rxjs';
import { StoreProductSearchComponent } from './store-product-search.component';

describe('StoreProductSearchComponent', () => {
    let component: StoreProductSearchComponent;
    let fixture: ComponentFixture<StoreProductSearchComponent>;
    let messageFacade: MessageFacade;

    const storeProduct = {
        product: { code: 'PRODUCT', description: '' } as Described,
        store: { code: '990012', description: '' } as Described,
    } as StoreProduct;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                CommonModule,
                NoopAnimationsModule,
                UiLoadingModule,
                ReactiveFormsModule,
                MatButtonModule,
                FeatureDropdownColumnModule,
                FeatureFeatureFlagModule,
                FeatureSearchPageMockModule,
                CommonFunctionalityModule,
            ],
            declarations: [StoreProductSearchComponent, MockRouterLinkDirective],
            providers: [
                { provide: GATEWAY_TOKEN, useValue: '//gateway/' },
                { provide: HttpClient, useValue: {} },
                {
                    provide: FEATURE_CONFIGURATION_TOKEN,
                    useValue: of({
                        default: true,
                        features: {
                            storeProduct: {
                                search: {
                                    add: true,
                                    massUpdate: true,
                                    activateDeactivate: true,
                                },
                            },
                        },
                    } as FeatureConfiguration),
                },
                { provide: AuthenticationFacade, useValue: { getUser: () => EMPTY } as any as AuthenticationFacade },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(StoreProductSearchComponent);
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
            expect(searchPage.entityType).toEqual('StoreProduct');
        });

        it('should accept the searchPageFacade', () => {
            expect(searchPage.searchPageFacade).toEqual(component.storeProductFacade);
        });

        it('should accept the columns', () => {
            expect(searchPage.columns).toEqual(component.columns);
            expect(searchPage.columns['productCode']).toEqual(component.columns['productCode']);
        });

        it('should accept the routePathVariables function', () => {
            expect(searchPage.routePathVariables).toEqual(component.toPathVariables);
        });

        it('should pass the defaultSorts', () => {
            expect(searchPage.defaultSorts).toEqual(component.defaultSorts);
        });
    });

    describe('when activating', () => {
        beforeEach(() => {
            component.searchPage.searchComponent.selection.select(storeProduct);
            jest.spyOn(component.storeProductFacade, 'activate').mockReturnValue(of(1));
            fixture.detectChanges();
        });

        it('should activate the selected records', () => {
            jest.spyOn(messageFacade, 'addMessage');

            component.activate();

            expect(messageFacade.addMessage).toHaveBeenCalledWith(
                expect.objectContaining({ message: '1 record(s) activated', severity: 'success' })
            );
        });

        it('should trigger activate method once on multiple clicks', fakeAsync(() => {
            jest.spyOn(messageFacade, 'addMessage');
            component.searchPage.hasEditAccess = true;
            fixture.detectChanges();

            const activateButton = fixture.debugElement.query(By.css('#activateButton'));
            activateButton.nativeElement.click();
            activateButton.nativeElement.click();
            activateButton.nativeElement.click();
            tick(600);

            expect(messageFacade.addMessage).toHaveBeenCalledWith(
                expect.objectContaining({ message: '1 record(s) activated', severity: 'success' })
            );
        }));

        it('should redo previous search', () => {
            jest.spyOn(component.searchPage, 'triggerPreviousSearch');

            component.activate();

            expect(component.searchPage.triggerPreviousSearch).toHaveBeenCalled();
        });
    });

    describe('when deactivating', () => {
        beforeEach(() => {
            component.searchPage.searchComponent.selection.select(storeProduct);
            jest.spyOn(component.storeProductFacade, 'deactivate').mockReturnValue(of(1));
            fixture.detectChanges();
        });

        it('should trigger deactivate method once on multiple clicks', fakeAsync(() => {
            jest.spyOn(messageFacade, 'addMessage');
            component.searchPage.hasEditAccess = true;
            fixture.detectChanges();

            const deactivateButton = fixture.debugElement.query(By.css('#deactivateButton'));
            deactivateButton.nativeElement.click();
            deactivateButton.nativeElement.click();
            deactivateButton.nativeElement.click();
            tick(600);

            expect(messageFacade.addMessage).toHaveBeenCalledWith(
                expect.objectContaining({ message: '1 record(s) deactivated', severity: 'success' })
            );
        }));

        it('should deactivate the selected records when clicking mass deactivate', () => {
            jest.spyOn(messageFacade, 'addMessage');

            component.deactivate();

            expect(messageFacade.addMessage).toHaveBeenCalledWith(
                expect.objectContaining({ message: '1 record(s) deactivated', severity: 'success' })
            );
        });

        it('should redo previous search', () => {
            jest.spyOn(component.searchPage, 'triggerPreviousSearch');

            component.deactivate();

            expect(component.searchPage.triggerPreviousSearch).toHaveBeenCalled();
        });
    });

    describe('mass update', () => {
        const massUpdateButton = () => fixture.debugElement.query(By.css('#mass-update-button'));

        beforeEach(() => {
            component.searchPage.hasEditAccess = true;
            fixture.detectChanges();
        });

        it('should navigate to mass-update', () => {
            const routerLink =
                massUpdateButton().injector.get<MockRouterLinkDirective>(MockRouterLinkDirective).routerLink;

            expect(routerLink).toEqual(['../mass-update']);
        });

        it('should not display if user does not have edit access', () => {
            expect(massUpdateButton()).toBeTruthy();
            component.searchPage.hasEditAccess = false;
            fixture.detectChanges();
            expect(massUpdateButton()).toBeFalsy();
        });
    });
});
