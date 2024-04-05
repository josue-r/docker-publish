import { RoleFacade } from '@vioc-angular/security/data-access-security';
import { QueryPage, QuerySearch, QuerySort, SearchLine } from '@vioc-angular/shared/common-api-models';
import { Column, Comparators } from '@vioc-angular/shared/util-column';
import { of } from 'rxjs';
import { StoreApi } from '../api/store.api';
import { Store } from '../model/store.model';
import { StoreFacade } from './store.facade';

describe('StoreFacade', () => {
    let api: StoreApi;
    let facade: StoreFacade;
    let roleFacade: RoleFacade = new RoleFacade('//gateway', null, null);

    beforeEach(() => {
        facade = new StoreFacade('//gateway', null, roleFacade);
        api = facade['api'];
    });

    describe('dataSync', () => {
        it('should just delegate to API', () => {
            jest.spyOn(api, 'dataSync').mockImplementation();

            const id: number = 1;

            facade.dataSync([id]);

            // verify that it delegated to api;
            expect(api.dataSync).toBeCalledWith([id]);
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

    describe('findByCode', () => {
        it('should delegate to the API', () => {
            jest.spyOn(api, 'findByCode').mockImplementation();
            const storeCode = 'test';
            facade.findByCode(storeCode);
            expect(api.findByCode).toBeCalledWith(storeCode);
        });
    });

    describe('save', () => {
        it('should delegate to the API', () => {
            const store = { ...new Store(), code: '123456' };
            jest.spyOn(api, 'save').mockReturnValue(of(store));

            // Mocking the roleFacade calls for the available store update security roles
            jest.spyOn(roleFacade, 'getMyRoles')
                .mockImplementationOnce(() => {
                    return of(['ROLE_STORE_UPDATE']);
                })
                .mockImplementationOnce(() => {
                    return of(['ROLE_STORE_LOCATION_CONTENT_UPDATE']);
                })
                .mockImplementationOnce(() => {
                    return of(['ROLE_STORE_LATITUDE_LONGITUDE_UPDATE']);
                });

            // Calling save() for each of the roles and checking the proper endpoint call
            facade.save(store).subscribe();
            expect(api.save).toHaveBeenCalledWith(store);

            facade.save(store).subscribe();
            expect(api.save).toHaveBeenCalledWith(store, ['location-content']);

            facade.save(store).subscribe();
            expect(api.save).toHaveBeenCalledWith(store, ['coordinates']);
        });
    });
});
