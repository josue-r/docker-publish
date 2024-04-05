import { Attribute } from './attribute.model';

export class YearMakeModelEngine {
    /** ID is going to be required from the API side to detect adding new records vs updating existing */
    id: number = null;
    yearStart?: number = null;
    yearEnd?: number = null;
    makeId?: number = null;
    modelId?: number = null;
    engineConfigId?: number = null;
    /**
     * The list of attributes that ALL must match in order for this YMME to match
     */
    attributes?: Attribute[] = [];
    version?: number = null;
}
