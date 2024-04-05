import { fakeAsync, flush } from '@angular/core/testing';
import { NavigationEnd, Router, RouterEvent } from '@angular/router';
import { RoleFacade } from '@vioc-angular/security/data-access-security';
import { FeatureFlagFacade } from '@vioc-angular/shared/data-access-feature-flag';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { take } from 'rxjs/operators';
import { MenuFacade } from './menu.facade';
import { MenuState } from './menu.state';
import { ActiveMenu } from './models/active-menu';
import { MenuItem } from './models/menu-item';
import {
    featureFlaggedMenuItem,
    menuItem1,
    menuItem2,
    mockMenus,
    rootMenuItem1,
    rootMenuItem2,
    securedMenuItem1,
    securedMenuItem2,
    securedMenuItem3,
    securedMenuItem4,
    securedRootMenuItem,
} from './models/menu-item.mock';

describe('MenuFacade', () => {
    const mockUpdateMenu = jest.fn();
    let mockRole$: BehaviorSubject<string[]>;
    let mockRoleFacade: RoleFacade;
    let mockMenu$: BehaviorSubject<MenuItem[]>;
    let mockState: MenuState;
    let menuFacade: MenuFacade;
    let mockRouter: Router;
    let mockFeatureFlags: Map<string, Observable<boolean>>;
    let mockFeatureFlagFacade: FeatureFlagFacade;

    beforeEach(() => {
        mockRouter = { events: new BehaviorSubject<RouterEvent>(undefined) } as unknown as Router;
        mockRole$ = new BehaviorSubject<string[]>([]);
        mockRoleFacade = { getMyRoles: () => mockRole$.asObservable() } as RoleFacade;
        mockMenu$ = new BehaviorSubject<MenuItem[]>([]);
        mockFeatureFlags = new Map<string, Observable<boolean>>();
        mockFeatureFlagFacade = {
            isEnabled: (featureFlag: string) => mockFeatureFlags.get(featureFlag),
        } as FeatureFlagFacade;
    });

    const initState = (allMenuItems: MenuItem[]) => {
        mockState = {
            menus: mockMenu$,
            allMenuItems,
            updateMenu: mockUpdateMenu,
        } as unknown as MenuState;
        menuFacade = new MenuFacade(mockState, mockRoleFacade, mockRouter, mockFeatureFlagFacade);
        mockMenu$.next(allMenuItems);
        jest.clearAllMocks();
    };

    it("should provide the state's menu", () => {
        initState([rootMenuItem1]);
        expect(menuFacade.getMenu()).toEqual(mockState.menus);
    });

    describe('when using feature flags', () => {
        it.each`
            allMenuItems                                                                                | expectedMenuItems                                                     | featureFlag
            ${[rootMenuItem1, rootMenuItem2]}                                                           | ${[rootMenuItem1, rootMenuItem2]}                                     | ${'featureFlag'}
            ${[rootMenuItem1, featureFlaggedMenuItem]}                                                  | ${[rootMenuItem1]}                                                    | ${featureFlaggedMenuItem.featureFlag}
            ${[{ ...rootMenuItem2, subMenus: [featureFlaggedMenuItem] }]}                               | ${[{ ...rootMenuItem2, subMenus: [] }]}                               | ${featureFlaggedMenuItem.featureFlag}
            ${[{ ...rootMenuItem2, subMenus: [{ ...menuItem1, subMenus: [featureFlaggedMenuItem] }] }]} | ${[{ ...rootMenuItem2, subMenus: [{ ...menuItem1, subMenus: [] }] }]} | ${featureFlaggedMenuItem.featureFlag}
        `(
            'should handle feature flags that have not returned yet',
            fakeAsync(({ allMenuItems, expectedMenuItems, featureFlag }) => {
                mockFeatureFlags.set(featureFlag, new Subject<boolean>());
                initState(allMenuItems);
                mockRole$.next([]);

                expect(mockState.updateMenu).toHaveBeenLastCalledWith(expectedMenuItems);
            })
        );

        it.each`
            allMenuItems                                                                                           | expectedMenuItems                                                                                      | featureFlag                           | enabled
            ${[rootMenuItem1, rootMenuItem2]}                                                                      | ${[rootMenuItem1, rootMenuItem2]}                                                                      | ${'featureFlag'}                      | ${false}
            ${[rootMenuItem1, featureFlaggedMenuItem]}                                                             | ${[rootMenuItem1]}                                                                                     | ${featureFlaggedMenuItem.featureFlag} | ${false}
            ${[rootMenuItem1, featureFlaggedMenuItem]}                                                             | ${[rootMenuItem1, featureFlaggedMenuItem]}                                                             | ${featureFlaggedMenuItem.featureFlag} | ${true}
            ${[{ ...rootMenuItem2, subMenus: [featureFlaggedMenuItem] }]}                                          | ${[{ ...rootMenuItem2, subMenus: [] }]}                                                                | ${featureFlaggedMenuItem.featureFlag} | ${false}
            ${[{ ...rootMenuItem2, subMenus: [featureFlaggedMenuItem] }]}                                          | ${[{ ...rootMenuItem2, subMenus: [featureFlaggedMenuItem] }]}                                          | ${featureFlaggedMenuItem.featureFlag} | ${true}
            ${[{ ...rootMenuItem2, subMenus: [{ ...menuItem1, subMenus: [featureFlaggedMenuItem] }] }]}            | ${[{ ...rootMenuItem2, subMenus: [{ ...menuItem1, subMenus: [] }] }]}                                  | ${featureFlaggedMenuItem.featureFlag} | ${false}
            ${[{ ...rootMenuItem2, subMenus: [{ ...menuItem1, subMenus: [featureFlaggedMenuItem] }] }]}            | ${[{ ...rootMenuItem2, subMenus: [{ ...menuItem1, subMenus: [featureFlaggedMenuItem] }] }]}            | ${featureFlaggedMenuItem.featureFlag} | ${true}
            ${[{ ...rootMenuItem1, subMenus: [featureFlaggedMenuItem] }, rootMenuItem2]}                           | ${[rootMenuItem2]}                                                                                     | ${featureFlaggedMenuItem.featureFlag} | ${false}
            ${[{ ...rootMenuItem1, subMenus: [featureFlaggedMenuItem] }, rootMenuItem2]}                           | ${[{ ...rootMenuItem1, subMenus: [featureFlaggedMenuItem] }, rootMenuItem2]}                           | ${featureFlaggedMenuItem.featureFlag} | ${true}
            ${[{ ...rootMenuItem1, subMenus: [menuItem1, { ...menuItem2, subMenus: [featureFlaggedMenuItem] }] }]} | ${[{ ...rootMenuItem1, subMenus: [menuItem1] }]}                                                       | ${featureFlaggedMenuItem.featureFlag} | ${false}
            ${[{ ...rootMenuItem1, subMenus: [menuItem1, { ...menuItem2, subMenus: [featureFlaggedMenuItem] }] }]} | ${[{ ...rootMenuItem1, subMenus: [menuItem1, { ...menuItem2, subMenus: [featureFlaggedMenuItem] }] }]} | ${featureFlaggedMenuItem.featureFlag} | ${true}
        `(
            'should handle feature flags that have returned',
            fakeAsync(({ allMenuItems, expectedMenuItems, featureFlag, enabled }) => {
                mockFeatureFlags.set(featureFlag, of(enabled));
                initState(allMenuItems);
                mockRole$.next([]);

                expect(mockState.updateMenu).toHaveBeenLastCalledWith(expectedMenuItems);
            })
        );
    });

    describe("should filter the menus based on the user's role", () => {
        beforeEach(() => {
            initState([{ ...securedRootMenuItem }]);
        });

        it('when user has no roles', () => {
            mockRole$.next([]);
            expect(mockState.updateMenu).toHaveBeenCalledWith([]);
        });
        it('when user has no matching role', () => {
            mockRole$.next(['BAD_ROLE']);
            expect(mockState.updateMenu).toHaveBeenCalledWith([]);
        });
        it('when user has some access', () => {
            mockRole$.next(['TEST_ROLE', 'TEST_SUB_ROLE2']);
            const results = mockUpdateMenu.mock.calls[0][0];
            // Doing a shallow verification since deep verification is broken when defaulting to empty arrays instead of undefined
            expect(results.length).toEqual(1);
            expect(results[0].name).toEqual(securedRootMenuItem.name);
            expect(results[0].subMenus.length).toEqual(1);
            expect(results[0].subMenus[0].name).toEqual(securedMenuItem2.name);
            expect(results[0].subMenus[0].subMenus.length).toEqual(1);
            expect(results[0].subMenus[0].subMenus[0].name).toEqual(securedMenuItem3.name);
        });
        it('when user has all access', () => {
            mockRole$.next(['TEST_ROLE', 'TEST_SUB_ROLE', 'TEST_SUB_ROLE2']);
            const results = mockUpdateMenu.mock.calls[0][0];
            // Doing a shallow verification since deep verification is broken when defaulting to empty arrays instead of undefined
            expect(results.length).toEqual(1);
            expect(results[0].name).toEqual(securedRootMenuItem.name);
            expect(results[0].subMenus.length).toEqual(2);
            expect(results[0].subMenus[0].name).toEqual(securedMenuItem1.name);
            expect(results[0].subMenus[1].name).toEqual(securedMenuItem2.name);
            expect(results[0].subMenus[1].subMenus.length).toEqual(1);
            expect(results[0].subMenus[1].subMenus[0].name).toEqual(securedMenuItem3.name);
        });
        it("when user doesn't have access to any child menus of a menu", () => {
            mockRole$.next(['TEST_ROLE', 'TEST_SUB_ROLE']);
            const results = mockUpdateMenu.mock.calls[0][0];
            // Doing a shallow verification since deep verification is broken when defaulting to empty arrays instead of undefined
            expect(results.length).toEqual(1);
            expect(results[0].name).toEqual(securedRootMenuItem.name);
            // securedMenuItem2 will be removed because it doesn't have a path and its only child menu was removed due to missing role
            expect(results[0].subMenus.length).toEqual(1);
            expect(results[0].subMenus[0].name).toEqual(securedMenuItem1.name);
        });
        it('when user has one of the MenuItem possible roles', () => {
            mockRole$.next(['TEST_ROLE', 'TEST_OR_ROLE2']);
            const results = mockUpdateMenu.mock.calls[0][0];
            // Doing a shallow verification since deep verification is broken when defaulting to empty arrays instead of undefined
            expect(results.length).toEqual(1);
            expect(results[0].name).toEqual(securedRootMenuItem.name);
            // securedMenuItem2 will be removed because it doesn't have a path and its only child menu was removed due to missing role
            // user should have access to securedMenuItem4 as it has at least one of the required roles (OR logic)
            expect(results[0].subMenus.length).toEqual(1);
            expect(results[0].subMenus[0].name).toEqual(securedMenuItem4.name);
        });
        it('when user has none of the MenuItem possible roles', () => {
            mockRole$.next(['TEST_ROLE', 'TEST_OR_ROLE3']);
            const results = mockUpdateMenu.mock.calls[0][0];
            // Doing a shallow verification since deep verification is broken when defaulting to empty arrays instead of undefined
            // securedRootMenuItem will be removed because it doesn't have a path and all its child menus were removed due to missing role
            // user should NOT have access to securedMenuItem4 as it has none of its required roles
            expect(results.length).toEqual(0);
        });
    });

    describe('getActiveMenu', () => {
        const verifyActiveMenu = (menus: MenuItem[], routerPath: string, expectedActiveMenu: ActiveMenu) => {
            initState(menus);
            (mockRouter.events as unknown as BehaviorSubject<RouterEvent>).next(
                new NavigationEnd(null, routerPath, null)
            );
            menuFacade
                .getActiveMenu()
                .pipe(take(1))
                .subscribe((am) => expect(am).toEqual(expectedActiveMenu));
            flush();
            expect.assertions(1);
        };

        it('should find the activeMenu when the url matches a root menuItem', fakeAsync(() => {
            const expectedActiveMenu = { rootMenu: rootMenuItem2, subMenu: rootMenuItem2 };
            verifyActiveMenu(mockMenus, rootMenuItem2.path, expectedActiveMenu);
        }));
        it('should find the activeMenu when the url matches a leaf menuItem', fakeAsync(() => {
            const expectedActiveMenu = { rootMenu: securedRootMenuItem, subMenu: securedMenuItem1 };
            verifyActiveMenu([securedRootMenuItem], securedMenuItem1.path, expectedActiveMenu);
        }));
        it("shouldn't find an activeMenu when the url doesn't match any menuItem", fakeAsync(() => {
            const expectedActiveMenu = { rootMenu: undefined, subMenu: undefined };
            verifyActiveMenu(mockMenus, 'bad-url', expectedActiveMenu);
        }));
        it("shouldn't find an activeMenu when no menus available", fakeAsync(() => {
            const expectedActiveMenu = { rootMenu: undefined, subMenu: undefined };
            verifyActiveMenu([], securedMenuItem1.path, expectedActiveMenu);
        }));
    });
});
