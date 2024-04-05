import { Described } from '@vioc-angular/shared/common-functionality';
import { Company } from './company.model';
import { Market } from './market.model';
import { Region } from './region.model';

export interface Area extends Described {
    company?: Company;
    region?: Region;
    market?: Market;
}
