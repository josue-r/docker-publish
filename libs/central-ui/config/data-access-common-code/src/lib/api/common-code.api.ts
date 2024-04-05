import { Described, isNullOrUndefined } from '@vioc-angular/shared/common-functionality';
import { Api, ApiConfig } from '@vioc-angular/shared/util-api';
import { Observable } from 'rxjs';
import { CommonCode, CommonCodeId } from '../model/common-code.model';

export class CommonCodeApi extends Api<CommonCode, CommonCodeId> {
    constructor(baseUrl: string, config: ApiConfig) {
        super(`${baseUrl}/v1/common-codes`, config);
        // super(`http://localhost:9000/v1/common-codes`, config);
    }

    findByType(type: string, active?: boolean, sort?: string[]): Observable<Described[]> {
        let params;
        if (!isNullOrUndefined(active)) {
            params = { active: `${active}` };
        }
        if (sort) {
            params = { ...params, sort };
        }
        return this.get<Described[]>([`${type}`], params);
    }

    findByTypeAndCode(type: string, code: string): Observable<CommonCode> {
        return this.get<CommonCode>([`${type}/${code}`]);
    }
}
