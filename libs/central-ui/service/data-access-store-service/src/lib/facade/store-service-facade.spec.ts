import { QueryPage, QuerySearch, QuerySort, SearchLine } from '@vioc-angular/shared/common-api-models';
import { Described } from '@vioc-angular/shared/common-functionality';
import { EntityPatch, ResponseEntity } from '@vioc-angular/shared/util-api';
import { Column, Comparators } from '@vioc-angular/shared/util-column';
import { EMPTY, of } from 'rxjs';
import { StoreServiceApi } from '../api/store-service-api';
import { StoreServiceMassAdd } from '../model/store-service-mass-add.model';
import { StoreServiceMassUpdate } from '../model/store-service-mass-update.model';
import { StoreService } from '../model/store-service.model';
import { StoreServiceFacade } from './store-service-facade';

describe('StoreServiceFacade', () => {
    let api: StoreServiceApi;
    let facade: StoreServiceFacade;

    beforeEach(() => {
        facade = new StoreServiceFacade(null, null);
        api = facade['api'];
    });

    describe('findByStoreAndService', () => {
        it('should just delegate to API', () => {
            jest.spyOn(api, 'findByStoreAndService').mockImplementation();

            facade.findByStoreAndService('FOO', 'BAR');

            // verify that it delegated to api;
            expect(api.findByStoreAndService).toBeCalledWith('FOO', 'BAR');
        });
    });

    describe('save', () => {
        it('should just delegate to API', () => {
            jest.spyOn(api, 'save').mockImplementation();
            const storeService: StoreService = { id: { storeId: 1, serviceId: 2 } };

            facade.save(storeService);

            // verify that it delegated to api;
            expect(api.save).toBeCalledWith(storeService, ['v1/store-services']);
        });

        it.each`
            priceOverridable | min     | max     | priceOverrideMinMaxOverrideable
            ${true}          | ${1.1}  | ${2.2}  | ${true}
            ${false}         | ${null} | ${null} | ${false}
            ${true}          | ${98.1} | ${99.2} | ${false}
        `(
            'should clear unnecessary min/max override fields if not overridable',
            ({ priceOverridable, min, max, priceOverrideMinMaxOverrideable }) => {
                jest.spyOn(api, 'save').mockImplementation((ss) => {
                    expect(ss.priceOverridable).toEqual(priceOverridable);
                    expect(ss.priceOverrideMin).toEqual(min);
                    expect(ss.priceOverrideMax).toEqual(max);
                    expect(ss.priceOverrideMinMaxOverrideable).toEqual(priceOverrideMinMaxOverrideable);
                    return EMPTY;
                });

                facade.save({
                    priceOverridable,
                    priceOverrideMin: min,
                    priceOverrideMax: max,
                    priceOverrideMinMaxOverrideable,
                });

                expect.assertions(4);
            }
        );
    });

    describe('search', () => {
        it('should just delegate to API', () => {
            jest.spyOn(api, 'query').mockImplementation();

            const column = Column.of({ name: 'Test', apiFieldPath: 'test', type: 'string' });
            const querySearch: QuerySearch = {
                queryRestrictions: [new SearchLine(column, Comparators.notBlank).toQueryRestriction()],
                sort: new QuerySort(column),
                page: new QueryPage(0, 20),
            };

            facade.search(querySearch);

            // verify that it delegated to api;
            expect(api.query).toBeCalledWith(querySearch, ['v1/store-services/search']);
        });
    });

    describe('entityPatch', () => {
        it('should just delegate to API', () => {
            jest.spyOn(api, 'entityPatch').mockImplementation();

            const patch: EntityPatch<{ storeId: number; serviceId: number }> = {
                id: { storeId: 1, serviceId: 2 },
                fields: ['active'],
                updateValues: { active: true },
            };

            facade.entityPatch([patch]);

            // verify that it delegated to api;
            expect(api.entityPatch).toBeCalledWith(['v1/store-services/patch'], patch);
        });
    });

    describe('activate', () => {
        it('should just delegate to API', () => {
            jest.spyOn(api, 'activate').mockImplementation();

            const id12 = { storeId: 1, serviceId: 2 };
            const id34 = { storeId: 3, serviceId: 4 };

            facade.activate([id12, id34]);

            // verify that it delegated to api;
            expect(api.activate).toBeCalledWith([id12, id34], ['v1/store-services/activate']);
        });
    });

    describe('deactivate', () => {
        it('should just delegate to API', () => {
            jest.spyOn(api, 'deactivate').mockImplementation();

            const id12 = { storeId: 1, serviceId: 2 };
            const id34 = { storeId: 3, serviceId: 4 };

            facade.deactivate([id12, id34]);

            // verify that it delegated to api;
            expect(api.deactivate).toBeCalledWith([id12, id34], ['v1/store-services/deactivate']);
        });
    });

    describe('previewMassAdd', () => {
        it('should just delegate to API', () => {
            jest.spyOn(api, 'previewMassAdd').mockImplementation();

            const storeIds = [1, 2];
            const serviceId = 4;

            facade.previewMassAdd(storeIds, serviceId);

            // verify that it delegated to api;
            expect(api.previewMassAdd).toBeCalledWith(storeIds, serviceId);
        });
    });

    describe('add', () => {
        it('should just delegate to API', () => {
            jest.spyOn(api, 'add').mockImplementation();

            const massAdd: StoreServiceMassAdd = {
                stores: [{ id: 1, code: 'S1', description: 'Store 1' }],
                service: { id: 1, code: 'Srv1', description: 'Service 1' },
                storeService: new StoreService(),
            };

            facade.add(massAdd);

            // verify that it delegated to api;
            expect(api.add).toBeCalledWith(massAdd);
        });
    });

    describe('datasync', () => {
        it('should just delegate to API', () => {
            jest.spyOn(api, 'dataSync').mockImplementation();
            const ids = [
                { storeId: 1, serviceId: 11 },
                { storeId: 2, serviceId: 22 },
                { storeId: 2, serviceId: 33 },
            ];
            facade.dataSync(ids);
            // verify that it delegated to api;
            expect(api.dataSync).toBeCalledWith(ids, ['v1/store-services/datasync']);
        });
    });

    describe('searchAssignedServicesByStore', () => {
        it('should just delegate to the API', async () => {
            const responseEntity: ResponseEntity<Described> = {
                content: [{ id: 1, code: 'SERV', description: 'service' }],
                totalElements: 1,
            };
            jest.spyOn(api, 'searchAssignedServicesByStore').mockReturnValue(of(responseEntity));
            const stores = [
                { id: 1, code: 'STORE', description: 'store' },
                { id: 2, code: 'STORE2', description: 'store2' },
            ];
            const column: Column = Column.of({
                apiFieldPath: 'code',
                name: 'Service Code',
                type: 'string',
            });
            const querySearch: QuerySearch = {
                queryRestrictions: [new SearchLine(column, Comparators.startsWith, 's').toQueryRestriction()],
                page: new QueryPage(0, 10),
                sort: new QuerySort(column),
            };
            expect(await facade.searchAssignedServicesByStore(querySearch, stores).toPromise()).toEqual(responseEntity);
            expect(api.searchAssignedServicesByStore).toHaveBeenCalledWith(querySearch, stores);
        });
    });

    describe('massUpdate', () => {
        it('should just delegate to API', async () => {
            jest.spyOn(api, 'massUpdate').mockReturnValue(of(1));

            const massUpdate: StoreServiceMassUpdate = {
                stores: [{ id: 1, code: 'S1', description: 'Store 1' }],
                services: [{ id: 1, code: 'Srv1', description: 'Service 1' }],
                storeService: { ...new StoreService(), laborAmount: 1.23 },
                updateFields: ['laborAmount'],
            };

            expect(await facade.massUpdate(massUpdate).toPromise()).toEqual(1);
            expect(api.massUpdate).toBeCalledWith(massUpdate);
        });
    });
});
