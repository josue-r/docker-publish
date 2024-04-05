import { MenuItem } from '../models/menu-item';

const configIcon = 'settings';

const commonCode: MenuItem = {
    name: 'Common Code',
    path: '/config/common-code',
    roles: ['ROLE_COMMON_CODE_READ'],
};

const commonCodeAdd: MenuItem = {
    name: 'Add Common Code',
    path: '/config/common-code/add',
    roles: ['ROLE_COMMON_CODE_ADD'],
    searchableOnly: true,
};

export const config: MenuItem = {
    name: 'Config',
    icon: configIcon,
    subMenus: [commonCode, commonCodeAdd],
};
