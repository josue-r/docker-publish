import { MenuItem } from '../models/menu-item';

const organizationIcon = 'store';

const store: MenuItem = {
    name: 'Store',
    path: '/organization/store',
    roles: ['ROLE_STORE_READ'],
    featureFlag: 'store.search.enabled',
};

export const organization: MenuItem = {
    name: 'Organization',
    icon: organizationIcon,
    subMenus: [store],
};
