import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { RoleFacade } from '@vioc-angular/security/data-access-security';
import { FeatureFlagFacade } from '@vioc-angular/shared/data-access-feature-flag';
import { combineLatest, Observable } from 'rxjs';
import { filter, map, startWith } from 'rxjs/operators';
import { MenuState } from './menu.state';
import { ActiveMenu } from './models/active-menu';
import { MenuItem } from './models/menu-item';

@Injectable({ providedIn: 'root' })
export class MenuFacade {
    constructor(
        private readonly _state: MenuState,
        private readonly _roleFacade: RoleFacade,
        private readonly _router: Router,
        private readonly _featureFlagFacade: FeatureFlagFacade
    ) {
        const menuItemsWithFeatureFlags: MenuItem[] = [].concat(...this._state.allMenuItems.map(this.hasFeatureFlag));
        const featureFlags$ = menuItemsWithFeatureFlags.map((menuItem) =>
            this._featureFlagFacade.isEnabled(menuItem.featureFlag)
        );
        const roles$ = this._roleFacade.getMyRoles();
        const initialFlags = menuItemsWithFeatureFlags.map(() => false);
        combineLatest([roles$, combineLatest(featureFlags$).pipe(startWith(initialFlags))]).subscribe(
            // not using takeUntil, this is a root service so will exist as long as the app does
            ([roles, featureFlags]) => {
                // need a copy so we don't modify the origianl allMenuItems
                let menuItems = this.deepCopyMenuItems(this._state.allMenuItems);
                menuItems = this._filterWithRoles(roles, menuItems);
                const menuItemToFeatureFlag: Map<string, boolean> = new Map<string, boolean>();
                menuItemsWithFeatureFlags.forEach((menuItem, index) => {
                    menuItemToFeatureFlag.set(menuItem.name, featureFlags[index]);
                });
                menuItems = this.filterByFeatureFlag(menuItemToFeatureFlag, menuItems);
                this._state.updateMenu(menuItems);
            }
        );
    }

    getMenu(): Observable<MenuItem[]> {
        return this._state.menus;
    }

    /**
     * Returns a list of all menu items and nested submenu items that have feature flags assigned to them.
     */
    private hasFeatureFlag = (menuItem: MenuItem): MenuItem[] => {
        let hasFeatureFlag: MenuItem[] = [];
        if (menuItem.featureFlag) {
            hasFeatureFlag.push(menuItem);
        }
        if (menuItem.subMenus) {
            hasFeatureFlag = hasFeatureFlag.concat(...menuItem.subMenus.map(this.hasFeatureFlag));
        }
        return hasFeatureFlag;
    };

    /**
     * Filters the passed menu items and nested submen items by feature flag enabled or not. Removes any
     * items that don't have a path or a visible submenu item
     */
    private filterByFeatureFlag(menuItemToFeatureFlag: Map<string, boolean>, menuItems: MenuItem[]): MenuItem[] {
        return menuItems
            .filter((menuItem) => !menuItem.featureFlag || menuItemToFeatureFlag.get(menuItem.name))
            .map((menuItem) => {
                if (menuItem.subMenus) {
                    menuItem.subMenus = this.filterByFeatureFlag(menuItemToFeatureFlag, menuItem.subMenus);
                }
                return menuItem;
            })
            .filter(this.hasPathOrSubMenu);
    }

    /**
     * Creates a deep copy of all the menu items as well as any nested submenus
     */
    private deepCopyMenuItems(menuItems: MenuItem[]): MenuItem[] {
        return menuItems.map((menuItem) => {
            if (menuItem.subMenus) {
                return { ...menuItem, subMenus: this.deepCopyMenuItems(menuItem.subMenus) };
            }
            return { ...menuItem };
        });
    }

    /**
     * Checks if the passed menu item has any visible submenu items or a path
     */
    private hasPathOrSubMenu(menuItem: MenuItem) {
        return (menuItem.subMenus && menuItem.subMenus.length > 0) || menuItem.path;
    }

    /** Listen to route and menu changes and determine the currently active root and child menu items. */
    getActiveMenu(): Observable<ActiveMenu> {
        return combineLatest([
            this._router.events.pipe(
                filter((event) => event instanceof NavigationEnd),
                map((event: NavigationEnd) => event.url)
            ),
            this.getMenu(),
        ]).pipe(map(([activeRoute, menu]) => this._getActiveMenu(activeRoute, menu)));
    }

    /** Filter out each MenuItem that the user doesn't have access to. */
    private _filterWithRoles(userRoles: string[], menuItems: MenuItem[] = []): MenuItem[] {
        let filtered = menuItems.filter((menu) => this._hasAccess(menu, userRoles));
        filtered.forEach((menu) => {
            if (menu.subMenus) {
                menu.subMenus = this._filterWithRoles(userRoles, menu.subMenus);
            }
        });
        // Trim out any menus that have no subMenus and no path
        filtered = filtered.filter(this.hasPathOrSubMenu);
        return filtered;
    }

    /** Check if the passed MenuItem requires any roles and if it does, are they included in the user's role list. */
    private _hasAccess(menu: MenuItem, userRoles: string[]): boolean {
        return !menu.roles || menu.roles.some((requiredRole) => userRoles.includes(requiredRole));
    }

    /* Determine the currently active root menu item as well as the currently active submenu */
    private _getActiveMenu(activeRoute: string, menuItems: MenuItem[]): ActiveMenu {
        let activeMenu: ActiveMenu;
        if (activeRoute && menuItems) {
            const activeLeaf = this._getLeavesAndRoots(menuItems, 'subMenus') //
                // find the leaf menuItem matching the current url
                .filter((menuItem) => activeRoute.startsWith(menuItem.path)) //
                // should be only one result
                .pop();
            activeMenu = { rootMenu: activeLeaf ? activeLeaf.root : undefined, subMenu: activeLeaf };
        }
        return activeMenu;
    }

    /* Breakdown a tree-like array and return an array containing only the leaves with references to their root item. */
    private _getLeavesAndRoots(items: any[], childProperty: string, root?: any) {
        let leaves = new Array<any>();
        for (const item of items) {
            if (Array.isArray(item[childProperty]) && item[childProperty].length) {
                // Current item is not a leaf
                // Recursively search child items until a leaf is found while retaining the root reference
                leaves = leaves.concat(this._getLeavesAndRoots(item[childProperty], childProperty, root ? root : item));
            } else {
                // Current item is a leaf
                if (!item.root) {
                    item.root = root ? root : item;
                }
                leaves = leaves.concat(item);
            }
        }
        return leaves;
    }
}
