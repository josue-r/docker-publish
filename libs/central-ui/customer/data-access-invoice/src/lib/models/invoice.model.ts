import { Described } from '@vioc-angular/shared/common-functionality';
import { CustomerAddress } from './invoice-customer-address.model';
import { Customer } from './invoice-customer.model';
import { Vehicle } from './invoice-vehicle.model';

export class Invoice {
    id?: number = null;
    invoiceNumber?: number = null;
    customer?: Customer = null;
    customerAddress?: CustomerAddress = null;
    store?: Described = null;
    vehicle?: Vehicle = null;
    amount?: number = null;
}
