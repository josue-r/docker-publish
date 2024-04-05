import { Component, Input, TemplateRef } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'vioc-angular-dialog',
    template: `
        <ng-container *ngTemplateOutlet="content"></ng-container>
        <ng-container *ngTemplateOutlet="actions"></ng-container>
    `,
})
export class MockDialogComponent {
    @Input() name: string;
    @Input() content: TemplateRef<any>;
    @Input() actions: TemplateRef<any>;

    dialogRef: MatDialogRef<any>;

    open(): void {}
    close(): void {}
}
