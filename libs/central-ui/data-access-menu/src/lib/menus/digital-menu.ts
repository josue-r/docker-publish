import { MenuItem } from '../models/menu-item';

const digitalIcon = 'web';

const companyHoliday: MenuItem = {
    name: 'Holiday',
    path: '/digital/company-holiday',
    roles: ['ROLE_COMPANY_HOLIDAY_READ'],
    featureFlag: 'companyHoliday.search.enabled',
};

const offers: MenuItem = {
    name: 'Offers',
    path: '/digital/offers',
    roles: ['ROLE_DISCOUNT_OFFER_READ'],
    featureFlag: 'offers.search.enabled',
};

const offerContent: MenuItem = {
    name: 'Offer Content',
    path: '/digital/offer-content',
    roles: ['ROLE_DISCOUNT_OFFER_CONTENT_READ'],
    featureFlag: 'offerContent.search.enabled',
};

export const digital: MenuItem = {
    name: 'Digital',
    icon: digitalIcon,
    subMenus: [companyHoliday, offers, offerContent],
};
