import { Component } from '@angular/core';

/**
 * Component to be displayed when the user interacts with a page that could not be found.
 */
@Component({
    selector: 'vioc-angular-page-not-found',
    template: ` <p> The page requested does not exist or is currently unavailable. </p> `,
})
export class PageNotFoundComponent {
    constructor() {}
}
