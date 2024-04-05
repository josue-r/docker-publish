import { Described } from '@vioc-angular/shared/common-functionality';

export class ServiceCategoryInfo extends Described {
    id?: number;
    serviceCategory?: Described = null;
    appearOnWorkOrder?: boolean = null;
    carSystem?: Described = null;
    serviceTime?: string = null;
    competitivePrice?: number = null;
    importance?: string = null;
    customerDisplayName?: string = null;
    technicalInformationRequired?: boolean = null;
    recommendationOrder?: number = null;
    reportGroup?: Described = null;
    version?: number = null;
}
