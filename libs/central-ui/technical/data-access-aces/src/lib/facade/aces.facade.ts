import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { defaultIfNullOrUndefined, Described } from '@vioc-angular/shared/common-functionality';
import { GATEWAY_TOKEN } from '@vioc-angular/shared/util-api';
import {
    Comparators,
    DynamicDropdownColumn,
    DynamicDropdownConfig,
    DynamicDropdownOptions,
} from '@vioc-angular/shared/util-column';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AcesData } from '../..';
import { AcesApi } from '../api/aces.api';
import { YearOptions } from '../model/year-options';
import { AcesState } from '../state/aces.state';

@Injectable()
export class AcesFacade {
    private readonly api: AcesApi;
    readonly searchColumns = new SearchColumns(this);

    constructor(@Inject(GATEWAY_TOKEN) gateway: string, http: HttpClient, private readonly state: AcesState) {
        this.api = new AcesApi(`${gateway}vehicle-technical`, { http });
    }

    findAllMakes(): Observable<AcesData[]> {
        return this.state.findAllMakes() || this.state.cacheAllMakes(this.api.findAllMakes());
    }

    findModelsByMakeId(makeOrId: AcesData | number, searchOptions: YearOptions = {}): Observable<AcesData[]> {
        return (
            this.state.findModelsByMakeId(makeOrId, searchOptions) ||
            this.state.cacheModelsByMakeId(
                makeOrId,
                searchOptions,
                this.api.findModelsByMakeId(this.unwrap(makeOrId), searchOptions)
            )
        );
    }

    findEnginesByMakeIdAndModelId(
        makeOrId: AcesData | number,
        modeOrlId: AcesData | number,
        searchOptions: YearOptions = {}
    ): Observable<AcesData[]> {
        return (
            this.state.findEnginesByMakeIdAndModelId(makeOrId, modeOrlId, searchOptions) ||
            this.state.cacheEnginesByMakeIdAndModelId(
                makeOrId,
                modeOrlId,
                searchOptions,
                this.api
                    .findEnginesByMakeIdAndModelId(this.unwrap(makeOrId), this.unwrap(modeOrlId), searchOptions)
                    .pipe(
                        map((engines) =>
                            // include the id in the description.  This makes it easier to tell things apart over multiple years
                            engines.map((acesData) => ({
                                ...acesData,
                                description: `${acesData.description} (${acesData.id})`,
                            }))
                        )
                    )
            )
        );
    }

    findSubModelsByMakeIdAndModelId(
        makeOrId: AcesData | number,
        modeOrlId: AcesData | number,
        searchOptions: YearOptions = {}
    ): Observable<AcesData[]> {
        return this.api.findSubModelsByMakeIdAndModelId(this.unwrap(makeOrId), this.unwrap(modeOrlId), searchOptions);
    }

    findEngineDesignationsByMakeId(
        makeOrId: AcesData | number,
        searchOptions: YearOptions = {}
    ): Observable<AcesData[]> {
        return this.api.findEngineDesignationsByMakeId(this.unwrap(makeOrId), searchOptions);
    }

    findAllFuelTypes(): Observable<AcesData[]> {
        return this.state.findAllFuelTypes() || this.state.cacheAllFuelTypes(this.api.findAllFuelTypes());
    }

    findAllFuelDeliverySubTypes(): Observable<AcesData[]> {
        return (
            this.state.findAllFuelDeliverySubTypes() ||
            this.state.cacheAllFuelDeliverySubTypes(this.api.findAllFuelDeliverySubTypes())
        );
    }

    findAllTransmissionTypes(): Observable<AcesData[]> {
        return (
            this.state.findAllTransmissionTypes() ||
            this.state.cacheAllTransmissionTypes(this.api.findAllTransmissionTypes())
        );
    }

    findAllTransmissionControlTypes(): Observable<AcesData[]> {
        return (
            this.state.findAllTransmissionControlTypes() ||
            this.state.cacheAllTransmissionControlTypes(this.api.findAllTransmissionControlTypes())
        );
    }

    findAllVehicleClasses(): Observable<AcesData[]> {
        return (
            this.state.findAllVehicleClasses() || this.state.cacheAllVehicleClasses(this.api.findAllVehicleClasses())
        );
    }

    private unwrap(idOrAcesData: number | AcesData): number {
        if (typeof idOrAcesData === 'number') {
            return idOrAcesData;
        } else {
            return idOrAcesData.id;
        }
    }
}

class SearchColumns {
    constructor(private readonly facade: AcesFacade) {}

    /**
     * Build a dropdown for Aces Makes.
     *
     * @param {({ name?: string; apiFieldPath: string })} config
     * @param {DynamicDropdownOptions} [overrides={}]
     * @returns
     * @memberof SearchColumns
     */
    makeDropdown(
        config: {
            /** @{link DynamicDropdownOptions.name}. If not set, it will default to `'Make'`  */
            name?: string;
            /** @{link DropdownOptions.apiFieldPath}  */
            apiFieldPath: string;
        },
        overrides: DynamicDropdownOptions<AcesData> = {}
    ) {
        config = { ...config }; // copy to prevent updating original
        defaultIfNullOrUndefined(config, 'name', 'Make');
        defaultIfNullOrUndefined(config, 'apiFieldPath', 'makeId');
        const dropdownConfig: DynamicDropdownConfig<AcesData> = {
            type: 'integer',
            hint: `Make`,
            name: config.name,
            ...overrides,
            apiFieldPath: config.apiFieldPath,
            apiSortPath: `${config.apiFieldPath}.description`,
            fetchData: () => this.facade.findAllMakes(),
            mapToDropdownDisplay: Described.descriptionMapper,
            mapToKey: Described.idMapper,
            // in for child l
            comparators: [Comparators.equalTo, Comparators.notEqualTo],
        };
        return DynamicDropdownColumn.ofDescribed(dropdownConfig);
    }
}
