import { Component, Input, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/**
 * Component provides a base template and styling for dialogs.
 *
 * Adding content can be done as follows:
 * ```
 * <div dialog-content>
 *  This is test content
 * </div>
 * ```
 *
 * Adding actions can be done as follows:
 * ```
 * <div dialog-actions>
 *  <button mat-button (click)="dialog.close()">Cancel</button>
 *  <button mat-button color="primary">Confirm</button>
 * </div>
 * ```
 */
@Component({
    selector: 'vioc-angular-dialog',
    templateUrl: './dialog.component.html',
    styleUrls: ['./dialog.component.scss'],
})
export class DialogComponent implements OnDestroy {
    /** Dialog template created by this component. */
    @ViewChild('dialog', { static: true }) dialog: TemplateRef<any>;

    /** Input for the dialog header name.*/
    @Input() name: string;

    /** The content of the dialog provided by the parent component. */
    @Input() content: TemplateRef<any>;

    /** The actions of the dialog provided by the parent component. */
    @Input() actions: TemplateRef<any>;

    /**
     * Reference to the dialog template created that is used to manage the dialogs state.
     */
    dialogRef: MatDialogRef<any>;

    private readonly _destroyed = new ReplaySubject(1);

    constructor(private readonly dialogService: MatDialog) {}

    ngOnDestroy(): void {
        this._destroyed.next();
        this._destroyed.unsubscribe();
    }

    /**
     * Opens the dialog template using the `dialogService` and assigns a reference to the `dialogRef`.
     */
    open(): void {
        this.dialogRef = this.dialogService.open(this.dialog);
        this.dialogRef
            .backdropClick()
            .pipe(takeUntil(this._destroyed))
            .subscribe(() => this.close());
    }

    /**
     * Uses the `dialogRef` to close the dialog.
     */
    close(): void {
        this.dialogRef.close();
    }
}
