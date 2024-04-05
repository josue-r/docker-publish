import { NgModule } from '@angular/core';
import { UiDialogMockModule } from '@vioc-angular/shared/ui-dialog';
import { MockMassDeactivateDialogComponent } from './mass-deactivate-dialog.component.mock';

@NgModule({
    imports: [UiDialogMockModule],
    declarations: [MockMassDeactivateDialogComponent],
    exports: [MockMassDeactivateDialogComponent],
})
export class UiMassDeactivateDialogMockModule {}
