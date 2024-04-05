import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
// TODO: 04/03/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
// tslint:disable-next-line: nx-enforce-module-boundaries
import { ActiveMenu, MenuItem } from '@vioc-angular/central-ui/data-access-menu';

/**
 * The component housing everything included in the sidenav: the home logo, nav search, and each menuItems subnav.
 */
@Component({
    selector: 'vioc-angular-sidenav',
    templateUrl: './sidenav.component.html',
    styleUrls: ['./sidenav.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidenavComponent {
    @Input() menu: MenuItem[] = [];

    @Input() activeMenu: ActiveMenu;

    @Input() homeLogo: string;

    @Output() navigate = new EventEmitter<string>();

    @Output() goHome = new EventEmitter<void>();

    /* Determine if this menuItem is the currently active one. */
    isCurrentPage(menuItem: MenuItem): boolean {
        return this.activeMenu && this.activeMenu.rootMenu && this.activeMenu.rootMenu.name === menuItem.name;
    }
}
