import { Api, ApiConfig } from '@vioc-angular/shared/util-api';
import { Observable } from 'rxjs';
import { TechnicalAlert } from '../model/technical-alert.model';

export class TechnicalAlertApi extends Api<TechnicalAlert, number> {
    constructor(baseUrl: string, config: ApiConfig) {
        super(`${baseUrl}/v1/alerts`, config);
        // super(`http://localhost:9010/v1/alerts`, config);
    }

    findById(id: number): Observable<TechnicalAlert> {
        return this.get<TechnicalAlert>([`${id}`]);
    }

    updateTechnicalAlert(technicalAlert: TechnicalAlert): Observable<Object> {
        return this.put([], technicalAlert);
    }

    addTechnicalAlert(technicalAlert: TechnicalAlert): Observable<Object> {
        return this.post([], technicalAlert);
    }
}
