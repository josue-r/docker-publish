import { defer, Observable, of } from 'rxjs';
import { AcesData } from '../model/aces-data.model';
import { AcesState } from './aces.state';

describe('AcesState', () => {
    let state: AcesState;
    const testMake: AcesData = { id: 3, description: 'Test Make' };
    const testModel: AcesData = { id: 6, description: 'Test Model' };
    const testEngine: AcesData = { id: 9, description: 'Test Engine' };

    beforeEach(() => {
        state = new AcesState();
    });

    it('should create an instance', () => {
        expect(state).toBeTruthy();
    });

    describe.each`
        method                               | key
        ${'findAllMakes'}                    | ${'findAllMakesKey'}
        ${'findAllFuelTypes'}                | ${'findAllFuelTypesKey'}
        ${'findAllFuelDeliverySubTypes'}     | ${'findAllFuelDeliverySubTypesKey'}
        ${'findAllTransmissionTypes'}        | ${'findAllTransmissionTypesKey'}
        ${'findAllTransmissionControlTypes'} | ${'findAllTransmissionControlTypesKey'}
        ${'findAllVehicleClasses'}           | ${'findAllVehicleClassesKey'}
    `('$method', ({ method, key }) => {
        it('should return undefined if not cached', () => {
            expect(state[method]()).toBeNull();
        });

        it('should return an observable if cached', () => {
            // put something in cache
            state['acesCache'].put(key, of([]));

            expect(state[method]()).toBeDefined();
        });
    });

    describe.each`
        method                               | cacheMethod
        ${'findAllMakes'}                    | ${'cacheAllMakes'}
        ${'findAllFuelTypes'}                | ${'cacheAllFuelTypes'}
        ${'findAllFuelDeliverySubTypes'}     | ${'cacheAllFuelDeliverySubTypes'}
        ${'findAllTransmissionTypes'}        | ${'cacheAllTransmissionTypes'}
        ${'findAllTransmissionControlTypes'} | ${'cacheAllTransmissionControlTypes'}
        ${'findAllVehicleClasses'}           | ${'cacheAllVehicleClasses'}
    `('$cacheMethod', ({ method, cacheMethod }) => {
        it('should cache and return a replayable observable', async () => {
            // Everytime this executes, it will return a new array with different ID values
            let index = 0;
            function loadExternalData(): Observable<AcesData[]> {
                return defer(() => Promise.resolve([{ id: index++ }, { id: index++ }] as AcesData[]));
            }

            const cacheResult = await state[cacheMethod](loadExternalData()).toPromise();

            // index should have been updated twice
            expect(cacheResult.map((d) => d.id)).toEqual([0, 1]);
            expect(index).toEqual(2);

            // calling findByType should always return the cached value
            expect((await state[method]().toPromise()).map((d) => d.id)).toEqual([0, 1]);
            // control case:
            // manually calling loadExternalData() should create new array alements
            expect((await loadExternalData().toPromise()).map((d) => d.id)).toEqual([2, 3]);
            // calling findByType should still return the cached value
            expect((await state[method]().toPromise()).map((d) => d.id)).toEqual([0, 1]);
        });
    });

    describe('findModelsByMakeId', () => {
        it('should return undefined if not cached', () => {
            expect(state.findModelsByMakeId(testMake, { yearStart: 2020, yearEnd: 2021 })).toBeNull();
        });

        describe.each`
            makeOrId       | searchOptions                         | cacheKey
            ${testMake.id} | ${{}}                                 | ${'3.undefined.undefined'}
            ${testMake}    | ${{}}                                 | ${'3.undefined.undefined'}
            ${testMake.id} | ${{ yearStart: 2020, yearEnd: 2021 }} | ${'3.2020.2021'}
            ${testMake}    | ${{ yearStart: 2020, yearEnd: 2021 }} | ${'3.2020.2021'}
            ${testMake}    | ${{ yearStart: 2020 }}                | ${'3.2020.undefined'}
            ${testMake}    | ${{ yearEnd: 2021 }}                  | ${'3.undefined.2021'}
        `('cached', ({ makeOrId, searchOptions, cacheKey }) => {
            it(`should return an observable if cached ${cacheKey}`, async () => {
                state['modelCache'].put(cacheKey, of([testModel]));
                const cachedData = await state.findModelsByMakeId(makeOrId, searchOptions).toPromise();
                expect(cachedData).toEqual([testModel]);
            });
        });
    });
    describe('cacheModelsByMakeId', () => {
        it('should cache and return a replayable observable ', async () => {
            // Everytime this executes, it will return a new array with different ID values
            let index = 0;
            function loadExternalData(): Observable<AcesData[]> {
                return defer(() => Promise.resolve([{ id: index++ }, { id: index++ }] as AcesData[]));
            }

            const cacheResult = await state.cacheModelsByMakeId(testMake, {}, loadExternalData()).toPromise();

            // index should have been updated twice
            expect(cacheResult.map((d) => d.id)).toEqual([0, 1]);
            expect(index).toEqual(2);

            // calling findModelsByMakeId should always return the cached value
            expect((await state.findModelsByMakeId(testMake, {}).toPromise()).map((d) => d.id)).toEqual([0, 1]);
            expect((await state.findModelsByMakeId(testMake, {}).toPromise()).map((d) => d.id)).toEqual([0, 1]);
            // control case:
            // manually calling loadExternalData() should create new array alements
            expect((await loadExternalData().toPromise()).map((d) => d.id)).toEqual([2, 3]);
            // calling findModelsByMakeId should still return the cached value
            expect((await state.findModelsByMakeId(testMake, {}).toPromise()).map((d) => d.id)).toEqual([0, 1]);
        });
    });
    describe('findEnginesByMakeIdAndModelId', () => {
        it('should return undefined if not cached', () => {
            expect(
                state.findEnginesByMakeIdAndModelId(testMake, testModel, { yearStart: 2020, yearEnd: 2021 })
            ).toBeNull();
        });

        describe.each`
            makeOrId       | modelOrId       | searchOptions                         | cacheKey
            ${testMake.id} | ${testModel.id} | ${{}}                                 | ${'3.6.undefined.undefined'}
            ${testMake.id} | ${testModel}    | ${{}}                                 | ${'3.6.undefined.undefined'}
            ${testMake}    | ${testModel.id} | ${{}}                                 | ${'3.6.undefined.undefined'}
            ${testMake}    | ${testModel}    | ${{}}                                 | ${'3.6.undefined.undefined'}
            ${testMake.id} | ${testModel.id} | ${{ yearStart: 2020, yearEnd: 2021 }} | ${'3.6.2020.2021'}
            ${testMake}    | ${testModel}    | ${{ yearStart: 2020, yearEnd: 2021 }} | ${'3.6.2020.2021'}
            ${testMake}    | ${testModel}    | ${{ yearStart: 2020 }}                | ${'3.6.2020.undefined'}
            ${testMake}    | ${testModel}    | ${{ yearEnd: 2021 }}                  | ${'3.6.undefined.2021'}
        `('cached', ({ makeOrId, modelOrId, searchOptions, cacheKey }) => {
            it(`should return an observable if cached ${cacheKey}`, async () => {
                state['engineCache'].put(cacheKey, of([testEngine]));
                const cachedData = await state
                    .findEnginesByMakeIdAndModelId(makeOrId, modelOrId, searchOptions)
                    .toPromise();
                expect(cachedData).toEqual([testEngine]);
            });
        });
    });
    describe('cacheEnginesByMakeIdAndModelId', () => {
        it('should cache and return a replayable observable ', async () => {
            // Everytime this executes, it will return a new array with different ID values
            let index = 0;
            function loadExternalData(): Observable<AcesData[]> {
                return defer(() => Promise.resolve([{ id: index++ }, { id: index++ }] as AcesData[]));
            }

            const cacheResult = await state
                .cacheEnginesByMakeIdAndModelId(testMake, testModel, {}, loadExternalData())
                .toPromise();

            // index should have been updated twice
            expect(cacheResult.map((d) => d.id)).toEqual([0, 1]);
            expect(index).toEqual(2);

            // calling findEnginesByMakeIdAndModelId should always return the cached value
            expect(
                (await state.findEnginesByMakeIdAndModelId(testMake, testModel, {}).toPromise()).map((d) => d.id)
            ).toEqual([0, 1]);
            expect(
                (await state.findEnginesByMakeIdAndModelId(testMake, testModel, {}).toPromise()).map((d) => d.id)
            ).toEqual([0, 1]);
            // control case:
            // manually calling loadExternalData() should create new array alements
            expect((await loadExternalData().toPromise()).map((d) => d.id)).toEqual([2, 3]);
            // calling findEnginesByMakeIdAndModelId should still return the cached value
            expect(
                (await state.findEnginesByMakeIdAndModelId(testMake, testModel, {}).toPromise()).map((d) => d.id)
            ).toEqual([0, 1]);
        });
    });
});
