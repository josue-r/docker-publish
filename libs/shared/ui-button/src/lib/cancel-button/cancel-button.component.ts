import { Component, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'vioc-angular-cancel-button',
    template: ` <button mat-stroked-button id="cancel-action" (click)="cancel()">CANCEL</button> `,
})
export class CancelButtonComponent {
    constructor(private readonly route: ActivatedRoute, private readonly router: Router) {}

    @Input() path: string[] = ['search'];
    @Input() relativeTo: any = this.route.parent;

    cancel(): void {
        this.router.navigate(this.path, { relativeTo: this.relativeTo });
    }
}
