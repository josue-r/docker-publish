import { QueryPage, QuerySearch, QuerySort, SearchLine } from '@vioc-angular/shared/common-api-models';
import { EntityPatch } from '@vioc-angular/shared/util-api';
import { Column, Comparators } from '@vioc-angular/shared/util-column';
import { CompanyServiceApi } from '../api/company-service-api';
import { CompanyService } from '../model/company-service.model';
import { CompanyServiceFacade } from './company-service-facade';

describe('CompanyServiceFacade', () => {
    let api: CompanyServiceApi;
    let facade: CompanyServiceFacade;

    beforeEach(() => {
        // facade = new CompanyServiceFacade('//gateway',null)
        facade = new CompanyServiceFacade(null, null);
        api = facade['api'];
    });

    describe('findByCompanyAndServiceCode', () => {
        it('should just delegate to API', () => {
            jest.spyOn(api, 'findByCompanyAndServiceCode').mockImplementation();

            facade.findByCompanyAndServiceCode('FOO', 'BAR');

            // verify that it delegated to api;
            expect(api.findByCompanyAndServiceCode).toBeCalledWith('FOO', 'BAR');
        });
    });

    describe('activate', () => {
        it('should just delegate to API', () => {
            jest.spyOn(api, 'activate').mockImplementation();

            const id12 = { companyId: 1, serviceId: 2 };
            const id34 = { companyId: 3, serviceId: 4 };

            facade.activate([id12, id34]);

            // verify that it delegated to api;
            expect(api.activate).toBeCalledWith([id12, id34]);
        });
    });

    describe('deactivate', () => {
        it('should just delegate to API', () => {
            jest.spyOn(api, 'deactivate').mockImplementation();

            const id12 = { companyId: 1, serviceId: 2 };
            const id34 = { companyId: 3, serviceId: 4 };

            facade.deactivate([id12, id34]);

            // verify that it delegated to api;
            expect(api.deactivate).toBeCalledWith([id12, id34]);
        });
    });

    describe('update', () => {
        it('should just delegate to API', () => {
            jest.spyOn(api, 'update').mockImplementation();
            const csToAdd12: CompanyService = { id: { companyId: 1, serviceId: 2 } };

            facade.update(csToAdd12);

            // verify that it delegated to api;
            expect(api.update).toBeCalledWith(csToAdd12);
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

    describe('findUsage', () => {
        it('should just delegate to API', () => {
            jest.spyOn(api, 'findUsage').mockImplementation();
            const id12 = { companyId: 1, serviceId: 2 };
            const id34 = { companyId: 2, serviceId: 3 };

            facade.findUsage([id12, id34]);

            // verify that it delegated to api;
            expect(api.findUsage).toBeCalledWith([id12, id34]);
        });
    });

    describe('previewMassAdd', () => {
        it('should just delegate to API', () => {
            jest.spyOn(api, 'previewMassAdd').mockImplementation();

            const companyIds = [1, 2];
            const serviceIds = [4, 6, 7];

            facade.previewMassAdd(companyIds, serviceIds);

            // verify that it delegated to api;
            expect(api.previewMassAdd).toBeCalledWith(companyIds, serviceIds);
        });
    });

    describe('add', () => {
        it('should just delegate to API', () => {
            jest.spyOn(api, 'add').mockImplementation();

            const compService1: CompanyService = {
                id: { serviceId: 1111, companyId: 2222 },
                version: null,
                active: true,
                company: null,
                service: null,
                salesAccount: null,
                costAccount: null,
                pricingStrategy: null,
                updatedOn: null,
                updatedBy: null,
            };

            const compService2: CompanyService = {
                id: { serviceId: 3333, companyId: 4444 },
                version: null,
                active: true,
                company: null,
                service: null,
                salesAccount: null,
                costAccount: null,
                pricingStrategy: null,
                updatedOn: null,
                updatedBy: null,
            };

            const massAdd: CompanyService[] = [compService1, compService2];

            facade.add(massAdd);

            // verify that it delegated to api;
            expect(api.add).toBeCalledWith(massAdd);
        });
    });

    describe('entityPatch', () => {
        it('should just delegate to API', () => {
            jest.spyOn(api, 'entityPatch').mockImplementation();

            const patch: EntityPatch<{ companyId: number; serviceId: number }> = {
                id: { companyId: 1, serviceId: 2 },
                fields: ['pricingStrategy'],
                updateValues: { pricingStrategy: 'SERVICE' },
            };

            facade.entityPatch([patch]);

            // verify that it delegated to api;
            expect(api.entityPatch).toBeCalledWith(['patch'], patch);
        });
    });

    describe('datasync', () => {
        it('should just delegate to API', () => {
            jest.spyOn(api, 'dataSync').mockImplementation();

            const ids = [
                { companyId: 1, serviceId: 11 },
                { companyId: 2, serviceId: 22 },
                { companyId: 2, serviceId: 33 },
            ];

            facade.dataSync(ids);

            // verify that it delegated to api;
            expect(api.dataSync).toBeCalledWith(ids);
        });
    });
});
