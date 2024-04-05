import { QueryPage, QuerySearch, QuerySort, SearchLine } from '@vioc-angular/shared/common-api-models';
import { EntityPatch } from '@vioc-angular/shared/util-api';
import { Column, Comparators } from '@vioc-angular/shared/util-column';
import { CompanyProductApi } from '../api/company-product-api';
import { CompanyProduct } from '../model/company-product.model';
import { CompanyProductFacade } from './company-product-facade';

describe('CompanyProductFacade', () => {
    let api: CompanyProductApi;
    let facade: CompanyProductFacade;

    beforeEach(() => {
        // facade = new CompanyProductFacade('//gateway',null)
        facade = new CompanyProductFacade(null, null);
        api = facade['api'];
    });

    describe('findByCompanyAndProductCode', () => {
        it('should just delegate to API', () => {
            jest.spyOn(api, 'findByCompanyAndProductCode').mockImplementation();

            facade.findByCompanyAndProductCode('FOO', 'BAR');

            // verify that it delegated to api;
            expect(api.findByCompanyAndProductCode).toBeCalledWith('FOO', 'BAR');
        });
    });

    describe('add', () => {
        it('should just delegate to API', () => {
            jest.spyOn(api, 'add').mockImplementation();
            const cpToAdd12: CompanyProduct = { id: { companyId: 1, productId: 2 } };
            const cpToAdd34: CompanyProduct = { id: { companyId: 3, productId: 4 } };

            facade.add([cpToAdd12, cpToAdd34]);

            // verify that it delegated to api;
            expect(api.add).toBeCalledWith([cpToAdd12, cpToAdd34]);
        });
    });

    describe('update', () => {
        it('should just delegate to API', () => {
            jest.spyOn(api, 'update').mockImplementation();
            const cpToAdd12: CompanyProduct = { id: { companyId: 1, productId: 2 } };

            facade.update(cpToAdd12);

            // verify that it delegated to api;
            expect(api.update).toBeCalledWith(cpToAdd12);
        });
    });

    describe('activate', () => {
        it('should just delegate to API', () => {
            jest.spyOn(api, 'activate').mockImplementation();

            const id12 = { companyId: 1, productId: 2 };
            const id34 = { companyId: 3, productId: 4 };

            facade.activate([id12, id34]);

            // verify that it delegated to api;
            expect(api.activate).toBeCalledWith([id12, id34]);
        });
    });

    describe('deactivate', () => {
        it('should just delegate to API', () => {
            jest.spyOn(api, 'deactivate').mockImplementation();

            const id12 = { companyId: 1, productId: 2 };
            const id34 = { companyId: 3, productId: 4 };

            facade.deactivate([id12, id34]);

            // verify that it delegated to api;
            expect(api.deactivate).toBeCalledWith([id12, id34]);
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

    describe('entityPatch', () => {
        it('should just delegate to API', () => {
            jest.spyOn(api, 'entityPatch').mockImplementation();

            const patch: EntityPatch<{ companyId: number; productId: number }> = {
                id: { companyId: 1, productId: 2 },
                fields: ['active'],
                updateValues: { active: true },
            };

            facade.entityPatch([patch]);

            // verify that it delegated to api;
            expect(api.entityPatch).toBeCalledWith(['patch'], patch);
        });
    });

    describe('activate', () => {
        it('should just delegate to API', () => {
            jest.spyOn(api, 'activate').mockImplementation();

            const ids = [{ companyId: 1, productId: 2 }];

            facade.activate(ids);

            // verify that it delegated to api;
            expect(api.activate).toBeCalledWith(ids);
        });
    });

    describe('deactivate', () => {
        it('should just delegate to API', () => {
            jest.spyOn(api, 'deactivate').mockImplementation();

            const ids = [{ companyId: 1, productId: 2 }];

            facade.deactivate(ids);

            // verify that it delegated to api;
            expect(api.deactivate).toBeCalledWith(ids);
        });
    });

    describe('findUsage', () => {
        it('should just delegate to API', () => {
            jest.spyOn(api, 'findUsage').mockImplementation();

            const ids = [{ companyId: 1, productId: 2 }];

            facade.findUsage(ids);

            // verify that it delegated to api;
            expect(api.findUsage).toBeCalledWith(ids);
        });
    });

    describe('dataSync', () => {
        it('should just delegate to API', () => {
            jest.spyOn(api, 'dataSync').mockImplementation();

            const id = { companyId: 1, productId: 2 };

            facade.dataSync([id]);

            // verify that it delegated to api;
            expect(api.dataSync).toBeCalledWith([id]);
        });
    });
});
