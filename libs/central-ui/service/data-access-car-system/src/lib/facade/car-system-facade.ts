import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { defaultIfNullOrUndefined, Described } from '@vioc-angular/shared/common-functionality';
import { GATEWAY_TOKEN } from '@vioc-angular/shared/util-api';
import { DynamicDropdownColumn, DynamicDropdownConfig, DynamicDropdownOptions } from '@vioc-angular/shared/util-column';
import { tap } from 'rxjs/operators';
import { CarSystemApi } from '../api/car-system-api';

@Injectable()
export class CarSystemFacade {
    private readonly api: CarSystemApi;
    readonly searchColumns = new SearchColumns(this);

    constructor(@Inject(GATEWAY_TOKEN) gateway: string, http: HttpClient) {
        this.api = new CarSystemApi(gateway, { http });
    }

    findActive() {
        return this.api.findActive();
    }
}
class SearchColumns {
    constructor(private readonly facade: CarSystemFacade) {}

    /**
     * Build a dropdown for car System for categories.
     *
     * @param {({ name?: string; apiFieldPath: string })} config
     * @param {DynamicDropdownOptions} [overrides={}]
     * @returns
     * @memberof SearchColumns
     */
    dropdown(
        config: {
            /** @{link DynamicDropdownOptions.name}. If not set, it will default to `'Car System'`  */
            name?: string;
            /** @{link DropdownOptions.apiFieldPath}  */
            apiFieldPath: string;
        },
        overrides: DynamicDropdownOptions<Described> = {}
    ) {
        config = { ...config }; // copy to prevent updating original
        const dropdownConfig: DynamicDropdownConfig<Described> = {
            type: { entityType: 'carSystem' }, // this is defined in core-micro-service
            hint: `${config.name} Code`,
            name: config.name,
            ...overrides,
            apiFieldPath: config.apiFieldPath,
            fetchData: () =>
                this.facade.findActive().pipe(
                    tap((c) => {
                        c.sort(Described.codeComparator);
                    })
                ),
        };
        defaultIfNullOrUndefined(dropdownConfig, 'apiSortPath', `${config.apiFieldPath}.code`);
        return DynamicDropdownColumn.ofDescribed(dropdownConfig);
    }
}
