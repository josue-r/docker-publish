import { Routes } from '@angular/router';

export const inventoryRoutes: Routes = [
    {
        path: 'receipt-of-material',
        loadChildren: () =>
            import('@vioc-angular/central-ui/inventory/feature-receipt-of-material').then(
                (m) => m.FeatureReceiptOfMaterialModule
            ),
    },
    {
        path: 'inventory-order',
        loadChildren: () =>
            import('@vioc-angular/central-ui/inventory/feature-inventory-order').then(
                (m) => m.FeatureInventoryOrderModule
            ),
    },
    {
        path: 'inventory-transfer',
        loadChildren: () =>
            import('@vioc-angular/central-ui/inventory/feature-inventory-transfer').then(
                (m) => m.FeatureInventoryTransferModule
            ),
    },
    {
        path: 'inventory-status',
        loadChildren: () =>
            import('@vioc-angular/central-ui/inventory/feature-inventory-status').then(
                (m) => m.FeatureInventoryStatusModule
            ),
    },
    {
        path: 'product-count',
        loadChildren: () =>
            import('@vioc-angular/central-ui/inventory/feature-physical-inventory').then(
                (m) => m.FeaturePhysicalInventoryModule
            ),
    },
    {
        path: 'non-inventory-order',
        loadChildren: () =>
            import('@vioc-angular/central-ui/inventory/feature-non-inventory-order').then(
                (m) => m.FeatureNonInventoryOrderModule
            ),
    },
    {
        path: 'product-adjustment',
        loadChildren: () =>
            import('@vioc-angular/central-ui/inventory/feature-product-adjustment').then(
                (m) => m.FeatureProductAdjustmentModule
            ),
    },
    {
        path: 'defective-product',
        loadChildren: () =>
            import('@vioc-angular/central-ui/inventory/feature-defective-product').then(
                (m) => m.FeatureDefectiveProductModule
            ),
    },
    {
        path: '**',
        redirectTo: '/error/page-not-found',
    },
];
