import { Api, ApiConfig } from '@vioc-angular/shared/util-api';
import { Invoice } from '../models/invoice.model';

export class InvoiceApi extends Api<Invoice, any> {
    constructor(baseUrl: string, config: ApiConfig) {
        super(`${baseUrl}/v1/invoices`, config);
        //super(`http://localhost:9019/v1/invoices`, config);
    }
}
