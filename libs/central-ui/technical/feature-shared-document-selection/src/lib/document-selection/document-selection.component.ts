import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
    ViewChild,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatButtonToggleGroup } from '@angular/material/button-toggle';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DocumentFile } from '@vioc-angular/central-ui/technical/data-access-tsb';
import { readFile } from '@vioc-angular/shared/common-functionality';
import { MessageFacade } from '@vioc-angular/shared/data-access-message';
import { CentralValidators } from '@vioc-angular/shared/util-form';
import { ReplaySubject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

@Component({
    selector: 'vioc-angular-document-selection',
    templateUrl: './document-selection.component.html',
    styleUrls: ['./document-selection.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentSelectionComponent implements OnInit, OnDestroy {
    private readonly _destroyed = new ReplaySubject(1);

    /** Button group to select the target type ('documentFile' or 'externalLink') */
    @ViewChild('target', { static: true }) target: MatButtonToggleGroup;

    @Input() documentFile: DocumentFile;

    @Input() externalLink: string = null;

    @Input() documentDisplayWidth = '85%';

    @Input() documentDisplayHeight = '400px';

    @Input() maxWidth = '950px';

    @Input() editable = true;

    @Input() info: string;

    @Output() documentFileChange = new EventEmitter<DocumentFile>();

    @Output() externalLinkChange = new EventEmitter<string>();

    acceptedMediaTypes = ['application/pdf'];

    externalLinkControl: FormControl;

    private _file: File;

    documentContentUrl: SafeResourceUrl;

    constructor(private readonly messageFacade: MessageFacade, private readonly sanitizer: DomSanitizer) {}

    ngOnInit(): void {
        // Create a documentFile if one wasn't provided
        this.documentFile = this.documentFile || new DocumentFile();
        if (this.documentFile.document) {
            this.initializeFile();
        }
        // Initialize external link form control and setup a listener to emit value changes
        this.externalLinkControl = new FormControl(
            { value: this.externalLink, disabled: !this.editable },
            CentralValidators.url()
        );
        this.externalLinkControl.valueChanges
            .pipe(debounceTime(500), takeUntil(this._destroyed))
            .subscribe((value) => this.externalLinkChange.emit(value));
        // Default to externalLink if one is set. Otherwise, default to documentFile
        if (this.externalLink) {
            this.target.value = 'externalLink';
        } else {
            this.target.value = 'documentFile';
        }
    }

    async onFileUpload(files: FileList): Promise<void> {
        if (files?.length > 0) {
            this._file = files[0]; // Only expecting a single file
            this.documentFile.fileName = this._file.name;
            this.documentFile.mimeType = this._file.type;
            this.documentFile.document = await readFile(this._file);
            this.createDocumentContentUrl();
            this.documentFileChange.emit(this.documentFile);
        }
    }

    onFileUploadFailure(): void {
        this.messageFacade.addMessage({
            severity: 'error',
            message: `Invalid file type. Expecting: ${this.acceptedMediaTypes}`,
            hasTimeout: true,
        });
    }

    replaceDocument(): void {
        // Clear out all document file data except the id, the id will stay the same even if the document references a new file
        this.documentFile = { ...new DocumentFile(), id: this.documentFile.id };
        this.documentContentUrl = null;
        if (this.documentFile.id === null) {
            // If this is a transient document, it can just be nulled out. The API currently does not support document
            // deletion, so saved documents cannot be removed.
            this.documentFileChange.emit(null);
        }
    }

    /**
     * Create a file reference out of the base64 string provided by the api. This process helps the page display large files.
     */
    private initializeFile(): void {
        const byteArray = new Uint8Array(
            atob(this.documentFile.document)
                .split('')
                .map((char) => char.charCodeAt(0))
        );
        this._file = new File([byteArray], this.documentFile.fileName, { type: this.documentFile.mimeType });
        this.createDocumentContentUrl();
    }

    /**
     * DomSanitizer is required to display the pdf bytes.
     * https://stackoverflow.com/questions/37927657/img-unsafe-value-used-in-a-resource-url-context
     */
    private createDocumentContentUrl() {
        // This is assuming the user uploaded document is safe.
        // Beware of potential xss risks. See: https://angular.io/guide/security#preventing-cross-site-scripting-xss
        // Risks are reduced due to limiting the user to pdf file types. Therefore, a user can't embed malicious javascript.
        const url = URL.createObjectURL(this._file);
        this.documentContentUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }

    /** Determines if text warning the user that the document won't display at the store renders. */
    get showExternalLinkPrecedenceWarning() {
        return this.externalLinkControl.value && this.documentFile?.fileName;
    }

    get documentDisabled() {
        return !this.editable && !this.documentFile?.fileName;
    }

    get externalLinkDisabled() {
        return !this.editable && !this.externalLinkControl.value;
    }

    ngOnDestroy(): void {
        this._destroyed.next();
        this._destroyed.unsubscribe();
    }
}
