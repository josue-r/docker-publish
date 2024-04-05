import { Described } from '@vioc-angular/shared/common-functionality';
import { Area } from './area.model';
import { Company } from './company.model';
import { Market } from './market.model';
import { Region } from './region.model';

export interface Store extends Described {
    company?: Company;
    region?: Region;
    market?: Market;
    area?: Area;
}
