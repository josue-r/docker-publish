import { Service } from '@vioc-angular/central-ui/service/data-access-service';
import { Described } from '@vioc-angular/shared/common-functionality';
import { StoreService } from './store-service.model';

/**
 * Used to send information up to the API for which store and services are to be
 * mass added and with what `StoreService` defaults.
 */
export class StoreServiceMassAdd {
    stores?: Described[];
    service?: Service;
    storeService?: StoreService;
}
