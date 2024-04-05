import { QueryPage, QuerySearch, QuerySort, SearchLine } from '@vioc-angular/shared/common-api-models';
import { Column, Comparators } from '@vioc-angular/shared/util-column';
import { isUndefined } from 'lodash';
import { PhysicalInventoryCount } from '../model/physical-inventory-count.model';
import { PhysicalInventory } from '../model/physical-inventory.model';
import { PhysicalInventoryApi } from './../api/physical-inventory.api';
import { PhysicalInventoryFacade } from './physical-inventory.facade';

describe('PhysicalInventoryFacade', () => {
    let api: PhysicalInventoryApi;
    let facade: PhysicalInventoryFacade;

    beforeEach(() => {
        facade = new PhysicalInventoryFacade('//gateway', null);
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

    describe('findById', () => {
        it('should just delegate to API', () => {
            jest.spyOn(api, 'findById').mockImplementation();
            const id = '100';

            facade.findById(id);

            // verify that it delegated to api;
            expect(api.findById).toBeCalledWith(id);
        });
    });

    describe('createCount', () => {
        it('should just delegate to API', () => {
            jest.spyOn(api, 'createCount').mockImplementation();
            const storeCode = 'STORE';
            const frequencyCode = 'FREQ';

            facade.createCount(storeCode, frequencyCode);

            // verify that it delegated to api;
            expect(api.createCount).toBeCalledWith(storeCode, frequencyCode);
        });
    });

    describe('updateCount', () => {
        it('should just delegate to API', () => {
            jest.spyOn(api, 'updateCount').mockImplementation();
            const pi = { ...new PhysicalInventory(), id: 100, counts: [new PhysicalInventoryCount()] };

            facade.updateCount(pi);

            // verify that it delegated to api;
            expect(api.updateCount).toBeCalledWith(pi);
        });
    });

    describe('closeCount', () => {
        it('should just delegate to API', () => {
            jest.spyOn(api, 'closeCount').mockImplementation();
            const pi = { ...new PhysicalInventory(), id: 100, counts: [new PhysicalInventoryCount()] };

            facade.closeCount(pi);

            // verify that it delegated to api;
            expect(api.closeCount).toBeCalledWith(pi);
        });
    });

    describe('stopCount', () => {
        it('should just delegate to API', () => {
            jest.spyOn(api, 'stopCount').mockImplementation();
            const id = 1000;
            const storeCode = '000000';

            facade.stopCount(id, storeCode);

            // verify that it delegated to api;
            expect(api.stopCount).toBeCalledWith(id, storeCode);
        });
    });

    describe('searchCountProducts', () => {
        it('should just delegate to API', () => {
            jest.spyOn(api, 'searchCountProducts').mockImplementation();
            const id = 100;
            const categoryCode = 'CAT';

            facade.searchCountProducts(id, categoryCode);

            // verify that it delegated to api;
            expect(api.searchCountProducts).toBeCalledWith(id, categoryCode);
        });

        describe.each`
            categoryCode | isCountingByLocation
            ${['CAT']}   | ${true}
            ${['CAT']}   | ${false}
            ${['CAT']}   | ${undefined}
            ${undefined} | ${true}
            ${undefined} | ${false}
            ${undefined} | ${undefined}
        `('searchCountProductsByCategories', ({ categoryCode, isCountingByLocation }) => {
            it(`should just delegate to API with categoryCode=${categoryCode}, isCountingByLocation=${isCountingByLocation}`, () => {
                jest.spyOn(api, 'searchCountProductsByCategories').mockImplementation();
                const id = 100;
                // if isCountingByLocation is undefined, it will be defaulted to false
                const countByLocation = isUndefined(isCountingByLocation) ? false : isCountingByLocation;

                facade.searchCountProductsByCategories(id, categoryCode, isCountingByLocation);
                // verify that it delegated to api
                expect(api.searchCountProductsByCategories).toBeCalledWith(id, categoryCode, countByLocation);
            });
        });

        it('should just delegate to API without category', () => {
            jest.spyOn(api, 'searchCountProducts').mockImplementation();
            const id = 100;

            facade.searchCountProducts(id);

            // verify that it delegated to api;
            expect(api.searchCountProducts).toBeCalledWith(id, undefined);
        });

        describe('calculateVolume', () => {
            it('should just delegate to API', () => {
                jest.spyOn(api, 'calculateVolume').mockImplementation();
                const height = '100';
                const prodId = 'PROD001';
                const storeCode = 'STORE001';
                facade.calculateVolume(prodId, storeCode, height);

                // verify that it delegated to api;
                expect(api.calculateVolume).toBeCalledWith(prodId, storeCode, height);
            });
        });
    });

    describe('getPDF', () => {
        it('should just delegate to API', () => {
            jest.spyOn(api, 'getPDF').mockImplementation();
            const storeCode = '010002';
            const id = 406721;
            const categoryCodes = ['VPCAT', 'OIL'];

            facade.getPDF(storeCode, id, categoryCodes);

            // verify that it delegated to api;
            expect(api.getPDF).toBeCalledWith(storeCode, id, categoryCodes);
        });
    });

    describe('updateCountByLocation', () => {
        it('should just delegate to API', () => {
            jest.spyOn(api, 'updateCountByLocation').mockImplementation();
            const physicalInventoryId = 1;
            const count = { ...new PhysicalInventoryCount(), countsByLocation: [{ count: 10, location: 'BAY' }] };

            facade.updateCountByLocation(physicalInventoryId, count);

            // verify that it delegated to api;
            expect(api.updateCountByLocation).toBeCalledWith(physicalInventoryId, count);
        });
    });
});
