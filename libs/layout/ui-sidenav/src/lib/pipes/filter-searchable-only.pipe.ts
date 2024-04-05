import { Pipe, PipeTransform } from '@angular/core';
// TODO: 05/11/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
// tslint:disable-next-line: nx-enforce-module-boundaries
import { MenuItem } from '@vioc-angular/central-ui/data-access-menu';
import { isNullOrUndefined } from '@vioc-angular/shared/common-functionality';

/**
 * Filters out searchable only MenuItems.
 */
@Pipe({ name: 'filterSearchableOnly' })
export class FilterSearchableOnlyPipe implements PipeTransform {
    transform(menuItems: MenuItem[]): MenuItem[] {
        return menuItems.filter((menuItem) => isNullOrUndefined(menuItem.searchableOnly) || !menuItem.searchableOnly);
    }
}
