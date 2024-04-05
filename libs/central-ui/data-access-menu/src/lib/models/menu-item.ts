/* An item containing navigation information for the UI to use. */
export interface MenuItem {
    /* The display name for the navigable item. */
    name: string;
    /* The router path. Not required if the item is a container for sub menus. */
    path?: string;
    /* The icon to be used (currently using https://material.io/icons/). Only required for the top level navigation items.
    TODO - provide implementation for custom icons */
    icon?: string;
    /* The sub menus for the menu item. Not required if the item has a navigable path. */
    subMenus?: Array<MenuItem>;
    /* The array of security roles */
    roles?: string[];
    /* Indicates the menu should only show by being searched for and not by regular navigation */
    searchableOnly?: boolean;
    /* Feature flag used to show or hide this menu item */
    featureFlag?: string;
}
