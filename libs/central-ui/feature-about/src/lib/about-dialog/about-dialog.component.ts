import { Component, ViewChild } from '@angular/core';
import { DialogComponent } from '@vioc-angular/shared/ui-dialog';

@Component({
    selector: 'vioc-angular-about-dialog',
    templateUrl: './about-dialog.component.html',
})
export class AboutDialogComponent {
    @ViewChild(DialogComponent, { static: true }) public dialog: DialogComponent;

    open() {
        this.dialog.open();
    }

    close() {
        this.dialog.close();
    }
}
