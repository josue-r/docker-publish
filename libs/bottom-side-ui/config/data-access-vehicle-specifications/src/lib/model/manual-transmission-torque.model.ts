import { IdValueModel } from './id-value.interface';

export class ManualTransmissionTorque {
    id: number = null;
    type?: string = '';
    fillPlugTorqueFtLbs?: string = '';
    drainPlugTorqueFtLbs?: string = '';
    notes?: IdValueModel[] = [];
}
