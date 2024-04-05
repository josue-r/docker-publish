import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MockFileUploadComponent } from './file-upload.component.mock';

@NgModule({
    imports: [CommonModule],
    declarations: [MockFileUploadComponent],
    exports: [MockFileUploadComponent],
})
export class UiFileUploadMockModule {}
