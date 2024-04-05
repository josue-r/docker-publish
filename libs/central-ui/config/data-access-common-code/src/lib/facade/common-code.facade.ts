import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
// tslint:disable-next-line: nx-enforce-module-boundaries
import { SearchPageFacade } from '@vioc-angular/central-ui/feature-search-page';
import { QuerySearch } from '@vioc-angular/shared/common-api-models';
import { defaultIfNullOrUndefined, Described } from '@vioc-angular/shared/common-functionality';
import { EntityPatch, GATEWAY_TOKEN, ResponseEntity } from '@vioc-angular/shared/util-api';
import { DynamicDropdownColumn, DynamicDropdownConfig, DynamicDropdownOptions } from '@vioc-angular/shared/util-column';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CommonCodeApi } from '../api/common-code.api';
import { CommonCode, CommonCodeId } from '../model/common-code.model';
import { CommonCodeState } from '../state/common-code.state';

@Injectable()
export class CommonCodeFacade implements SearchPageFacade<CommonCode> {
    private readonly api: CommonCodeApi;
    readonly searchColumns = new SearchColumns(this);

    constructor(@Inject(GATEWAY_TOKEN) gateway: string, http: HttpClient, private readonly state: CommonCodeState) {
        this.api = new CommonCodeApi(`${gateway}config`, { http });
    }

    search(querySearch: QuerySearch): Observable<ResponseEntity<CommonCode>> {
        return this.api.query(querySearch);
    }

    // To be enabled with edit screen
    entityPatch(patches: EntityPatch<CommonCodeId>[]): Observable<Object> {
        return this.api.entityPatch(['patch'], ...patches);
    }

    dataSync(ids: CommonCodeId[]): Observable<number> {
        return this.api.dataSync(ids);
    }

    save(commonCode: CommonCode): Observable<Object> {
        return this.api.save(commonCode);
    }

    findByTypeAndCode(type: string, code: string): Observable<CommonCode> {
        return this.api.findByTypeAndCode(type, code);
    }

    /** Fetches all common codes for the specified type. */
    findByType(
        type: string,
        active?: boolean,
        ...sort: { field: keyof CommonCode; direction: 'asc' | 'desc' }[]
    ): Observable<Described[]> {
        type = type.toUpperCase();
        const querySort = sort.map((s) => `${s.field},${s.direction}`);
        // If the state has the common codes for this type cached, return them.  Otherwise, trigger cache initialization
        return (
            this.state.findByType(type, active) ||
            this.state.cacheByType(type, this.api.findByType(type, active, querySort), active)
        );
    }
}

// TODO: To discuss if this is the approach to follow
export interface CommonCodeSearchConfig {
    /** The `CommonCode.type` */
    type: string;
    /** @{link DropdownOptions.name}  */
    name: string;
    /** @{link DropdownOptions.apiFieldPath}  */
    apiFieldPath: string;
    /** @{link DropdownOptions.type.entityType}  */
    entityType: string;
}

class SearchColumns {
    constructor(private readonly facade: CommonCodeFacade) {}

    /**
     * Creates a common code dropdown that displays only the code.
     *
     * @param {CommonCodeSearchConfig} config
     * @param {DropdownOptions} [overrides={}]
     * @returns
     * @memberof SearchColumns
     */
    codeDropdown(
        config: CommonCodeSearchConfig,
        overrides: DynamicDropdownOptions<Described> = {},
        _filter: (v?: any) => boolean = () => true
    ): DynamicDropdownColumn<Described> {
        const options: DynamicDropdownConfig<Described> = {
            // Overrides
            ...overrides,
            // Explicit config takes highest precedence
            name: config.name,
            apiFieldPath: config.apiFieldPath,
            type: { entityType: config.entityType },
            fetchData: () =>
                this.facade
                    .findByType(config.type, true, { field: 'code', direction: 'asc' })
                    .pipe(map((cc) => cc.filter(_filter))),
        };
        this.defaultMappers(options, Described.codeMapper);
        return DynamicDropdownColumn.ofDescribed(options);
    }

    /**
     * Creates a common code dropdown that displays the code and description.
     *
     * @param {CommonCodeSearchConfig} config
     * @param {DropdownOptions} [overrides={}]
     * @returns
     * @memberof SearchColumns
     */
    codeAndDescriptionDropdown(
        config: CommonCodeSearchConfig,
        overrides: DynamicDropdownOptions<Described> = {}
    ): DynamicDropdownColumn<Described> {
        // codeAndDescription essentially the same as code for sorting purposes since code is unique
        const options: DynamicDropdownOptions<Described> = { ...overrides };
        this.defaultMappers(options, Described.codeAndDescriptionMapper);
        return this.codeDropdown(config, options);
    }

    /**
     * Creates a common code dropdown that displays only the description.
     *
     * @param {CommonCodeSearchConfig} config
     * @param {DropdownOptions} [overrides={}]
     * @returns
     * @memberof SearchColumns
     */
    descriptionDropdown(
        config: CommonCodeSearchConfig,
        overrides: DynamicDropdownOptions<Described> = {}
    ): DynamicDropdownColumn<Described> {
        const options: DynamicDropdownConfig<Described> = {
            // Overrides
            ...overrides,
            // Explicit config takes highest precedence
            name: config.name,
            apiFieldPath: config.apiFieldPath,
            type: { entityType: config.entityType },
            fetchData: () => this.facade.findByType(config.type, true, { field: 'description', direction: 'asc' }),
        };
        this.defaultMappers(options, Described.descriptionMapper);
        return DynamicDropdownColumn.ofDescribed(options);
    }

    private defaultMappers(options: DynamicDropdownOptions<any>, mapper: (d: Described) => string) {
        defaultIfNullOrUndefined(options, 'mapToTableDisplay', mapper);
        defaultIfNullOrUndefined(options, 'mapToDropdownDisplay', mapper);
    }
}
