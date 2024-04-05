import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
// TODO: 04/03/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
// tslint:disable-next-line: nx-enforce-module-boundaries
import { MenuItem } from '@vioc-angular/central-ui/data-access-menu';

/**
 * A component that represents an element in the sidenav. This can be a root element with an icon or a submenu item.
 * If the given menuItem has children, more SubnavComponents will be nested within this component.
 */
@Component({
    selector: 'vioc-angular-subnav',
    templateUrl: './subnav.component.html',
    styleUrls: ['./subnav.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubnavComponent {
    @Input() menuItem: MenuItem;

    @Input() currentPage = false;

    @Output() navigate = new EventEmitter<string>();

    /** Used to maintain active stylings while the corresponding navmenu is open. */
    active = false;

    /** Used as an input styleClass variable for a material component. */
    readonly subNavClass = 'sub-nav-menu';

    /** Used as an input styleClass variable for a material component. */
    readonly subNavBackDropClass = 'sub-nav-backdrop';

    toggleActive(): void {
        this.active = !this.active;
    }

    /**
     * Add a style class to the overlay displaying the first sub-nav. A class is needed because
     * the querySelector rule isn't sufficient for the animations that get applied to the generated
     * menu to run smoothly.
     *
     * This prevents the menu from being show off the screen if the screen size is too small.
     */
    positionMenu(): void {
        const option: HTMLElement = document.querySelector(
            `.${this.subNavBackDropClass}+.cdk-overlay-connected-position-bounding-box`
        );
        if (option) {
            option.classList.add('sub-nav-overlay');
        } else {
            console.error('Could not find the element to adjust the menu position.');
        }
    }
}
