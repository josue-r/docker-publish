import { Service } from '@vioc-angular/central-ui/service/data-access-service';
import { Described } from '@vioc-angular/shared/common-functionality';
import { CompanyService } from './company-service.model';
/**
 * Used to send information up to the API for which company and services are to be
 * mass added and with what `CompanyService` defaults.
 */
export class CompanyServiceMassAdd {
    companies: Described[] = null;
    services: Service[] = null;
    /* CompanyService acts as the "template" for the add changes. */
    companyService: CompanyService = null;
    /* Preview refers to the preview created on the last page of the mass add screen
       via the company and service codes. False if form invalid and cannot preview. */
    preview: boolean = null;

    constructor(companyService: CompanyService, preview = false) {
        this.companyService = companyService;
        this.preview = preview;
    }
}
