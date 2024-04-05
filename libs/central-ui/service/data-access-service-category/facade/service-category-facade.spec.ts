import { Described } from '@vioc-angular/shared/common-functionality';
import { EntityPatch } from '@vioc-angular/shared/util-api';
import { of } from 'rxjs';
import { ServiceCategory } from '../src';
import { ServiceCategoryState } from '../state/service-category-state';
import { ServiceCategoryApi } from './../api/service-category-api';
import { ServiceCategoryFacade } from './service-category-facade';

describe('ServiceCategoryFacade', () => {
    let api: ServiceCategoryApi;
    let facade: ServiceCategoryFacade;
    let state: ServiceCategoryState;

    beforeEach(() => {
        state = new ServiceCategoryState();
        facade = new ServiceCategoryFacade(null, null, state);
        api = facade['api'];
    });

    describe('findActive', () => {
        it('should use what is in state if cached', async () => {
            jest.spyOn(api, 'findActive').mockImplementation();
            // put in state and verify that state is used
            state.cacheActiveByLevel('LEAF', of([{ id: 1 } as Described]));

            const actual = await facade.findActive('LEAF').toPromise();
            expect(actual.map((d) => d.id)).toEqual([1]);
            expect(api.findActive).not.toHaveBeenCalled();
        });

        it('should fetch from API and cache if not cached', async () => {
            // put in another type in state
            state.cacheActiveByLevel('LEAF', of([{ id: 1 } as Described]));

            jest.spyOn(api, 'findActive').mockImplementation(() => of([{ id: 2 } as Described]));

            const actual = await facade.findActive('ROOT').toPromise();
            expect(actual.map((d) => d.id)).toEqual([2]);
            expect(api.findActive).toHaveBeenCalledTimes(1);
            // call again and verify API was not called as second time
            await facade.findActive('ROOT').toPromise();
            expect(api.findActive).toHaveBeenCalledTimes(1);
        });
    });

    describe('dropdown', () => {
        const sB = { code: '1', description: 'Test Code B' };
        const sA = { code: '2', description: 'Test Code A' };
        const sC = { code: '3', description: 'Test Code C' };
        beforeEach(() => {
            jest.spyOn(facade, 'findActive').mockReturnValue(of([sC, sB, sA]));
        });
        it('should create', async () => {
            const dropdown = facade.searchColumns.dropdown({ name: 'Cat', level: 'LEAF', apiFieldPath: 'path' });

            expect(dropdown.name).toEqual('Cat');
            expect(dropdown.apiFieldPath).toEqual('path');
            expect(await dropdown.fetchData('test').toPromise()).toEqual([sB, sA, sC]); // verify sorted
            expect(facade.findActive).toHaveBeenCalledWith('LEAF');
        });

        it('should set defaults', async () => {
            const dropdown = facade.searchColumns.dropdown({ level: 'ROOT', apiFieldPath: 'path' });

            expect(dropdown.name).toEqual('Service Category');
            expect(dropdown.apiFieldPath).toEqual('path');
            await dropdown.fetchData('test').toPromise();
            expect(facade.findActive).toHaveBeenCalledWith('ROOT');
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

    describe('validateParentCategory', () => {
        it('should just delegate to API', () => {
            jest.spyOn(api, 'validateParentCategory').mockImplementation();

            facade.validateParentCategory('parCode', 'currCode');

            // verify that call was delegated to API
            expect(api.validateParentCategory).toBeCalledWith('parCode', 'currCode');
        });
    });

    describe('save', () => {
        it('should set defaults', () => {
            jest.spyOn(api, 'save').mockImplementation();
            const testServiceCategory = {
                motorInfo: null,
                carFaxMapping: null,
                preventativeMaintenanceQualifiers: null,
            };

            const expectedServiceCategory = {
                motorInfo: [],
                carFaxMapping: [],
                preventativeMaintenanceQualifiers: [],
            };

            facade.save(testServiceCategory);

            expect(api.save).toBeCalledWith(expectedServiceCategory);
        });
    });

    describe('entityPatch', () => {
        it('should just delegate to API', () => {
            jest.spyOn(api, 'entityPatch').mockImplementation();
            const patch = { id: 1, updateValues: { ...new ServiceCategory(), code: 'Test' }, fields: ['code'] };
            facade.entityPatch([patch]);

            // verify that it delegated to api;
            expect(api.entityPatch).toBeCalledWith(['patch'], patch);
        });
    });
});
