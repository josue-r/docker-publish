import { Injectable } from '@angular/core';
import { cloneDeep } from 'lodash';
import { BehaviorSubject, Observable } from 'rxjs';
import { config } from './menus/config-menu';
import { customer } from './menus/customer-menu';
import { digital } from './menus/digital-menu';
import { inventory } from './menus/inventory-menu';
import { maintenance } from './menus/maintenance-menu';
import { organization } from './menus/organization-menu';
import { MenuItem } from './models/menu-item';
@Injectable({ providedIn: 'root' })
export class MenuState {
    /**
     * List of all possible MenuItems in the app (top level only)
     *
     * Note: Each menu item that is meant to display in the sidenav should only have children going up to 3 levels
     * (Ex: Maintenance -> Product -> Store Product). See SubnavComponent.
     */
    private readonly _allMenuItems: MenuItem[] = [maintenance, organization, digital, config, inventory, customer];

    /** List of currently available MenuItems */
    private readonly _menu$ = new BehaviorSubject<MenuItem[]>([]);

    get menus(): Observable<MenuItem[]> {
        return this._menu$.asObservable();
    }

    get allMenuItems(): MenuItem[] {
        // Returning a clone to ensure the 'master' MenuItem list doesn't get modified
        return cloneDeep(this._allMenuItems);
    }

    updateMenu(menus: MenuItem[]): void {
        this._menu$.next(menus);
    }
}
