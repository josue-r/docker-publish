import { MenuItem } from '../models/menu-item';

const customerIcon = 'person_search';

const invoice: MenuItem = {
    name: 'Invoice',
    path: '/customer/invoice',
    roles: ['ROLE_INVOICE_READ'],
    featureFlag: 'invoice.search.enabled',
};

export const customer: MenuItem = {
    name: 'Customer',
    icon: customerIcon,
    subMenus: [invoice],
};
