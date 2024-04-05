import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { defaultIfNullOrUndefined, Described } from '@vioc-angular/shared/common-functionality';
import { GATEWAY_TOKEN } from '@vioc-angular/shared/util-api';
import { DynamicDropdownColumn, DynamicDropdownConfig, DynamicDropdownOptions } from '@vioc-angular/shared/util-column';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { VendorApi } from '../api/vendor-api';
import { VendorState } from '../state/vendor-state';

@Injectable()
export class VendorFacade {
    private readonly api: VendorApi;
    readonly searchColumns = new SearchColumns(this);

    constructor(@Inject(GATEWAY_TOKEN) gateway: string, http: HttpClient, private readonly state: VendorState) {
        this.api = new VendorApi(gateway, { http });
    }

    findByStore(storeNumber: string): Observable<Described[]> {
        return this.findByStores([storeNumber]).pipe(
            // returning the sorted list for vendors
            map((vendors) => {
                vendors.sort((v1, v2) => v1.description.localeCompare(v2.description));
                return vendors;
            })
        );
    }

    findByStores(storeNumbers: string[]): Observable<Described[]> {
        return (
            this.state.findByStores(storeNumbers) ||
            this.state.cacheByStores(storeNumbers, this.api.findByStores(storeNumbers))
        );
    }

    findAllAccessibleActive(): Observable<Described[]> {
        return (
            this.state.findAllAccessibleActive() ||
            this.state.cacheByAccessibleActive(this.api.findAllAccessibleActive())
        );
    }
}

class SearchColumns {
    constructor(private readonly facade: VendorFacade) {}

    /**
     * Build a dropdown for vendor.
     *
     * @param {({ name?: string; level: 'LEAF' | 'ROOT' | 'ALL'; apiFieldPath: string })} config
     * @param {DynamicDropdownOptions} [overrides={}]
     * @returns
     * @memberof SearchColumns
     */
    dropdown(
        config: {
            /** @{link DynamicDropdownOptions.name}. If not set, it will default to `'Vendor'`.  */
            name?: string;
            /** @{link DropdownOptions.apiFieldPath}  */
            apiFieldPath: string;
            /** storeNumber parameter to be used in the @{link VendorFacade.findByStores} */
            storeNumbers: string[];
        },
        overrides: DynamicDropdownOptions<Described> = {}
    ) {
        defaultIfNullOrUndefined(config, 'name', 'Vendor');
        const dropdownConfig: DynamicDropdownConfig<Described> = {
            type: { entityType: 'vendor' },
            hint: `${config.name} Code`,
            name: config.name,
            ...overrides,
            apiFieldPath: config.apiFieldPath,
            fetchData: () =>
                this.facade.findByStores(config.storeNumbers).pipe(
                    tap((c) => {
                        c.sort(Described.codeComparator);
                    })
                ),
        };
        defaultIfNullOrUndefined(dropdownConfig, 'apiSortPath', `${config.apiFieldPath}.code`);
        return DynamicDropdownColumn.ofDescribed(dropdownConfig);
    }

    /**
     * Build a dropdown for vendor.
     *
     * @param {({ name?: string; level: 'LEAF' | 'ROOT' | 'ALL'; apiFieldPath: string })} config
     * @param {DynamicDropdownOptions} [overrides={}]
     * @returns
     * @memberof SearchColumns
     */
    descriptionDropdown(
        config: {
            /** @{link DynamicDropdownOptions.name}. If not set, it will default to `'Vendor'`.  */
            name?: string;
            /** @{link DropdownOptions.apiFieldPath}  */
            apiFieldPath: string;
        },
        overrides: DynamicDropdownOptions<Described> = {}
    ) {
        defaultIfNullOrUndefined(config, 'name', 'Vendor');
        const dropdownConfig: DynamicDropdownConfig<Described> = {
            type: { entityType: 'vendor' },
            hint: `${config.name} Description`,
            name: config.name,
            ...overrides,
            apiFieldPath: config.apiFieldPath,
            fetchData: () =>
                this.facade.findAllAccessibleActive().pipe(
                    tap((c) => {
                        c.sort(Described.codeComparator);
                    })
                ),
        };
        defaultIfNullOrUndefined(dropdownConfig, 'apiSortPath', `${config.apiFieldPath}.description`);
        return DynamicDropdownColumn.ofDescribed(dropdownConfig);
    }
}
