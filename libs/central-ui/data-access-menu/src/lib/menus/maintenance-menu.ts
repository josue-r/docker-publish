import { MenuItem } from '../models/menu-item';

const maintenanceIcon = 'build';

const serviceCatalog: MenuItem = {
    name: 'Service Catalog',
    path: '/maintenance/service',
    roles: ['ROLE_SERVICE_READ'],
};

const serviceCategory: MenuItem = {
    name: 'Service Category',
    path: '/maintenance/service-category',
    roles: ['ROLE_SERVICE_CATEGORY_READ'],
};

const storeService: MenuItem = {
    name: 'Store Service',
    path: '/maintenance/store-service',
    roles: ['ROLE_STORE_SERVICE_READ'],
};

const companyService: MenuItem = {
    name: 'Company Service',
    path: '/maintenance/company-service',
    roles: ['ROLE_COMPANY_SERVICE_READ'],
};

const serviceAdd: MenuItem = {
    name: 'Add Service',
    path: '/maintenance/service/add',
    roles: ['ROLE_SERVICE_ADD'],
    searchableOnly: true,
};

const serviceCategoryAdd: MenuItem = {
    name: 'Add Service Category',
    path: '/maintenance/service-category/add',
    roles: ['ROLE_SERVICE_CATEGORY_ADD'],
    searchableOnly: true,
};

const companyServiceAdd: MenuItem = {
    name: 'Add Company Service',
    path: '/maintenance/company-service/add',
    roles: ['ROLE_COMPANY_SERVICE_ADD'],
    searchableOnly: true,
};

// const storeServiceAdd: MenuItem = {
//     name: 'Store Service Add', path: '/maintenance/store-service/add',
//     roles: ['ROLE_STORE_SERVICE_ADD'], searchableOnly: true
// };
// const storeServiceMassUpdate: MenuItem = {
//     name: 'Store Service Mass Update', path: '/maintenance/store-service/mass-update',
//     roles: ['ROLE_STORE_SERVICE_MASS_UPDATE'], searchableOnly: true
// };
const service: MenuItem = {
    name: 'Service',
    subMenus: [
        serviceCatalog,
        serviceCategory,
        companyService,
        storeService,
        serviceAdd,
        serviceCategoryAdd,
        companyServiceAdd,
        // storeServiceAdd,
        // storeServiceMassUpdate
    ],
};

const productCatalog: MenuItem = {
    name: 'Product Catalog',
    path: '/maintenance/product',
    roles: ['ROLE_PRODUCT_READ'],
};
const productAdd: MenuItem = {
    name: 'Add Product',
    path: '/maintenance/product/add',
    roles: ['ROLE_PRODUCT_ADD'],
    searchableOnly: true,
};
const productCategory: MenuItem = {
    name: 'Product Category',
    path: '/maintenance/product-category',
    roles: ['ROLE_PRODUCT_CATEGORY_READ'],
};
const productCategoryAdd: MenuItem = {
    name: 'Add Product Category',
    path: '/maintenance/product-category/add',
    roles: ['ROLE_PRODUCT_CATEGORY_ADD'],
    searchableOnly: true,
};
const companyProduct: MenuItem = {
    name: 'Company Product',
    path: '/maintenance/company-product',
    roles: ['ROLE_COMPANY_PRODUCT_READ'],
};
const companyProductAdd: MenuItem = {
    name: 'Add Company Product',
    path: '/maintenance/company-product/add',
    roles: ['ROLE_COMPANY_PRODUCT_ADD'],
    searchableOnly: true,
};
const storeProduct: MenuItem = {
    name: 'Store Product',
    path: '/maintenance/store-product',
    roles: ['ROLE_STORE_PRODUCT_READ'],
};
const storeProductAdd: MenuItem = {
    name: 'Add Store Product',
    path: '/maintenance/store-product/add',
    roles: ['ROLE_STORE_PRODUCT_ADD'],
    searchableOnly: true,
};
// const storeProductMassUpdate: MenuItem = {
//     name: 'Store Product Mass Update', path: '/maintenance/store-product/mass-update',
//     roles: ['ROLE_STORE_PRODUCT_MASS_UPDATE'], searchableOnly: true
// };
const product: MenuItem = {
    name: 'Product',
    subMenus: [
        productCatalog,
        productAdd,
        productCategory,
        productCategoryAdd,
        companyProduct,
        companyProductAdd,
        storeProduct,
        storeProductAdd,
        // storeProductMassUpdate
    ],
};

const tsb: MenuItem = {
    name: 'TSB',
    path: '/maintenance/tsb',
    roles: ['ROLE_TSB_READ'],
};

const tsbAdd: MenuItem = {
    name: 'Add TSB',
    path: '/maintenance/tsb/add',
    roles: ['ROLE_TSB_ADD'],
    searchableOnly: true,
};

const technicalAlerts: MenuItem = {
    name: 'Alerts',
    path: '/maintenance/technical-alert',
    roles: ['ROLE_TECHNICAL_ALERT_READ'],
};

const technicalAlertsAdd: MenuItem = {
    name: 'Add Alert',
    path: '/maintenance/alerts/add',
    roles: ['ROLE_TECHNICAL_ALERT_ADD'],
    searchableOnly: true,
};

const technical: MenuItem = {
    name: 'Technical',
    subMenus: [tsb, tsbAdd, technicalAlerts, technicalAlertsAdd],
};

const discountSearch: MenuItem = {
    name: 'National/Local Discount',
    path: '/maintenance/discount',
    roles: ['ROLE_NATIONAL_DISCOUNT_READ', 'ROLE_LOCAL_DISCOUNT_READ'],
    featureFlag: 'discount.search.enabled',
};

const discount: MenuItem = {
    name: 'Discount',
    subMenus: [discountSearch],
};

export const maintenance: MenuItem = {
    name: 'Maintenance',
    icon: maintenanceIcon,
    subMenus: [product, service, technical, discount],
};
