import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { FileUploadComponent } from './file-upload/file-upload.component';

@NgModule({
    imports: [CommonModule, MatIconModule],
    declarations: [FileUploadComponent],
    exports: [FileUploadComponent],
})
export class UiFileUploadModule {}
