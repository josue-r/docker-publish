import { ChangeDetectorRef, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';

@Component({
    selector: 'vioc-angular-paginator',
    template: `
        <mat-paginator
            [length]="length"
            [pageSize]="size"
            [pageSizeOptions]="sizeOptions"
            [showFirstLastButtons]="true"
            [pageIndex]="index"
            (page)="pageChange.emit($event)"
            style="margin: 0 auto; width: max-content"
        >
        </mat-paginator>
    `,
})
export class PaginatorComponent {
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

    @Input() index = 0;

    @Input() size = 20;

    /** Length of the table, this is used to disaply the total number of records */
    @Input() length = 0;

    /** The different avaliable options for records per page. */
    @Input() sizeOptions: number[] = [10, 20, 50];

    /** Emits the page change information whenever a user changes it via the paginator. */
    @Output() pageChange = new EventEmitter<PageEvent>();

    constructor(readonly changeDetectorRef: ChangeDetectorRef) {}

    /**
     * Refreshes the paginator component with the desired values. The component values can get out of sync if a page event's
     * changes get cancelled by the parent component.
     */
    refreshPageValues(): void {
        // The pageSize dropdown within the MatPaginator appears to be using onPush change detection. So, since the
        // input values never change when a page event is cancelled, the only way to update the internal value the
        // component is maintaining is to update the value to something else (null in this case) and then update it
        // back to what it should be.
        this.paginator.pageIndex = null;
        this.paginator.pageSize = null;
        this.changeDetectorRef.detectChanges();
        this.paginator.pageIndex = this.index;
        this.paginator.pageSize = this.size;
        this.changeDetectorRef.detectChanges();
    }
}
