import { IdValueModel } from './id-value.interface';

export class TransferCaseTorque {
    id: number = null;
    type?: string = '';
    fillPlugTorqueFtLbs?: string = '';
    drainPlugTorqueFtLbs?: string = '';
    notes?: IdValueModel[] = [];
}
