import { IdValueModel } from './id-value.interface';

export class Part {
    id: string = null;
    part?: string = '';
    notes?: IdValueModel[] = [];
    qualifier?: string = '';
    type?: string = '';
}

export enum PartTypeApiEnum {
    AIR_FILTER = 'AIR_FILTER',
    CABIN_AIR = 'CABIN_AIR',
    OIL_FILTER = 'OIL_FILTER',
    ADVFULLSYN = 'ADVFULLSYN',
    OIL_CHANGE = 'OIL_CHANGE',
}

export type PartTypeApi = keyof typeof PartTypeApiEnum;
