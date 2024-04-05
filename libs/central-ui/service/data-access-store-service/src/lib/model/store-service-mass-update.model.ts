import { Described } from '@vioc-angular/shared/common-functionality';
import { StoreService } from './store-service.model';

export class StoreServiceMassUpdate {
    /**
     * List of stores for the mass update to be applied to
     */
    stores: Described[];

    /**
     * List of services for the mass update to be applied to
     */
    services: Described[];

    /**
     * List of field names to be updated in the mass update. These values for these fields will be taken from the template storeService
     */
    updateFields: string[];

    /**
     * Template to pull values from for the mass update
     */
    storeService: StoreService;
}
