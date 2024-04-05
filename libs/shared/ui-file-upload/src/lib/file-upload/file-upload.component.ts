import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';

@Component({
    selector: 'vioc-angular-file-upload',
    templateUrl: './file-upload.component.html',
    styleUrls: ['./file-upload.component.scss'],
})
export class FileUploadComponent {
    /** Controls wether the user can select multiple files. Defaults to a single file at a time. */
    @Input() multiple = false;

    /**
     * Media types the user is allowed to upload. This is based on the extension of the file uploaded.
     * If no acceptedMediaTypes are provided, this will assume any media type is valid.
     */
    @Input() acceptedMediaTypes: string[] = [];

    /** Emits a `FileList` containing the `File` references the user has selected/dragged. */
    @Output() upload = new EventEmitter<FileList>();

    /** Emits when a file can't be uploaded. Currently emmitted when the file type is not valid. */
    @Output() uploadFailure = new EventEmitter<void>();

    @HostListener('drop', ['$event']) onDrop(event: DragEvent): void {
        event.preventDefault();
        event.stopPropagation();
        const files = event.dataTransfer.files;
        this.onFileSelection(files);
    }

    /**
     * A file or multiple files have either been browsed and selected or dragged and dropped.
     * Dragging and dropping would result in a files object containing a single file, but browsing
     * could result in multiple files if multiple is true.
     */
    onFileSelection(files: FileList): void {
        if (this.mediaTypesValid(files)) {
            this.upload.emit(files);
        } else {
            this.uploadFailure.emit();
        }
    }

    private mediaTypesValid(files: FileList): boolean {
        // If no acceptedMediaTypes provided, assume all media types are valid
        if (this.acceptedMediaTypes.length) {
            // Doing an indexed for loop because a FileList is not actually an array
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                // Verify each file type is included in the acceptedMediaTypes array
                if (!this.acceptedMediaTypes.some((mediaType) => file.type === mediaType)) {
                    return false;
                }
            }
        }
        return true;
    }
}
