import { Component, Input } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { By, Title } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
// TODO: 04/03/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
// eslint-disable-next-line
import { ActiveMenu, MenuFacade, MenuItem, mockMenus } from '@vioc-angular/central-ui/data-access-menu';
import { RouterService } from '@vioc-angular/central-ui/util-router';
import { UiFooterModule } from '@vioc-angular/layout/ui-footer';
import { UiHeaderModule } from '@vioc-angular/layout/ui-header';
// TODO: 04/03/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
//  This needs to be put into a feature module that configures all
// eslint-disable-next-line
import { AuthenticationFacade, User } from '@vioc-angular/security/data-access-security';
import { BehaviorSubject, Subject } from 'rxjs';
import { take } from 'rxjs/operators';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
    let fixture: ComponentFixture<AppComponent>;
    let app: AppComponent;
    let isAuthenticatedSubject: BehaviorSubject<boolean>;
    let getUserSubject: BehaviorSubject<User>;
    let mockMenu: Subject<MenuItem[]>;
    let mockActiveMenu: Subject<ActiveMenu>;
    let titleService: Title;
    const initialPageTitle = 'VIOC Central';
    const mockMenuFacade = { getMenu: () => mockMenu, getActiveMenu: () => mockActiveMenu };
    const mockRouter = { navigate: jest.fn() };
    const mockRouterService = { navigateToDashboard: jest.fn() };

    @Component({
        selector: 'vioc-angular-messages',
        template: '',
    })
    class MockMessagesComponent {}
    @Component({
        selector: 'vioc-angular-logout-when-idle',
        template: '',
    })
    class MockLogoutWhenIdleComponent {}

    @Component({
        selector: 'vioc-angular-sidenav',
        template: '',
    })
    class MockSidenavComponent {
        @Input() menu;
        @Input() activeMenu;
        @Input() homeLogo;
    }

    @Component({
        selector: 'vioc-angular-about-dialog',
        template: '<span></span>',
    })
    class MockAboutDialogComponent {
        open = jest.fn();
    }

    beforeEach(async () => {
        isAuthenticatedSubject = new BehaviorSubject(false);
        getUserSubject = new BehaviorSubject(undefined);
        await TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                RouterTestingModule,
                MatIconModule,
                MatMenuModule,
                MatButtonModule,
                MatSidenavModule,
                // TODO: components from these modules should probably be mocked
                UiFooterModule,
                UiHeaderModule,
            ],
            declarations: [
                AppComponent,
                MockMessagesComponent,
                MockSidenavComponent,
                MockLogoutWhenIdleComponent,
                MockAboutDialogComponent,
            ],
            providers: [
                {
                    provide: AuthenticationFacade,
                    useValue: {
                        getUser: () => getUserSubject,
                        logout: () => {},
                        isAuthenticated: () => isAuthenticatedSubject,
                    },
                },
                { provide: MenuFacade, useValue: mockMenuFacade },
                { provide: Router, useValue: mockRouter },
                { provide: RouterService, useValue: mockRouterService },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        jest.clearAllMocks();
        mockMenu = new Subject<MenuItem[]>();
        mockActiveMenu = new Subject<ActiveMenu>();
        fixture = TestBed.createComponent(AppComponent);
        app = fixture.componentInstance;
        titleService = TestBed.inject(Title);
        titleService.setTitle(initialPageTitle);
    });

    it('should create the app', () => {
        expect(app).toBeTruthy();
    });

    describe('constructor', () => {
        const testActiveMenu = { rootMenu: { name: 'test-root' }, subMenu: { name: 'test-child' } };
        it('should setup menu observable', fakeAsync(() => {
            app.menu$.pipe(take(1)).subscribe((menu) => expect(menu).toEqual(mockMenus));
            mockMenu.next(mockMenus);
            flush();
            expect.assertions(1);
        }));
        it('should setup activeMenu observable', fakeAsync(() => {
            app.activeMenu$.pipe(take(1)).subscribe((am) => expect(am).toEqual(testActiveMenu));
            mockActiveMenu.next(testActiveMenu);
            flush();
            expect.assertions(1);
        }));
        it('should setup title observable', fakeAsync(() => {
            const defaultHeaderTitle = 'Home'; // Should match what's setup in constructor
            // Verify default title used initially when no activeMenu observable output yet
            let expectedTitle = defaultHeaderTitle;
            // Subscribe to the observable and depend on the expectedTitle var for expectations
            const expectationSub = app.title$.subscribe((title) => {
                expect(title).toEqual(expectedTitle);
                expect(titleService.getTitle()).toEqual(`${initialPageTitle} - ${title}`);
            });
            flush();
            // Verify subMenu name used as title when activeMenu exists
            expectedTitle = testActiveMenu.subMenu.name;
            mockActiveMenu.next(testActiveMenu);
            flush();
            // Verify default title used if no subMenu available on activeMenu
            expectedTitle = defaultHeaderTitle;
            mockActiveMenu.next({ rootMenu: undefined, subMenu: undefined });
            flush();
            expectationSub.unsubscribe();
            expect.assertions(6); // Verify all 3 page header and all 3 page title expectations happened
        }));
    });

    describe('the currently logged in user', () => {
        const findUserNameText = (): string => {
            const userNameSpan = fixture.debugElement.query(By.css('span#user-name'));
            return userNameSpan && userNameSpan.nativeElement.textContent;
        };
        it('should display when logged in', () => {
            isAuthenticatedSubject.next(true);
            getUserSubject.next({ name: 'Test User' } as User);

            fixture.detectChanges();

            expect(findUserNameText()).toEqual('Test User');
        });
        it('should not display when not logged in', () => {
            isAuthenticatedSubject.next(false);
            getUserSubject.next({ name: 'Test User' } as User);

            fixture.detectChanges();

            expect(findUserNameText()).toBeNull();
        });
    });

    describe('navigate', () => {
        it('should navigate to the given path using the router', () => {
            const testRoute = 'test';
            app.navigate(testRoute);
            expect(mockRouter.navigate).toHaveBeenCalledWith([testRoute]);
        });
    });

    describe('goHome', () => {
        it('should navigate home using the routerService', () => {
            app.goHome();
            expect(mockRouterService.navigateToDashboard).toHaveBeenCalled();
        });
    });

    it('should logout', () => {
        app.logout();
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/logout']);
    });
});
