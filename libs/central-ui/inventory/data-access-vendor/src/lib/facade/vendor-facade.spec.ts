import { Described } from '@vioc-angular/shared/common-functionality';
import { of } from 'rxjs';
import { VendorApi } from '../api/vendor-api';
import { VendorState } from '../state/vendor-state';
import { VendorFacade } from './vendor-facade';

describe('VendorFacade', () => {
    let api: VendorApi;
    let facade: VendorFacade;
    let state: VendorState;

    beforeEach(() => {
        // facade = new VendorFacade('//gateway',null)
        state = new VendorState();
        facade = new VendorFacade('//gateway', null, state);
        api = facade['api'];
    });

    describe('findByStores', () => {
        it('should use what is in state if cached', async () => {
            jest.spyOn(api, 'findByStores').mockImplementation();
            state.cacheByStores(['0000'], of([{ id: 1 } as Described]));
            const value = await facade.findByStores(['0000']).toPromise();
            expect(value.map((d) => d.id)).toEqual([1]);
            expect(api.findByStores).not.toHaveBeenCalled();
        });
    });

    it('should fetch from API and cache if not cached', async () => {
        // put in another type in state
        state.cacheByStores(['FOO'], of([{ id: 1 } as Described]));

        jest.spyOn(facade['api'], 'findByStores').mockImplementation(() => of([{ id: 2 } as Described]));

        const actual = await facade.findByStores(['bar']).toPromise();
        expect(actual.map((d) => d.id)).toEqual([2]);
        expect(facade['api'].findByStores).toHaveBeenCalledTimes(1);
        // call again and verify API was not called as second time
        await facade.findByStores(['bar']).toPromise();
        expect(facade['api'].findByStores).toHaveBeenCalledTimes(1);
    });

    describe('dropdowns', () => {
        const config: { name?: string; apiFieldPath: string; storeNumbers: string[] } = {
            apiFieldPath: 'vendor',
            storeNumbers: ['TSTORE1'],
        };
        const vendor1 = { code: 'V1', description: 'Test Vendor 1' };
        const vendor2 = { code: 'V2', description: 'Test Vendor 2' };
        const vendor3 = { code: 'V3', description: 'Test Vendor 3' };
        // shuffling the order to assert sorted dropdown
        const vendors: Described[] = [vendor2, vendor1, vendor3];
        beforeEach(() => {
            jest.spyOn(facade, 'findByStores').mockReturnValue(of(vendors));
        });

        it('should create', async () => {
            const dropdown = facade.searchColumns.dropdown(config);
            expect(dropdown.name).toEqual(config.name);
            expect(dropdown.apiFieldPath).toEqual(config.apiFieldPath);
            expect(dropdown.type).toEqual({ entityType: 'vendor' });
            // should return sorted options in vendor dropdown
            expect(await dropdown.fetchData('V').toPromise()).toEqual([vendor1, vendor2, vendor3]);
            expect(facade.findByStores).toHaveBeenCalledWith(config.storeNumbers);
        });

        it('should set defaults', () => {
            const dropdown = facade.searchColumns.dropdown(config);
            expect(dropdown.mapToTableDisplay(vendor1)).toEqual('V1');
            expect(dropdown.name).toEqual('Vendor');
        });

        it('should set overrides', () => {
            const dropdown = facade.searchColumns.dropdown(config, {
                mapToTableDisplay: Described.codeAndDescriptionMapper,
            });
            expect(dropdown.mapToTableDisplay(vendor1)).toEqual('V1 - Test Vendor 1');
        });
    });

    describe('findAllAccessibleActive', () => {
        it('should use what is in state if cached', async () => {
            const vendor1 = { code: 'V1', description: 'Test Vendor 1', id: 1 };
            jest.spyOn(api, 'findAllAccessibleActive').mockImplementation();
            state.cacheByAccessibleActive(of([vendor1 as Described]));
            const value = await facade.findAllAccessibleActive().toPromise();
            expect(value.map((d) => d.id)).toEqual([1]);
            expect(value.map((d) => d.code)).toEqual(['V1']);
            expect(value.map((d) => d.description)).toEqual(['Test Vendor 1']);
            expect(api.findAllAccessibleActive).not.toHaveBeenCalled();
        });

        it('should fetch from API and cache if not cached', async () => {
            const vendor2 = { code: 'V2', description: 'Test Vendor 2', id: 2 };
            jest.spyOn(facade['api'], 'findAllAccessibleActive').mockImplementation(() => of([vendor2 as Described]));
            const actual = await facade.findAllAccessibleActive().toPromise();
            expect(actual.map((d) => d.id)).toEqual([2]);
            expect(facade['api'].findAllAccessibleActive).toHaveBeenCalledTimes(1);
            // call again and verify cache was used so API was not called as second time
            await facade.findAllAccessibleActive().toPromise();
            expect(facade['api'].findAllAccessibleActive).toHaveBeenCalledTimes(1);
        });
    });

    describe('descriptionDropdown', () => {
        const config: { name?: string; apiFieldPath: string } = {
            apiFieldPath: 'vendor',
        };
        const vendor1 = { code: 'V1', description: 'Test Vendor 1' };
        const vendor2 = { code: 'V2', description: 'Test Vendor 2' };
        const vendor3 = { code: 'V3', description: 'Test Vendor 3' };
        const vendors: Described[] = [vendor1, vendor2, vendor3];
        beforeEach(() => {
            jest.spyOn(facade, 'findAllAccessibleActive').mockReturnValue(of(vendors));
        });

        it('should create', async () => {
            const dropdown = facade.searchColumns.descriptionDropdown(config);
            expect(dropdown.name).toEqual(config.name);
            expect(dropdown.apiFieldPath).toEqual(config.apiFieldPath);
            expect(dropdown.type).toEqual({ entityType: 'vendor' });
            expect(await dropdown.fetchData('V').toPromise()).toEqual([vendor1, vendor2, vendor3]);
            expect(facade.findAllAccessibleActive).toHaveBeenCalled();
        });

        it('should set defaults', () => {
            const dropdown = facade.searchColumns.descriptionDropdown(config);
            expect(dropdown.mapToTableDisplay(vendor1)).toEqual('V1');
            expect(dropdown.name).toEqual('Vendor');
        });

        it('should set overrides', () => {
            const dropdown = facade.searchColumns.descriptionDropdown(config, {
                mapToTableDisplay: Described.codeAndDescriptionMapper,
            });
            expect(dropdown.mapToTableDisplay(vendor1)).toEqual('V1 - Test Vendor 1');
        });
    });
});
