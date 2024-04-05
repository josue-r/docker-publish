import { Described } from '@vioc-angular/shared/common-functionality';
import { Company } from './company.model';
import { Region } from './region.model';

export interface Market extends Described {
    company?: Company;
    region?: Region;
}
