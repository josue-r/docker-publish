import { Described } from '@vioc-angular/shared/common-functionality';
import { of } from 'rxjs';
import { CarSystemFacade } from '../facade/car-system-facade';
import { CarSystemApi } from './../api/car-system-api';

describe('CarServiceFacade', () => {
    const facade = new CarSystemFacade(null, null);
    const api: CarSystemApi = facade['api'];

    describe('findActive', () => {
        it('should delegate to the API', () => {
            jest.spyOn(api, 'findActive').mockImplementation();
            facade.findActive();
            expect(api.findActive).toHaveBeenCalled();
        });
    });

    describe('dropdown', () => {
        const config = {
            type: 'TEST',
            name: 'Test Code',
            apiFieldPath: 'testCodePath',
            entityType: 'carSystem',
        };
        const carSystemA = { code: 'Test', description: 'Test Code A' };
        const carSystemB = { code: 'Test1', description: 'Test Code B' };
        const carSystemC = { code: 'Test2', description: 'Test Code C' };
        const carSystems: Described[] = [carSystemA, carSystemB, carSystemC];

        beforeEach(() => {
            jest.spyOn(facade, 'findActive').mockReturnValue(of(carSystems));
        });

        it('should create', async () => {
            const dropdown = facade.searchColumns.dropdown(config);
            expect(dropdown.name).toEqual(config.name);
            expect(dropdown.apiFieldPath).toEqual(config.apiFieldPath);
            expect(dropdown.type).toEqual({ entityType: config.entityType });
            expect(await dropdown.fetchData('test').toPromise()).toEqual([carSystemA, carSystemB, carSystemC]);
            expect(facade.findActive).toHaveBeenCalled();
        });
    });
});
