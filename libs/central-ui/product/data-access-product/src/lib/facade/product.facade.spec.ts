import { QueryPage, QueryRestriction, QuerySearch, QuerySort } from '@vioc-angular/shared/common-api-models';
import { Described } from '@vioc-angular/shared/common-functionality';
import { Column } from '@vioc-angular/shared/util-column';
import { ProductApi } from '../api/product-api';
import { Product } from '../models/product.model';
import { ProductFacade } from './product.facade';

describe('ProductFacade', () => {
    const facade = new ProductFacade(null, null);
    const api: ProductApi = facade['api'];

    describe('save', () => {
        it('should delegate to the API', () => {
            jest.spyOn(api, 'save').mockImplementation();
            const entity = { id: 123 } as Product;
            facade.save(entity);
            expect(api.save).toBeCalledWith(entity);
        });
    });

    describe('findByCode', () => {
        it('should delegate to the API', () => {
            jest.spyOn(api, 'findByCode').mockImplementation();
            const entityCode = 'abc';
            facade.findByCode(entityCode);
            expect(api.findByCode).toBeCalledWith(entityCode);
        });
    });

    describe('validateRelatedProduct', () => {
        it('should delegate to the API', () => {
            jest.spyOn(api, 'validateRelatedProduct').mockImplementation();
            const productCode = 'abc';
            const relatedProductCode = 'abcd';
            facade.validateRelatedProduct(relatedProductCode, productCode);
            expect(api.validateRelatedProduct).toBeCalledWith(relatedProductCode, productCode);
        });
    });

    describe('isProductAssigned', () => {
        it('should delegate to the API', () => {
            jest.spyOn(api, 'isProductAssigned').mockImplementation();
            const product = { ...new Product(), code: 'Test' };
            facade.isProductAssigned(product);
            expect(api.isProductAssigned).toBeCalledWith(product);
        });
    });

    describe('activate', () => {
        it('should delegate to the API', () => {
            jest.spyOn(api, 'activate').mockImplementation();
            const ids = [123];
            facade.activate(ids);
            expect(api.activate).toBeCalledWith(ids);
        });
    });

    describe('deactivate', () => {
        it('should delegate to the API', () => {
            jest.spyOn(api, 'deactivate').mockImplementation();
            const ids = [123];
            facade.deactivate(ids);
            expect(api.deactivate).toBeCalledWith(ids);
        });
    });

    describe('findUsage', () => {
        it('should delegate to the API', () => {
            jest.spyOn(api, 'findUsage').mockImplementation();
            const ids = [123];
            facade.findUsage(ids);
            expect(api.findUsage).toBeCalledWith(ids);
        });
    });

    describe('search', () => {
        it('should delegate to the API', () => {
            jest.spyOn(api, 'query').mockImplementation();
            const column = Column.of({ name: 'c1', apiFieldPath: '', type: 'string', displayedByDefault: false });
            const querySearch = {
                queryRestrictions: [],
                page: new QueryPage(0, 1),
                sort: new QuerySort(column),
            } as QuerySearch;
            facade.search(querySearch);
            expect(api.query).toBeCalledWith(querySearch);
        });
    });

    describe('entityPatch', () => {
        it('should delegate to the API', () => {
            jest.spyOn(api, 'entityPatch').mockImplementation();
            const patch = { id: 1, updateValues: { ...new Product(), code: 'Test' }, fields: ['code'] };
            facade.entityPatch([patch]);
            expect(api.entityPatch).toBeCalledWith(['patch'], patch);
        });
    });

    describe('dataSync', () => {
        it('should delegate to the API', () => {
            jest.spyOn(api, 'dataSync').mockImplementation();
            const ids = [123];
            facade.dataSync(ids);
            expect(api.dataSync).toBeCalledWith(ids);
        });
    });

    describe('findUnassignedProductsForCompany', () => {
        it('should delegate to the API', () => {
            jest.spyOn(api, 'findUnassignedProductsForCompany').mockImplementation();
            const company = { id: 1, code: 'comp1' } as Described;
            const querySearch: QuerySearch = {
                additionalParams: { foo: 'bar' },
                page: new QueryPage(3, 10),
                queryRestrictions: [
                    { fieldPath: 'foo', dataType: 'type', operator: '<', values: [5] } as QueryRestriction,
                ],
                sort: new QuerySort(Column.of({ name: 'col', apiFieldPath: 'id', type: 'integer' })),
            };
            facade.findUnassignedProductsForCompany(company, querySearch);
            expect(api.findUnassignedProductsForCompany).toBeCalledWith(company, querySearch);
        });
    });
});
