import { MenuItem } from './menu-item';

/* An item to contain the active root menu item and active leaf menu item. */
export interface ActiveMenu {
    /** Active top level menu item. Given 'Maintenance -> Product -> Store Product', it would be 'Maintenance'. */
    rootMenu: MenuItem;
    /** Active leaf menu item. Given 'Maintenance -> Product -> Store Product', it would be 'Store Product'. */
    subMenu: MenuItem;
}
