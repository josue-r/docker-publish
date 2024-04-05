import { MenuItem } from './menu-item';

export const menuItem1: MenuItem = { name: 'Test1', path: 'root1/test1' };
export const menuItem3: MenuItem = { name: 'Test3', path: 'root1/test2/test3' };
export const menuItem2: MenuItem = { name: 'Test2', subMenus: [menuItem3] };
export const rootMenuItem1: MenuItem = { name: 'Root1', icon: 'icon1', subMenus: [menuItem1, menuItem2] };
export const rootMenuItem2: MenuItem = { name: 'Root2', icon: 'icon2', path: 'root2' };
export const searchableOnlyMenuItem: MenuItem = {
    name: 'SearchableOnly',
    path: 'searchableOnly',
    searchableOnly: true,
};
export const securedMenuItem1: MenuItem = { name: 'Secured1', path: 'secured-root/secured1', roles: ['TEST_SUB_ROLE'] };
export const securedMenuItem3: MenuItem = {
    name: 'Secured3',
    path: 'secured-root/secured2/secured3',
    roles: ['TEST_SUB_ROLE2'],
};
export const securedMenuItem4: MenuItem = {
    name: 'Secured4',
    path: 'secured-root/secured4',
    roles: ['TEST_OR_ROLE1', 'TEST_OR_ROLE2'],
};
export const securedMenuItem2: MenuItem = { name: 'Secured2', subMenus: [securedMenuItem3] };
export const securedRootMenuItem: MenuItem = {
    name: 'Secured Root',
    icon: 'icon3',
    subMenus: [securedMenuItem1, securedMenuItem2, securedMenuItem4],
    roles: ['TEST_ROLE'],
};
export const featureFlaggedMenuItem: MenuItem = { name: 'FeatureFlagged', featureFlag: 'test', path: 'featureflag' };

/**
 * mockMenus structure:
 *  Root1:  ->  Test1
 *          ->  Test2:  ->  Test3
 *  Root2
 */
export const mockMenus: MenuItem[] = [rootMenuItem1, rootMenuItem2, searchableOnlyMenuItem];
