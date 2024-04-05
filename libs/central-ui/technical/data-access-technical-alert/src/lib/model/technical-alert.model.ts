import { Product } from '@vioc-angular/central-ui/product/data-access-product';
import { DocumentFile, YearMakeModelEngine } from '@vioc-angular/central-ui/technical/data-access-tsb';
import { Audited } from '@vioc-angular/shared/common-functionality';
import { TechnicalAlertActiveScreen } from './technical-alert-active-screen.model';
import { TechnicalAlertPassiveScreen } from './technical-alert-passive-screen.model';

export class TechnicalAlert implements Audited {
    id?: number = null;
    name?: string = null;
    active?: boolean = null;
    comments?: string = null;
    documentFile?: DocumentFile = null;
    product?: Product = null;
    externalLink?: string = null;
    updatedOn?: string = null;
    updatedBy?: string = null;
    version?: number = null;
    activeScreens: TechnicalAlertActiveScreen[] = [];
    passiveScreens: TechnicalAlertPassiveScreen[] = [];
    vehicles: YearMakeModelEngine[] = [];
}
