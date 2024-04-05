import { IdValueModel } from './id-value.interface';

export class OilFilterTorque {
    id: number = null;
    qualifier?: string = '';
    torque_f?: string = '';
    torque_n?: string = '';
    type?: string = '';
    oilFilterProcedure?: IdValueModel[] = [];
    oilFilterType?: IdValueModel[] = [];
    notes?: IdValueModel[] = [];
}
