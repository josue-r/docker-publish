import { Pipe, PipeTransform } from '@angular/core';
// TODO: 05/11/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
// tslint:disable-next-line: nx-enforce-module-boundaries
import { MenuItem } from '@vioc-angular/central-ui/data-access-menu';

/**
 * Determines if a MenuItem has child MenuItems.
 */
@Pipe({ name: 'hasChildren' })
export class HasChildrenPipe implements PipeTransform {
    transform(menuItem: MenuItem): boolean {
        return Array.isArray(menuItem.subMenus) && menuItem.subMenus.length > 0;
    }
}
