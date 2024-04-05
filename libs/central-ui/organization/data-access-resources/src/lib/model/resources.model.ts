import { Described } from '@vioc-angular/shared/common-functionality';
import { childResource } from './resource.type';

/**
 * Object containing user authorized resources.
 */
export class Resources {
    /**
     * Set of resources the user is authorized to access for the requested roles.
     */
    resources: Described[] | childResource[];
    /**
     * Flag indicating user has access to all companies, which means they have access to all
     * companies, regions, markets, areas, and stores.
     */
    allCompanies: boolean;
}
