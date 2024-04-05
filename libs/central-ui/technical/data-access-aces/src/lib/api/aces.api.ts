import { HttpParams } from '@angular/common/http';
import { Api, ApiConfig } from '@vioc-angular/shared/util-api';
import { Observable } from 'rxjs';
import { AcesData } from '../model/aces-data.model';
import { YearOptions } from '../model/year-options';

export class AcesApi extends Api<AcesData, number> {
    constructor(baseUrl: string, config: ApiConfig) {
        super(`${baseUrl}`, config);
        // super(`http://localhost:9017`, config);
    }

    findAllMakes(): Observable<AcesData[]> {
        return super.get(['v1', 'makes'], null, this.contentType);
    }

    findModelsByMakeId(makeId: number, searchOptions: YearOptions = {}): Observable<AcesData[]> {
        return super.get(
            ['v1', 'makes', `${makeId}`, 'models'],
            this.buildYearQueryParams(searchOptions),
            this.contentType
        );
    }

    findEnginesByMakeIdAndModelId(
        makeId: number,
        modelId: number,
        searchOptions: YearOptions = {}
    ): Observable<AcesData[]> {
        return super.get(
            ['v1', 'makes', `${makeId}`, 'models', `${modelId}`, 'engines'],
            this.buildYearQueryParams(searchOptions),
            this.contentType
        );
    }

    findSubModelsByMakeIdAndModelId(
        makeId: number,
        modelId: number,
        searchOptions: YearOptions = {}
    ): Observable<AcesData[]> {
        return super.get(
            ['v1', 'makes', `${makeId}`, 'models', `${modelId}`, 'sub-models'],
            this.buildYearQueryParams(searchOptions),
            this.contentType
        );
    }

    findEngineDesignationsByMakeId(makeId: number, searchOptions: YearOptions = {}): Observable<AcesData[]> {
        return super.get(
            ['v1', 'makes', `${makeId}`, 'engine-designations'],
            this.buildYearQueryParams(searchOptions),
            this.contentType
        );
    }

    findAllFuelTypes(): Observable<AcesData[]> {
        return super.get(['v1', 'fuel-types'], null, this.contentType);
    }

    findAllFuelDeliverySubTypes(): Observable<AcesData[]> {
        return super.get(['v1', 'fuel-delivery-sub-types'], null, this.contentType);
    }

    findAllTransmissionTypes(): Observable<AcesData[]> {
        return super.get(['v1', 'transmission-types'], null, this.contentType);
    }

    findAllTransmissionControlTypes(): Observable<AcesData[]> {
        return super.get(['v1', 'transmission-control-types'], null, this.contentType);
    }

    findAllVehicleClasses(): Observable<AcesData[]> {
        return super.get(['v1', 'vehicle-classes'], null, this.contentType);
    }

    private buildYearQueryParams(searchOptions: YearOptions): HttpParams {
        let httpParams = new HttpParams();
        if (searchOptions.yearStart) {
            httpParams = httpParams.append('yearStart', `${searchOptions.yearStart}`);
        }
        if (searchOptions.yearEnd) {
            httpParams = httpParams.append('yearEnd', `${searchOptions.yearEnd}`);
        }
        return httpParams;
    }
}
