import { SelectionModel } from '@angular/cdk/collections';
import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { AssignmentCount } from '@vioc-angular/shared/common-api-models';
import { MockDialogComponent } from '@vioc-angular/shared/ui-dialog';
import { Observable } from 'rxjs';

@Component({
    selector: 'vioc-angular-mass-deactivate-dialog',
    template: '',
})
export class MockMassDeactivateDialogComponent {
    @ViewChild(MockDialogComponent, { static: true }) deactivateDialog: MockDialogComponent;

    @Output() deactivate: EventEmitter<any[]> = new EventEmitter();

    resources: AssignmentCount[];
    selection: SelectionModel<AssignmentCount> = new SelectionModel(true, [], true);
    displayedColumns: string[] = [];
    isLoading = false;

    deactivateSelected(): void {}
    openDialog(resourceAssignments: Observable<AssignmentCount[]>): void {}
}
