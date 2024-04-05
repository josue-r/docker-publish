import { Audited, Described } from '@vioc-angular/shared/common-functionality';
import { DocumentFile } from './document-file.model';
import { YearMakeModelEngine } from './year-make-model-engine.model';

export class Tsb implements Audited {
    id?: number = null;
    name?: string = null;
    active?: boolean = null;
    serviceCategory?: Described = null;
    externalLink?: string = null;
    documentFile?: DocumentFile = null;
    updatedOn?: string = null;
    updatedBy?: string = null;
    version?: number = null;
    vehicles?: YearMakeModelEngine[] = [];
}
