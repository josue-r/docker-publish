import { ApiConfig, BaseApi } from '@vioc-angular/shared/util-api';
import { WorkingBay } from '../model/working-bay.model';
import { WorkingBayServices } from '../model/working-bay-services.model';
import { Observable } from 'rxjs';

/**
 * Working bay api
 *
 * Using void as the type parameter in BaseApi<void> indicates that the BaseApi class does not expect any specific type for its generic parameter.
 *
 * We are only using the base methods to make HTTP requests and handle errors, but not to parse or manipulate the response data (that's responsibility of each subscriber).
 *
 * Even though BaseApi is declared with BaseApi<void>, you can still use it with specific types when calling its methods in WorkingBayApi.
 * This is because TypeScript's generics allow you to specify a different type when using a generic class or method, even if the class itself is defined with a different type parameter.
 */
export class WorkingBayApi extends BaseApi<void> {
    constructor(gateway: string, config: ApiConfig) {
        const apiGatewayPath = 'v1';
        const controllerPath = 'working-bays';
        super(`${gateway}/${apiGatewayPath}/${controllerPath}`, config);
    }

    getWorkingBayStatusByNumber(bayNumber: string): Observable<WorkingBay> {
        return this.get<WorkingBay>([bayNumber]);
    }

    getWorkingBayServicesByNumberAndRootServiceCategoryCode(
        bayNumber: string,
        rootServiceCategoryCode: string
    ): Observable<WorkingBayServices> {
        return this.get<WorkingBayServices>([bayNumber, 'services', rootServiceCategoryCode]);
    }

    getBooleanAttributeByNumberAndType(bayNumber: string, attributeType: string): Observable<boolean> {
        return this.get<boolean>([bayNumber, 'attributes', attributeType, 'boolean']);
    }
}
