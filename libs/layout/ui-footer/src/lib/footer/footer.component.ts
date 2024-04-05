import { Component, Input } from '@angular/core';

/**
 * Adds a footer to the page adding copyright info and a link to the terms of use.
 */
@Component({
    selector: 'vioc-angular-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.scss'],
})
export class FooterComponent {
    constructor() {
        this.currentYear = new Date().getFullYear();
    }

    currentYear: number;

    @Input() version: string;
}
