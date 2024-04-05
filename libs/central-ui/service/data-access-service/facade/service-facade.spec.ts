import { QueryPage, QuerySearch, QuerySort, SearchLine } from '@vioc-angular/shared/common-api-models';
import { Column, Comparators, Described } from '@vioc-angular/shared/util-column';
import { Service } from '../src';
import { ServiceApi } from './../api/service-api';
import { ServiceFacade } from './service-facade';

describe('ServiceFacade', () => {
    let api: ServiceApi;
    let facade: ServiceFacade;
    const companyStub = { id: undefined, desc: undefined, code: 'FOO' } as Described;

    beforeEach(() => {
        // facade = new ServiceFacade('//gateway',null)
        facade = new ServiceFacade(null, null);
        api = facade['api'];
    });

    describe('findUnassignedServicesForCompany', () => {
        it('should just delegate to API', () => {
            jest.spyOn(api, 'findUnassignedServicesForCompany').mockImplementation();

            const querySearch = { queryRestrictions: [], page: {}, sort: {} } as QuerySearch;

            facade.findUnassignedServicesForCompany(companyStub, querySearch);

            // verify that it delegated to api;
            expect(api.findUnassignedServicesForCompany).toBeCalledWith(companyStub, querySearch);
        });
    });

    describe('findAssignableServicesForStores', () => {
        it('should just delegate to API', () => {
            jest.spyOn(api, 'findAssignableServicesForStores').mockImplementation();

            const stores = [
                { id: undefined, desc: undefined, code: 'FOO', company: companyStub },
                { id: undefined, desc: undefined, code: 'BAR', company: companyStub },
            ];

            facade.findAssignableServicesForStores(stores);

            // verify that it delegated to api;
            expect(api.findAssignableServicesForStores).toBeCalledWith(stores);
        });
    });

    describe('entityPatch', () => {
        it('should delegate to the API', () => {
            jest.spyOn(api, 'entityPatch').mockImplementation();
            const patch = { id: 1, updateValues: { ...new Service(), code: 'Test' }, fields: ['code'] };
            facade.entityPatch([patch]);
            expect(api.entityPatch).toBeCalledWith(['patch'], patch);
        });
    });

    describe('dataSync', () => {
        it('should just delegate to API', () => {
            jest.spyOn(api, 'activate').mockImplementation();

            facade.activate([1, 2]);

            // verify that it delegated to api;
            expect(api.activate).toBeCalledWith([1, 2]);
        });
    });

    describe('checkIfActiveAtStoreOrCompany', () => {
        it('should just delegate to API', () => {
            jest.spyOn(api, 'checkIfActiveAtStoreOrCompany').mockImplementation();

            const service: Service = { id: 1, code: 'TEST' };

            facade.checkIfActiveAtStoreOrCompany(service);

            // verify that it delegated to api;
            expect(api.checkIfActiveAtStoreOrCompany).toBeCalledWith(service);
        });

        it('should not delegate to API when service is undefined', () => {
            jest.spyOn(api, 'checkIfActiveAtStoreOrCompany').mockImplementation();

            const service: Service = { code: 'TEST' };

            facade.checkIfActiveAtStoreOrCompany(service);

            // verify that it delegated to api;
            expect(api.checkIfActiveAtStoreOrCompany).not.toHaveBeenCalled();
        });
    });

    describe('findActive', () => {
        it('should just delegate to API', () => {
            jest.spyOn(api, 'findActive').mockImplementation();

            facade.findActive();

            // verify that it delegated to api;
            expect(api.findActive).toBeCalledWith();
        });

        it('should just delegate to API with optional parameter', () => {
            jest.spyOn(api, 'findActive').mockImplementation();
            const categoryCode = 'CATCODE';

            facade.findActiveByCategory(categoryCode);

            // verify that it delegated to api;
            expect(api.findActive).toBeCalledWith({ categoryCode });
        });
    });

    describe('findByCode', () => {
        it('should just delegate to API', () => {
            jest.spyOn(api, 'findByCode').mockImplementation();

            facade.findByCode('code');

            // verify that it delegated to api;
            expect(api.findByCode).toBeCalledWith('code');
        });
    });

    describe('activate', () => {
        it('should just delegate to API', () => {
            jest.spyOn(api, 'activate').mockImplementation();

            facade.activate([1, 2]);

            // verify that it delegated to api;
            expect(api.activate).toBeCalledWith([1, 2]);
        });
    });
    describe('deactivate', () => {
        it('should just delegate to API', () => {
            jest.spyOn(api, 'deactivate').mockImplementation();

            facade.deactivate([1, 2]);

            // verify that it delegated to api;
            expect(api.deactivate).toBeCalledWith([1, 2]);
        });
    });

    describe('findUsage', () => {
        it('should just delegate to API', () => {
            jest.spyOn(api, 'findUsage').mockImplementation();

            facade.findUsage([1, 2]);

            // verify that it delegated to api;
            expect(api.findUsage).toBeCalledWith([1, 2]);
        });
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
            expect(api.query).toBeCalledWith(querySearch);
        });
    });
});
