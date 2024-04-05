import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { HttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonHarness } from '@angular/material/button/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Discount } from '@vioc-angular/central-ui/discount/data-access-discount';
import { FeatureSearchPageMockModule, MockSearchPageComponent } from '@vioc-angular/central-ui/feature-search-page';
import { AuthenticationFacade } from '@vioc-angular/security/data-access-security';
import { CommonFunctionalityModule } from '@vioc-angular/shared/common-functionality';
import { MessageFacade } from '@vioc-angular/shared/data-access-message';
import { FeatureDropdownColumnMockModule } from '@vioc-angular/shared/feature-dropdown-column';
import { FeatureFeatureFlagModule } from '@vioc-angular/shared/feature-feature-flag';
import { UiLoadingModule } from '@vioc-angular/shared/ui-loading';
import { GATEWAY_TOKEN } from '@vioc-angular/shared/util-api';
import { AbstractDropdownColumn, Column, DynamicDropdownColumn } from '@vioc-angular/shared/util-column';
import { MockRouterLinkDirective } from '@vioc-angular/test/util-test';
import { EMPTY, of } from 'rxjs';
import { DiscountsSearchComponent } from './discounts-search.component';
import exp = require('constants');

describe('DiscountsSearchComponent', () => {
    let component: DiscountsSearchComponent;
    let fixture: ComponentFixture<DiscountsSearchComponent>;
    let messageFacade: MessageFacade;
    let loader: HarnessLoader;

    const discount = {
        id: '1',
    } as Discount;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                UiLoadingModule,
                MatButtonModule,
                FeatureSearchPageMockModule,
                FeatureFeatureFlagModule,
                CommonFunctionalityModule,
                FeatureDropdownColumnMockModule,
            ],
            declarations: [DiscountsSearchComponent, MockRouterLinkDirective],
            providers: [
                { provide: GATEWAY_TOKEN, useValue: '//gateway/' },
                { provide: HttpClient, useValue: {} },
                { provide: AuthenticationFacade, useValue: { getUser: () => EMPTY } as any as AuthenticationFacade },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(DiscountsSearchComponent);
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
            expect(searchPage.entityType).toEqual('Discount');
        });

        it('should pass the searchPageFacade', () => {
            expect(searchPage.searchPageFacade).toEqual(component.discountFacade);
        });

        it('should pass the columns', () => {
            expect(searchPage.columns).toEqual(component.columns);
        });

        it('should accept the routePathVariables function', () => {
            expect(searchPage.routePathVariables).toEqual(component.toPathVariables);
        });

        it('should pass the defaultSorts', () => {
            expect(searchPage.defaultSorts).toEqual(component.defaultSorts);
        });

        it('should have the company column if user has the role', () => {
            jest.spyOn(component['roleFacade'], 'hasAnyRole').mockReturnValue(of(true));

            fixture = TestBed.createComponent(DiscountsSearchComponent);
            searchPage = fixture.debugElement.query(By.directive(MockSearchPageComponent)).componentInstance;
            component = fixture.componentInstance;
            fixture.detectChanges();

            expect(component.columns.company).toBeDefined();

            const searchPageCompanyColumn = searchPage.columns.company;
            const componentCompanyColumn = component.columns.company;

            //check if company is a default searchable criteria
            expect((componentCompanyColumn as () => AbstractDropdownColumn<any>)().searchable).toEqual({
                defaultSearch: true,
            });

            expect((searchPageCompanyColumn as () => AbstractDropdownColumn<any>)().name).toEqual(
                (componentCompanyColumn as () => AbstractDropdownColumn<any>)().name
            );

            expect((searchPageCompanyColumn as () => AbstractDropdownColumn<any>)().apiFieldPath).toEqual(
                (componentCompanyColumn as () => AbstractDropdownColumn<any>)().apiFieldPath
            );

            expect((searchPageCompanyColumn as () => AbstractDropdownColumn<any>)().apiSortPath).toEqual(
                (componentCompanyColumn as () => AbstractDropdownColumn<any>)().apiSortPath
            );

            expect((searchPageCompanyColumn as () => AbstractDropdownColumn<any>)().type).toEqual(
                (componentCompanyColumn as () => AbstractDropdownColumn<any>)().type
            );

            expect((searchPageCompanyColumn as () => AbstractDropdownColumn<any>)().hint).toEqual(
                (componentCompanyColumn as () => AbstractDropdownColumn<any>)().hint
            );

            expect((searchPageCompanyColumn as () => AbstractDropdownColumn<any>)().displayable).toEqual(
                (componentCompanyColumn as () => AbstractDropdownColumn<any>)().displayable
            );

            expect((searchPageCompanyColumn as () => AbstractDropdownColumn<any>)().isSearchedByDefault).toEqual(
                (componentCompanyColumn as () => AbstractDropdownColumn<any>)().isSearchedByDefault
            );
        });

        it('should not have the company column if user does not have the role', () => {
            jest.spyOn(component['roleFacade'], 'hasAnyRole').mockReturnValue(of(false));

            fixture = TestBed.createComponent(DiscountsSearchComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();

            expect(component.columns.company).toBeUndefined();
        });

        it.each`
            column
            ${'discountClassificationDescription'}
            ${'deviceDescription'}
            ${'audienceDescription'}
            ${'channelDescription'}
            ${'programDescription'}
            ${'ownerDescription'}
            ${'approachDescription'}
            ${'appliesTo'}
            ${'serviceOffer'}
        `('should pass overridden values from CommonCode', ({ column }) => {
            expect((searchPage.columns[column] as () => DynamicDropdownColumn<any>)().name).toEqual(
                (component.columns[column] as () => DynamicDropdownColumn<any>)().name
            );

            expect((searchPage.columns[column] as () => DynamicDropdownColumn<any>)().apiFieldPath).toEqual(
                (component.columns[column] as () => DynamicDropdownColumn<any>)().apiFieldPath
            );

            expect((searchPage.columns[column] as () => DynamicDropdownColumn<any>)().type).toEqual(
                (component.columns[column] as () => DynamicDropdownColumn<any>)().type
            );

            expect((searchPage.columns[column] as () => DynamicDropdownColumn<any>)().displayable).toEqual(
                (component.columns[column] as () => DynamicDropdownColumn<any>)().displayable
            );

            expect((searchPage.columns[column] as () => DynamicDropdownColumn<any>)().isSearchedByDefault).toEqual(
                (component.columns[column] as () => DynamicDropdownColumn<any>)().isSearchedByDefault
            );
        });

        it('should map typeDisplay value display', () => {
            expect((searchPage.columns['typeDisplay'] as Column).mapToTableDisplay(true)).toEqual('National');
            expect((searchPage.columns['typeDisplay'] as Column).mapToTableDisplay(false)).toEqual('Local');
            // Serializes to same string, Mitigate with JSON.stringify
            expect(JSON.stringify((searchPage.columns['typeDisplay'] as Column).mapToTableDisplay)).toEqual(
                JSON.stringify((component.columns['typeDisplay'] as Column).mapToTableDisplay)
            );
        });

        it('typeDisplay column should contain new custom comparators', () => {
            expect(component.columns.typeDisplay['comparators']).toContainEqual(DiscountsSearchComponent.isNational);
            expect(component.columns.typeDisplay['comparators']).toContainEqual(DiscountsSearchComponent.isLocal);
        });

        it('should pass only the discountCode as a pathVariable for national discounts', () => {
            const nationalDiscount = { ...new Discount(), national: true, code: '1234', company: null };
            const pathVariables = component.toPathVariables(nationalDiscount);
            expect(pathVariables).toEqual([nationalDiscount.code]);
        });

        it('should pass both the discountCode and companyCode as pathVariables for local discounts', () => {
            const testCompany = { id: 1, code: 'VAL', description: 'Test Company', version: 0 };
            const localDiscount = { ...new Discount(), national: false, code: '5678', company: testCompany };
            const pathVariables = component.toPathVariables(localDiscount);
            expect(pathVariables).toEqual([localDiscount.code, localDiscount.company.code]);
        });
    });

    describe('add button', () => {
        it('should navigate to add page', () => {
            component.searchPage.hasAddAccess = true;
            fixture.detectChanges();

            const routerLink = fixture.debugElement
                .query(By.css('#add-button'))
                .injector.get<MockRouterLinkDirective>(MockRouterLinkDirective).routerLink;

            expect(routerLink).toEqual(['../add']);
        });

        it('should hide if without add access', () => {
            component.searchPage.hasAddAccess = false;
            fixture.detectChanges();

            const addButton = fixture.debugElement.query(By.css('#add-button'));

            expect(addButton).toBeFalsy();
        });
    });

    describe('when activating', () => {
        const getActivateButton = async () => {
            return loader.getHarness(
                MatButtonHarness.with({
                    selector: '#activate-button',
                })
            );
        };
        const clickActivateButton = async () => (await getActivateButton()).click();

        beforeEach(() => {
            component.searchPage.searchComponent.selection.select(discount);
            jest.spyOn(component.discountFacade, 'activate').mockReturnValue(of(1));
            component.searchPage.hasEditAccess = true;
            fixture.detectChanges();
        });

        it('should send the activation request and get the number of updated records', async () => {
            jest.spyOn(messageFacade, 'addMessage');

            await clickActivateButton();
            fixture.detectChanges();

            expect(component.discountFacade.activate).toHaveBeenCalledWith([discount.id]);
            expect(messageFacade.addMessage).toHaveBeenCalledWith({
                message: '1 record(s) activated',
                severity: 'success',
            });
            expect(component.isLoading).toBe(false);
        });

        it('should only call activate once, even with double clicks', fakeAsync(async () => {
            jest.spyOn(messageFacade, 'addMessage');

            await clickActivateButton();
            await clickActivateButton();
            tick(600);

            fixture.detectChanges();
            expect(component.discountFacade.activate).toHaveBeenCalledTimes(1);
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
            component.searchPage.searchComponent.selection.select(discount);
            jest.spyOn(component.discountFacade, 'deactivate').mockReturnValue(of(1));
            component.searchPage.hasEditAccess = true;
            fixture.detectChanges();
        });

        it('should send the deactivation request and get the number of updated records', async () => {
            jest.spyOn(messageFacade, 'addMessage');

            await clickDeactivateButton();

            expect(component.discountFacade.deactivate).toHaveBeenCalledWith([discount.id]);
            expect(messageFacade.addMessage).toHaveBeenCalledWith({
                message: '1 record(s) deactivated',
                severity: 'success',
            });
        });

        it('should only call deactivate once, even with double clicks', fakeAsync(async () => {
            jest.spyOn(messageFacade, 'addMessage');

            await clickDeactivateButton();
            await clickDeactivateButton();
            tick(600);

            fixture.detectChanges();
            expect(component.discountFacade.deactivate).toHaveBeenCalledTimes(1);
            expect(component.isLoading).toBe(false);
        }));

        it('should redo previous search', async () => {
            jest.spyOn(component.searchPage, 'triggerPreviousSearch');

            await clickDeactivateButton();

            expect(component.searchPage.triggerPreviousSearch).toHaveBeenCalled();
        });

        it('should not show deactivate button if user does not have edit access', async () => {
            expect(await getDeactivateButton()).toBeTruthy();
            component.searchPage.hasEditAccess = false;
            return expect(async () => await getDeactivateButton()).rejects.toThrow();
        });
    });
});
