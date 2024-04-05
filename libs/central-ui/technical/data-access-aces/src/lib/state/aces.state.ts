import { Injectable } from '@angular/core';
import { CachedState } from '@vioc-angular/shared/util-state';
import { Observable } from 'rxjs';
import { AcesData } from '../model/aces-data.model';
import { YearOptions } from '../model/year-options';

@Injectable({ providedIn: 'root' })
export class AcesState {
    /** Cache of non-specific aces data. */
    private readonly acesCache = new CachedState<AcesData[]>({ evictionStrategy: 'lru', maxSize: 6 });

    private readonly findAllMakesKey = 'findAllMakesKey';
    private readonly findAllFuelTypesKey = 'findAllFuelTypesKey';
    private readonly findAllFuelDeliverySubTypesKey = 'findAllFuelDeliverySubTypesKey';
    private readonly findAllTransmissionTypesKey = 'findAllTransmissionTypesKey';
    private readonly findAllTransmissionControlTypesKey = 'findAllTransmissionControlTypesKey';
    private readonly findAllVehicleClassesKey = 'findAllVehicleClassesKey';
    // if any additional keys are added to cache a method, increase the cache maxSize accordingly

    /** Cache of models based on a make and a year range */
    private readonly modelCache = new CachedState<AcesData[]>({ evictionStrategy: 'lru', maxSize: 30 });

    /** Cache of engines based on a make, a model, and a year range */
    private readonly engineCache = new CachedState<AcesData[]>({ evictionStrategy: 'lru', maxSize: 30 });

    /** Returns the cache of all aces makes. */
    findAllMakes(): Observable<AcesData[]> | undefined {
        return this.acesCache.get(this.findAllMakesKey);
    }

    /** Caches an observable of all the aces makes from the API. */
    cacheAllMakes(makes: Observable<AcesData[]>): Observable<AcesData[]> {
        return this.acesCache.put(this.findAllMakesKey, makes);
    }

    /** Returns the cache of all the aces fuel types. */
    findAllFuelTypes(): Observable<AcesData[]> | undefined {
        return this.acesCache.get(this.findAllFuelTypesKey);
    }

    /** Caches an observable of all the aces fuel types from the API. */
    cacheAllFuelTypes(fuelTypes: Observable<AcesData[]>): Observable<AcesData[]> {
        return this.acesCache.put(this.findAllFuelTypesKey, fuelTypes);
    }

    /** Returns the cache of all the aces fuel delivery types. */
    findAllFuelDeliverySubTypes(): Observable<AcesData[]> | undefined {
        return this.acesCache.get(this.findAllFuelDeliverySubTypesKey);
    }

    /** Caches an observable of all the aces fuel delivery types from the API. */
    cacheAllFuelDeliverySubTypes(fdst: Observable<AcesData[]>): Observable<AcesData[]> {
        return this.acesCache.put(this.findAllFuelDeliverySubTypesKey, fdst);
    }

    /** Returns the cache of all the aces transmission types. */
    findAllTransmissionTypes(): Observable<AcesData[]> | undefined {
        return this.acesCache.get(this.findAllTransmissionTypesKey);
    }

    /** Caches an observable of all the aces transmission types from the API. */
    cacheAllTransmissionTypes(transmissionTypes: Observable<AcesData[]>): Observable<AcesData[]> {
        return this.acesCache.put(this.findAllTransmissionTypesKey, transmissionTypes);
    }

    /** Returns the cache of all the aces transmission control types. */
    findAllTransmissionControlTypes(): Observable<AcesData[]> | undefined {
        return this.acesCache.get(this.findAllTransmissionControlTypesKey);
    }

    /** Caches an observable of all the aces transmission control types from the API. */
    cacheAllTransmissionControlTypes(tct: Observable<AcesData[]>): Observable<AcesData[]> {
        return this.acesCache.put(this.findAllTransmissionControlTypesKey, tct);
    }

    findModelsByMakeId(makeOrId: AcesData | number, searchOptions: YearOptions): Observable<AcesData[]> | undefined {
        return this.modelCache.get(this.getModelCacheKey(makeOrId, searchOptions));
    }

    cacheModelsByMakeId(
        makeOrId: AcesData | number,
        searchOptions: YearOptions,
        models: Observable<AcesData[]>
    ): Observable<AcesData[]> {
        return this.modelCache.put(this.getModelCacheKey(makeOrId, searchOptions), models);
    }

    findEnginesByMakeIdAndModelId(
        makeOrId: AcesData | number,
        modeOrlId: AcesData | number,
        searchOptions: YearOptions
    ): Observable<AcesData[]> | undefined {
        return this.engineCache.get(this.getEngineCacheKey(makeOrId, modeOrlId, searchOptions));
    }

    cacheEnginesByMakeIdAndModelId(
        makeOrId: AcesData | number,
        modeOrlId: AcesData | number,
        searchOptions: YearOptions,
        engines: Observable<AcesData[]>
    ): Observable<AcesData[]> {
        return this.engineCache.put(this.getEngineCacheKey(makeOrId, modeOrlId, searchOptions), engines);
    }

    /** Returns the cache of all aces vehicle classes. */
    findAllVehicleClasses(): Observable<AcesData[]> | undefined {
        return this.acesCache.get(this.findAllVehicleClassesKey);
    }

    /** Caches an observable of all the aces vehicle classes from the API. */
    cacheAllVehicleClasses(vehicleClasses: Observable<AcesData[]>): Observable<AcesData[]> {
        return this.acesCache.put(this.findAllVehicleClassesKey, vehicleClasses);
    }

    getModelCacheKey(makeOrId: AcesData | number, searchOptions: YearOptions): string {
        const makeId = typeof makeOrId === 'number' ? makeOrId : makeOrId?.id;
        return `${makeId}.${searchOptions?.yearStart}.${searchOptions?.yearEnd}`;
    }

    getEngineCacheKey(makeOrId: AcesData | number, modeOrlId: AcesData | number, searchOptions: YearOptions): string {
        const makeId = typeof makeOrId === 'number' ? makeOrId : makeOrId?.id;
        const modelId = typeof modeOrlId === 'number' ? modeOrlId : modeOrlId?.id;
        return `${makeId}.${modelId}.${searchOptions?.yearStart}.${searchOptions?.yearEnd}`;
    }
}
