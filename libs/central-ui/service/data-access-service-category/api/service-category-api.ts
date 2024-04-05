import { Described } from '@vioc-angular/shared/common-functionality';
import { Api, ApiConfig } from '@vioc-angular/shared/util-api';
import { Observable } from 'rxjs';
import { ServiceCategory } from '../model/service-category.model';

export class ServiceCategoryApi extends Api<ServiceCategory, number> {
    constructor(baseUrl: string, config: ApiConfig) {
        super(`${baseUrl}/v1/service-categories`, config);
        // super(`http://localhost:9003/v1/service-categories`, config); //
    }

    findActive(level: 'LEAF' | 'ROOT' | 'ALL') {
        return this.get<Described[]>(['active'], { level: level });
    }

    /**
     * Finds service categories by passed `code`
     */
    findByCode(code: string) {
        return this.get<ServiceCategory>([], { code });
    }

    /**
     * Validates that the parent category given the code entered by the user is valid. Will throw one of three errors if a validation
     * issue occurs:
     *
     * ```ts
     * error.service-api.notFoundParentCategory => 'Could not find parent category'
     * error.service-api.inactiveParentCategory => 'Parent category is inactive'
     * error.service-api.circularServiceCategoryHierarchy => 'Parent category has a circular hierarchy reference'
     * ```
     */
    validateParentCategory(parentCategoryCode: string, serviceCategoryCode: string) {
        return this.get<any>(['validate/parent-category'], { parentCategoryCode, serviceCategoryCode });
    }

    generateCategories(categoryCodes?: string[]): Observable<ServiceCategory[]> {
        return this.post<ServiceCategory[]>(['codes'], categoryCodes);
    }
}
