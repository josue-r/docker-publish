import { QueryPage, QuerySearch, QuerySort, SearchLine } from '@vioc-angular/shared/common-api-models';
import { Column, Comparators } from '@vioc-angular/shared/util-column';
import { ProductAdjustmentDetail } from '../model/product-adjustment-detail.model';
import { ProductAdjustment } from '../model/product-adjustment.model';
import { ProductAdjustmentApi } from './../api/product-adjustment.api';
import { ProductAdjustmentFacade } from './product-adjustment.facade';

describe('ProductAdjustmentFacade', () => {
    let api: ProductAdjustmentApi;
    let facade: ProductAdjustmentFacade;

    beforeEach(() => {
        facade = new ProductAdjustmentFacade('//gateway', null);
        api = facade['api'];
    });

    describe('search', () => {
        it('should just delegate to API', () => {
            jest.spyOn(api, 'query').mockImplementation();

            const column = Column.of({
                name: 'Test',
                type: 'string',
                apiFieldPath: 'test',
            });
            const querySearch: QuerySearch = {
                queryRestrictions: [new SearchLine(column, Comparators.notBlank).toQueryRestriction()],
                sort: new QuerySort(column),
                page: new QueryPage(0, 20),
            };

            facade.search(querySearch);

            // verify that it delegated to api;
            expect(api.query).toBeCalledWith(querySearch);
        });
    });

    describe('View', () => {
        it('should delegate to the API', () => {
            jest.spyOn(api, 'findByAdjustmentId').mockImplementation();
            facade.findByAdjustmentId(1);
            expect(api.findByAdjustmentId).toHaveBeenCalledWith(1);
        });
    });

    describe.each`
        sign
        ${'-'}
        ${'+'}
    `('finalize', ({ sign }) => {
        it(`should just delegate to API with a ${
            sign === '-' ? 'negative' : 'positive'
        } quantity when the sign is ${sign}`, () => {
            jest.spyOn(api, 'finalize').mockImplementation();

            const productAdjustment = new ProductAdjustment();
            let details = { ...new ProductAdjustmentDetail(), sign, quantity: 1 };
            productAdjustment.adjustmentProducts = [details];
            facade.finalize(productAdjustment);
            if (sign === '-') {
                details = { ...new ProductAdjustmentDetail(), sign, quantity: -1 };
            }

            // verify that it delegated to api;
            expect(api.finalize).toBeCalledWith(productAdjustment);
        });
    });
});
