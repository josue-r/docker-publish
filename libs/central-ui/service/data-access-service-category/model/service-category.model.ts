import { ServiceCategoryCarFaxMapping } from '@vioc-angular/central-ui/service/data-access-car-fax-mapping';
import { Audited, Described } from '@vioc-angular/shared/common-functionality';
import { PreventativeMaintenanceQualifier } from './preventative-maintenance-qualifier.model';
import { ServiceCategoryInfo } from './service-category-info.model';
import { ServiceCategoryMotorInfo } from './service-category-motor-info.model';

export class ServiceCategory extends Described implements Audited {
    id?: number;
    code?: string = null;
    description?: string = null;
    active?: boolean = null;
    parentCategory?: Described = null;
    defaultService?: Described = null;
    nacsProductCode?: Described = null;
    fleetProductCode?: Described = null;
    nocrGroup?: Described = null;
    premium?: boolean = null;
    excludeFromMetrics?: boolean = null;
    serviceInfo?: ServiceCategoryInfo = null;
    motorInfo?: ServiceCategoryMotorInfo[] = [];
    preventativeMaintenanceQualifiers?: PreventativeMaintenanceQualifier[] = [];
    carFaxMapping?: ServiceCategoryCarFaxMapping[] = [];
    version?: number = null;
    updatedOn?: string = null;
    updatedBy?: string = null;
}
