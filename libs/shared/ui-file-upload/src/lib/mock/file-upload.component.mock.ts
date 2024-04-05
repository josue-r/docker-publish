import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'vioc-angular-file-upload',
    template: '',
})
export class MockFileUploadComponent {
    @Input() multiple = false;
    @Input() acceptedMediaTypes: string[] = [];
    @Output() upload = new EventEmitter<FileList>();
    @Output() uploadFailure = new EventEmitter<void>();
}
