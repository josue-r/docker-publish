export interface DescribedModel {
    id: string | number;
    code: string;
    description: string;
    version: number;
}

export interface ProductModel {
    id: string;
    productCategory: DescribedModel;
    product: DescribedModel;
    quantity: string;
    uom: DescribedModel;
}

export class WorkingBayServices {
    id: number = null;
    rootServiceCategory: DescribedModel = null;
    service: DescribedModel = null;
    products: ProductModel[] = [];
}
