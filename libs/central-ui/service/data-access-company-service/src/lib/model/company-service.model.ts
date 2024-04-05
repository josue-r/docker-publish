import { Audited, Described } from '@vioc-angular/shared/common-functionality';
import { PricingStrategy } from './pricing-strategy';

export class CompanyService implements Audited {
    id?: {
        serviceId: number;
        companyId: number;
    } = null;
    version?: number = null;
    active?: boolean = null;
    company?: Described = null;
    service?: Described = null;
    salesAccount?: Described = null;
    costAccount?: Described = null;
    pricingStrategy?: PricingStrategy = null;
    updatedOn?: string = null;
    updatedBy?: string = null;
}
