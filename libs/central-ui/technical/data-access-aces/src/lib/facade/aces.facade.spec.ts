import { waitForAsync } from '@angular/core/testing';
import { EMPTY, of } from 'rxjs';
import { AcesApi } from '../api/aces.api';
import { AcesData } from '../model/aces-data.model';
import { YearOptions } from '../model/year-options';
import { AcesState } from '../state/aces.state';
import { AcesFacade } from './aces.facade';

describe('AcesFacade', () => {
    let api: AcesApi;
    let facade: AcesFacade;
    let state: AcesState;

    const hondaId = 1;
    const honda: AcesData = { id: hondaId, description: 'Honda' };
    const civicId = 1;
    const civic: AcesData = { id: civicId, description: 'Civic' };
    const searchOptions: YearOptions = { yearStart: 2020, yearEnd: 2021 };

    beforeEach(() => {
        state = new AcesState();
        facade = new AcesFacade('//gateway', null, state);
        api = facade['api'];
    });

    describe.each`
        facadeMethod                         | apiMethod                            | stateMethod                          | stateCacheMethod
        ${'findAllMakes'}                    | ${'findAllMakes'}                    | ${'findAllMakes'}                    | ${'cacheAllMakes'}
        ${'findAllFuelTypes'}                | ${'findAllFuelTypes'}                | ${'findAllFuelTypes'}                | ${'cacheAllFuelTypes'}
        ${'findAllFuelDeliverySubTypes'}     | ${'findAllFuelDeliverySubTypes'}     | ${'findAllFuelDeliverySubTypes'}     | ${'cacheAllFuelDeliverySubTypes'}
        ${'findAllTransmissionTypes'}        | ${'findAllTransmissionTypes'}        | ${'findAllTransmissionTypes'}        | ${'cacheAllTransmissionTypes'}
        ${'findAllTransmissionControlTypes'} | ${'findAllTransmissionControlTypes'} | ${'findAllTransmissionControlTypes'} | ${'cacheAllTransmissionControlTypes'}
        ${'findAllVehicleClasses'}           | ${'findAllVehicleClasses'}           | ${'findAllVehicleClasses'}           | ${'cacheAllVehicleClasses'}
    `('$facadeMethod', ({ facadeMethod, apiMethod, stateMethod, stateCacheMethod }) => {
        it('should delegate to the cache', () => {
            const data = of([] as AcesData[]);
            jest.spyOn(api, apiMethod).mockReturnValueOnce(data);
            jest.spyOn(state, stateMethod);
            jest.spyOn(state, stateCacheMethod);

            // cachedData is a different observable that data,
            // so the expectation will need to check it instead on returns
            const cachedData = facade[facadeMethod]();
            expect(api[apiMethod]).toHaveBeenCalledWith();
            expect(state[stateMethod]).toHaveReturnedWith(null);
            expect(state[stateCacheMethod]).toHaveBeenCalledWith(data);
            expect(state[stateCacheMethod]).toHaveReturnedWith(cachedData);

            facade[facadeMethod]();
            expect(state[stateMethod]).toHaveNthReturnedWith(2, cachedData);
            expect(api[apiMethod]).not.toHaveBeenNthCalledWith(2);
            expect(state[stateCacheMethod]).not.toHaveBeenNthCalledWith(2, data);
            expect(state[stateCacheMethod]).not.toHaveNthReturnedWith(2, cachedData);
        });
    });

    describe('findModelsByMakeId', () => {
        it.each`
            makeOrId   | opts
            ${hondaId} | ${searchOptions}
            ${honda}   | ${null}
        `(`should delegate to api when not cached and passed make=$makeOrId, opts=$opts`, ({ makeOrId, opts }) => {
            jest.spyOn(api, 'findModelsByMakeId').mockReturnValueOnce(of([]));

            facade.findModelsByMakeId(makeOrId, opts);

            expect(api.findModelsByMakeId).toHaveBeenCalledWith(hondaId, opts);
        });

        it('should use what is in the state if cached', async () => {
            jest.spyOn(api, 'findModelsByMakeId').mockImplementation();
            // put in state and verify that state is used
            state.cacheModelsByMakeId(hondaId, searchOptions, of([{ id: 1 } as AcesData]));

            const actual = await facade.findModelsByMakeId(hondaId, searchOptions).toPromise();
            expect(actual.map((d) => d.id)).toEqual([1]);
            expect(api.findModelsByMakeId).not.toHaveBeenCalled();
        });
    });

    describe('findEnginesByMakeIdAndModelId', () => {
        it.each`
            makeOrId   | modelOrId  | opts
            ${hondaId} | ${civic}   | ${searchOptions}
            ${honda}   | ${civicId} | ${null}
        `(
            `should delegate to api when passed make=$makeOrId, model=$modelOrId, opts=$opts`,
            ({ makeOrId, modelOrId, opts }) => {
                jest.spyOn(api, 'findEnginesByMakeIdAndModelId').mockReturnValue(EMPTY);

                facade.findEnginesByMakeIdAndModelId(makeOrId, modelOrId, opts);

                expect(api.findEnginesByMakeIdAndModelId).toHaveBeenCalledWith(hondaId, civicId, opts);
            }
        );

        it(
            'should append the id to the description',
            waitForAsync(async () => {
                jest.spyOn(api, 'findEnginesByMakeIdAndModelId').mockReturnValue(
                    of([
                        { id: 1, description: 'a' },
                        { id: 2, description: 'b' },
                    ] as AcesData[])
                );

                const results = await facade.findEnginesByMakeIdAndModelId(1, 2).toPromise();

                expect(results).toEqual([
                    { id: 1, description: 'a (1)' },
                    { id: 2, description: 'b (2)' },
                ] as AcesData[]);
            })
        );

        it('should use what is in the state if cached', async () => {
            jest.spyOn(api, 'findEnginesByMakeIdAndModelId').mockImplementation();
            // put in state and verify that state is used
            state.cacheEnginesByMakeIdAndModelId(hondaId, civicId, searchOptions, of([{ id: 1 } as AcesData]));

            const actual = await facade.findEnginesByMakeIdAndModelId(hondaId, civicId, searchOptions).toPromise();
            expect(actual.map((d) => d.id)).toEqual([1]);
            expect(api.findEnginesByMakeIdAndModelId).not.toHaveBeenCalled();
        });
    });

    describe('findSubModelsByMakeIdAndModelId', () => {
        it.each`
            makeOrId   | modelOrId  | opts
            ${hondaId} | ${civic}   | ${searchOptions}
            ${honda}   | ${civicId} | ${null}
        `(
            `should delegate to api when passed make=$makeOrId, model=$modelOrId, opts=$opts`,
            ({ makeOrId, modelOrId, opts }) => {
                jest.spyOn(api, 'findSubModelsByMakeIdAndModelId').mockImplementation();

                facade.findSubModelsByMakeIdAndModelId(makeOrId, modelOrId, opts);

                expect(api.findSubModelsByMakeIdAndModelId).toHaveBeenCalledWith(hondaId, civicId, opts);
            }
        );
    });

    describe('findEngineDesignationsByMakeId', () => {
        it.each`
            makeOrId   | opts
            ${hondaId} | ${searchOptions}
            ${honda}   | ${null}
        `(`should delegate to api when passed make=$makeOrId, opts=$opts`, ({ makeOrId, opts }) => {
            jest.spyOn(api, 'findEngineDesignationsByMakeId').mockImplementation();

            facade.findEngineDesignationsByMakeId(makeOrId, opts);

            expect(api.findEngineDesignationsByMakeId).toHaveBeenCalledWith(hondaId, opts);
        });
    });

    describe('dropdowns', () => {
        describe('makeDropdown', () => {
            const config = { name: 'Test Make', apiFieldPath: 'vehicles.makeId' };
            const make1 = { id: 1, description: 'Make 1' };
            const make2 = { id: 2, description: 'Make 2' };
            const make3 = { id: 3, description: 'Make 3' };

            beforeEach(() => {
                jest.spyOn(facade, 'findAllMakes').mockReturnValueOnce(of([make1, make2, make3]));
            });

            it('should create', async () => {
                const dropdown = facade.searchColumns.makeDropdown(config);
                expect(dropdown.name).toEqual(config.name);
                expect(dropdown.apiFieldPath).toEqual(config.apiFieldPath);
                expect(await dropdown.fetchData('test').toPromise()).toEqual([make1, make2, make3]);
                expect(facade.findAllMakes).toHaveBeenCalled();
            });
        });
    });
});
