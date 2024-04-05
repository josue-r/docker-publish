import { Component, Input, TemplateRef } from '@angular/core';

/**
 * A component to be used as the header of the app. This provides an implementation
 * of mat-toolbar and provides an outlet for an app menu and an application logo.
 */
@Component({
    selector: 'vioc-angular-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
    @Input() styles: any;

    @Input() appMenu: TemplateRef<any>;

    @Input() appLogo: TemplateRef<any>;

    @Input() title: string;
}
