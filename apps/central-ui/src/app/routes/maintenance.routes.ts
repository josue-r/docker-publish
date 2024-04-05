import { Routes } from '@angular/router';

export const maintenanceRoutes: Routes = [
    {
        path: 'product',
        loadChildren: () =>
            import('@vioc-angular/central-ui/product/feature-product-catalog').then(
                (m) => m.FeatureProductCatalogModule
            ),
    },
    {
        path: 'product-category',
        loadChildren: () =>
            import('@vioc-angular/central-ui/product/feature-product-category').then(
                (m) => m.FeatureProductCategoryModule
            ),
    },
    {
        path: 'company-product',
        loadChildren: () =>
            import('@vioc-angular/central-ui/product/feature-company-product').then(
                (m) => m.FeatureCompanyProductModule
            ),
    },
    {
        path: 'company-service',
        loadChildren: () =>
            import('@vioc-angular/central-ui/service/feature-company-service').then(
                (m) => m.FeatureCompanyServiceModule
            ),
    },
    {
        path: 'store-product',
        loadChildren: () =>
            import('@vioc-angular/central-ui/product/feature-store-product').then((m) => m.FeatureStoreProductModule),
    },
    {
        path: 'service',
        loadChildren: () =>
            import('@vioc-angular/central-ui/service/feature-service-catalog').then(
                (m) => m.FeatureServiceCatalogModule
            ),
    },
    {
        path: 'service-category',
        loadChildren: () =>
            import('@vioc-angular/central-ui/service/feature-service-category').then(
                (m) => m.FeatureServiceCategoryModule
            ),
    },
    {
        path: 'store-service',
        loadChildren: () =>
            import('@vioc-angular/central-ui/service/feature-store-service').then((m) => m.FeatureStoreServiceModule),
    },
    {
        path: 'service-category',
        loadChildren: () =>
            import('@vioc-angular/central-ui/service/feature-service-category').then(
                (m) => m.FeatureServiceCategoryModule
            ),
    },
    {
        path: 'tsb',
        loadChildren: () => import('@vioc-angular/central-ui/technical/feature-tsb').then((m) => m.FeatureTsbModule),
    },
    {
        path: 'technical-alert',
        loadChildren: () =>
            import('@vioc-angular/central-ui/technical/feature-technical-alert').then(
                (m) => m.FeatureTechnicalAlertModule
            ),
    },
    {
        path: 'discount',
        loadChildren: () =>
            import('@vioc-angular/central-ui/discount/feature-discounts').then((m) => m.FeatureDiscountsModule),
    },
    {
        path: '**',
        redirectTo: '/error/page-not-found',
    },
];
