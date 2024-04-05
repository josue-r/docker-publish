import { Api, ApiConfig } from '@vioc-angular/shared/util-api';
import { Observable } from 'rxjs';
import { Tsb } from '../model/tsb.model';

export class TsbApi extends Api<Tsb, number> {
    constructor(baseUrl: string, config: ApiConfig) {
        super(`${baseUrl}/v1/tsbs`, config);
        // super(`http://localhost:9010/v1/tsbs`, config);
    }

    findById(id: number): Observable<Tsb> {
        return this.get<Tsb>([`${id}`]);
    }
}
