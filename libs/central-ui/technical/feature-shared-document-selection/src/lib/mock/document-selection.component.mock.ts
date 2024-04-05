import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DocumentFile } from '@vioc-angular/central-ui/technical/data-access-tsb';

@Component({
    selector: 'vioc-angular-document-selection',
    template: '',
})
export class MockDocumentSelectionComponent {
    @Input() documentFile: DocumentFile;
    @Input() externalLink: string = null;
    @Input() documentDisplayWidth = '85%';
    @Input() documentDisplayHeight = '500px';
    @Input() maxWidth = '950px';
    @Input() editable = true;
    @Input() info: string;
    @Output() documentFileChange = new EventEmitter<DocumentFile>();
    @Output() externalLinkChange = new EventEmitter<string>();
}
