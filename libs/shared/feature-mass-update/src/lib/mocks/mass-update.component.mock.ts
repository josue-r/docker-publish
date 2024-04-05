import { Component, Input, TemplateRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Columns } from '@vioc-angular/shared/util-column';

@Component({
    selector: 'vioc-angular-mass-update',
    template: `
        <ng-container *ngIf="templateMap">
            <ng-container *ngFor="let template of templateMap | keyvalue">
                <ng-container *ngTemplateOutlet="template.value"></ng-container>
            </ng-container>
        </ng-container>
    `,
})
export class MockMassUpdateComponent {
    @Input() columns: Columns;
    @Input() templateMap: Map<string, TemplateRef<any>>;
    @Input() updatableFieldForm: FormGroup;
    @Input() nested = false;
    @Input() grouped = false;
    reset() {}
    constructor() {}
}
