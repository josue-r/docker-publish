import { Described } from '@vioc-angular/shared/common-functionality';
import { Company } from './company.model';

export interface Region extends Described {
    company?: Company;
}
