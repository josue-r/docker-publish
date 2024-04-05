import { Described } from '@vioc-angular/shared/common-functionality';

export class ServiceCategoryCarFaxMapping extends Described {
    id?: number;
    serviceCategory?: Described = null;
    carFaxServiceName?: string = null;
    excludeFromMapping?: boolean = null;
    version?: number = null;
}
