import { MenuItem } from '../models/menu-item';

const inventoryIcon = 'shopping_cart';

const receiptOfMaterial: MenuItem = {
    name: 'Receive Product',
    path: '/inventory/receipt-of-material',
    roles: ['ROLE_RECEIPT_OF_MATERIAL_READ'],
};
const inventoryOrder: MenuItem = {
    name: 'Order Product',
    path: '/inventory/inventory-order',
    roles: ['ROLE_INVENTORY_ORDER_READ'],
};
const addInventoryOrder: MenuItem = {
    name: 'Add Order',
    path: '/inventory/inventory-order/add',
    roles: ['ROLE_INVENTORY_ORDER_ADD'],
    searchableOnly: true,
};
const inventoryTransfer: MenuItem = {
    name: 'Transfer Product',
    path: '/inventory/inventory-transfer',
    roles: ['ROLE_INVENTORY_TRANSFER_READ'],
};
const addInventoryTransfer: MenuItem = {
    name: 'Add Transfer',
    path: '/inventory/inventory-transfer/add',
    roles: ['ROLE_INVENTORY_TRANSFER_ADD'],
    searchableOnly: true,
};
const addReceiptOfMaterial: MenuItem = {
    name: 'Add Receipt',
    path: '/inventory/receipt-of-material/add',
    roles: ['ROLE_RECEIPT_OF_MATERIAL_ADD'],
    searchableOnly: true,
};

const physicalInventory: MenuItem = {
    name: 'Product Count',
    path: '/inventory/product-count',
    roles: ['ROLE_PHYSICAL_INVENTORY_READ'],
    featureFlag: 'physicalInventory.search.enabled',
};
const addPhysicalInventory: MenuItem = {
    name: 'Add Product Count',
    path: '/inventory/product-count/add',
    roles: ['ROLE_PHYSICAL_INVENTORY_ADD'],
    searchableOnly: true,
    featureFlag: 'physicalInventory.search.add',
};

const nonInventoryOrder: MenuItem = {
    name: 'Non-Inventory Order',
    path: '/inventory/non-inventory-order',
    roles: ['ROLE_NON_INVENTORY_ORDER_READ'],
    featureFlag: 'nonInventoryOrder.search.enabled',
};

const addNonInventoryOrder: MenuItem = {
    name: 'Add Non-Inventory Order',
    path: '/inventory/non-inventory-order/add',
    roles: ['ROLE_NON_INVENTORY_ORDER_ADD'],
    searchableOnly: true,
};

const inventoryStatus: MenuItem = {
    name: 'Product Status',
    path: '/inventory/inventory-status/search',
    roles: ['ROLE_INVENTORY_STATUS_READ'],
    featureFlag: 'inventoryStatus.search.enabled',
};

const productAdjustment: MenuItem = {
    name: 'Product Adjustment',
    path: '/inventory/product-adjustment',
    roles: ['ROLE_PRODUCT_ADJUSTMENT_READ'],
    featureFlag: 'productAdjustment.search.enabled',
};

const addProductAdjustment: MenuItem = {
    name: 'Add Product Adjustment',
    path: '/inventory/product-adjustment/add',
    roles: ['ROLE_PRODUCT_ADJUSTMENT_ADD'],
    searchableOnly: true,
    featureFlag: 'productAdjustment.search.add',
};

const defectiveProduct: MenuItem = {
    name: 'Defective Product',
    path: '/inventory/defective-product',
    roles: ['ROLE_DEFECTIVE_PRODUCT_READ'],
    featureFlag: 'defectiveProduct.search.enabled',
};

const addDefectiveProduct: MenuItem = {
    name: 'Add Defective Product',
    path: '/inventory/defective-product/add',
    roles: ['ROLE_DEFECTIVE_PRODUCT_ADD'],
    searchableOnly: true,
};

export const inventory: MenuItem = {
    name: 'Inventory',
    icon: inventoryIcon,
    subMenus: [
        inventoryOrder,
        addInventoryOrder,
        receiptOfMaterial,
        addReceiptOfMaterial,
        inventoryTransfer,
        addInventoryTransfer,
        physicalInventory,
        addPhysicalInventory,
        productAdjustment,
        defectiveProduct,
        nonInventoryOrder,
        addNonInventoryOrder,
        inventoryStatus,
        addDefectiveProduct,
        addProductAdjustment,
    ],
};
