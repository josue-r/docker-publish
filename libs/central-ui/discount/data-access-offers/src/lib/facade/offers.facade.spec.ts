import { QueryPage, QuerySearch, QuerySort, SearchLine } from '@vioc-angular/shared/common-api-models';
import { Column, Comparators } from '@vioc-angular/shared/util-column';
import { OfferApi } from '../api/offers.api';
import { Offer, StoreDiscount } from '../model/offers.model';
import { OfferFacade } from './offers.facade';

describe('OfferFacade', () => {
    let api: OfferApi;
    let facade: OfferFacade;

    beforeEach(() => {
        facade = new OfferFacade('//gateway', null);
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
            expect(api.query).toBeCalledWith(querySearch, ['v2/discount-offers/search']);
        });
    });

    describe('findById', () => {
        it('should just delegate to API', () => {
            jest.spyOn(api, 'findById').mockImplementation();

            const id = '1';

            facade.findById(id);

            // verify that it delegated to api;
            expect(api.findById).toBeCalledWith(id);
        });
    });

    describe('save', () => {
        it('should just delegate to API', () => {
            jest.spyOn(api, 'save').mockImplementation();
            const offer = { ...new Offer(), id: '1', storeDiscounts: [new StoreDiscount()] };

            facade.save(offer);

            // verify that it delegated to api;
            expect(api.save).toBeCalledWith(offer, ['v1/discount-offers']);
        });
    });
});
