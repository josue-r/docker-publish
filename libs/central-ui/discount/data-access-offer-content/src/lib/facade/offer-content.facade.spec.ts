import { QuerySearch, SearchLine, QuerySort, QueryPage } from '@vioc-angular/shared/common-api-models';
import { Column, Comparators } from '@vioc-angular/shared/util-column';
import { OfferContentApi } from '../api/offer-content.api';
import { OfferContent } from '../model/offer-content.model';
import { OfferContentFacade } from './offer-content.facade';

describe('OfferContentFacade', () => {
    let api: OfferContentApi;
    let facade: OfferContentFacade;

    beforeEach(() => {
        facade = new OfferContentFacade('//gateway', null);
        api = facade['api'];
    });

    describe('findActive', () => {
        it('should delegate to the API', () => {
            jest.spyOn(api, 'findActive').mockImplementation();
            facade.findActive();
            expect(api.findActive).toHaveBeenCalled();
        });
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

    describe('findByName', () => {
        it('should delegate to the API', async () => {
            api.findByName = jest.fn();
            const testName = 'NAME';
            facade.findByName(testName);
            expect(api.findByName).toHaveBeenLastCalledWith(testName);
        });
    });

    describe('save', () => {
        it('should delegate to the API', () => {
            api.save = jest.fn();
            facade.save(new OfferContent());
            expect(api.save).toHaveBeenCalled();
        });
    });
});
