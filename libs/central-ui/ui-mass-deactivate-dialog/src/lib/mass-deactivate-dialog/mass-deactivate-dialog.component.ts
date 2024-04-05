import { SelectionModel } from '@angular/cdk/collections';
import { Component, EventEmitter, OnDestroy, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { AssignmentCount } from '@vioc-angular/shared/common-api-models';
import { DialogComponent } from '@vioc-angular/shared/ui-dialog';
import { Observable, ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'vioc-angular-mass-deactivate-dialog',
    templateUrl: './mass-deactivate-dialog.component.html',
    styleUrls: ['./mass-deactivate-dialog.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class MassDeactivateDialogComponent implements OnDestroy {
    /**
     * Dialog that will display a count of related resources and possible implications prior
     * to deactivating the seleted resources.
     */
    @ViewChild('deactivatedialog', { static: true }) deactivateDialog: DialogComponent;

    /**
     * EventEmitter for calling the appropriate deactivation method.
     */
    @Output() deactivate: EventEmitter<any[]> = new EventEmitter();

    /**
     * List of resources and a count of their associated child resources.
     */
    resources: AssignmentCount[];

    /**
     * SelectionModel for the currently selected data in the dialog table.
     */
    selection: SelectionModel<AssignmentCount> = new SelectionModel(true, [], true);

    /**
     * List of columns that will be displayed in the dialog table.
     */
    displayedColumns: string[] = [];

    /**
     * Determines whether or not data is currently being collected for dialogue.
     */
    isLoading = false;

    private readonly _destroyed = new ReplaySubject(1);

    ngOnDestroy(): void {
        this._destroyed.next();
    }

    /**
     * Triggers the implmenting deactivation method for the selected resources.
     */
    deactivateSelected(): void {
        this.deactivate.emit(this.selection.selected);
        this.reset();
        this.deactivateDialog.close();
    }

    /**
     * Configures the needed columns for displaying implications for the selected resources and opens a dialog.
     */
    openDialog(resourceAssignments: Observable<AssignmentCount[]>): void {
        this.deactivateDialog.open();
        this.isLoading = true;
        resourceAssignments.pipe(takeUntil(this._destroyed)).subscribe(
            (results) => {
                this.resources = results;
                this.configureSupportedColumns();
                this.isLoading = false;
            },
            () => (this.isLoading = false)
        );
        this.deactivateDialog.dialogRef
            .afterClosed()
            .pipe(takeUntil(this._destroyed))
            .subscribe(() => this.reset());
    }

    /**
     * Configures the displayed columns in the dialog.
     */
    configureSupportedColumns(): void {
        if (
            this.resources &&
            this.resources.every(
                (result) => result.companyResourceCount !== null && result.companyResourceCount !== undefined
            )
        ) {
            this.displayedColumns.push('companies');
        }
        if (
            this.resources &&
            this.resources.every(
                (result) => result.storeResourceCount !== null && result.storeResourceCount !== undefined
            )
        ) {
            this.displayedColumns.push('stores');
        }
        if (this.displayedColumns.includes('stores') || this.displayedColumns.includes('companies')) {
            this.displayedColumns = ['select', 'code', ...this.displayedColumns, 'implication'];
        }
    }

    /**
     * Provides the implications of deactivating the selected resources.
     */
    implication(row: AssignmentCount): string {
        // TODO: refactor into message keys
        if (row.storeResourceCount > 0 && row.companyResourceCount > 0) {
            return `Deactivating would also deactivate the corresponding ${row.companyResourceCount} company and ${row.storeResourceCount} store records`;
        } else if (row.companyResourceCount > 0) {
            return `Deactivating would also deactivate the corresponding ${row.companyResourceCount} company records`;
        } else if (row.storeResourceCount > 0) {
            return `Deactivating would also deactivate the corresponding ${row.storeResourceCount} store records`;
        } else {
            return 'Deactivating would affect no other records';
        }
    }

    /**
     * Toggles the selected values in the dialog when no rows are selected, then
     * selects all available rows or when all rows are seleted, then clears the selection.
     */
    masterToggle(): void {
        this.isAllSelected()
            ? this.selection.clear()
            : this.resources.forEach((result) => this.selection.select(result));
    }

    /**
     * Determines if all of the available rows of the table are selected.
     */
    isAllSelected(): boolean {
        return this.resources.every((result) => this.selection.isSelected(result));
    }

    /**
     * Closes the deactivate dialog.
     */
    cancel(): void {
        this.reset();
        this.deactivateDialog.close();
    }

    /**
     * Resets the deactivate dialog resources and selections.
     */
    reset(): void {
        this.displayedColumns = [];
        this.resources = [];
        this.selection.clear();
    }
}
