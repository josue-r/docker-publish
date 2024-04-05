import { QuerySearch } from '@vioc-angular/shared/common-api-models';
import { isNullOrUndefined } from '@vioc-angular/shared/common-functionality';
import { Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseApi } from './base-api';
import { ApiConfig } from './models/api-config';
import { EntityPatch } from './models/entity-patch';

/**
 * The expected result from a Paged api.
 */
interface PagedResource {
    content: any[];
    page: {
        size: number;
        totalElements: number;
        totalPages: number;
        number: number;
    };
}

/**
 * Generic API class.  Contains basic methods that should be supported if the RESTful API follows conventions.
 *
 * @export
 * @class Api
 * @extends {BaseApi<TYPE>}
 * @template TYPE
 * @template ID
 */
export class Api<TYPE extends { id?: ID } | void, ID> extends BaseApi<TYPE> {
    constructor(protected readonly apiUrl: string, config: ApiConfig) {
        super(apiUrl, config);
        //    this.queryService = config.queryService; // TODO: Implement this
    }

    protected readonly contentType = { 'Content-Type': 'application/json' };

    query(querySearch: QuerySearch, paths = ['search']): Observable<{ content: TYPE[]; totalElements: number }> {
        // Append the default sorts if any have been specified. This code assumes an initial sort is always provided.
        let sort = [querySearch.sort.sortParameter];
        if (querySearch.defaultSorts?.length > 0) {
            sort = sort.concat(
                querySearch.defaultSorts
                    // Filter out columns already being sorted on from the defaults
                    .filter((s) => s.column.apiFieldPath !== querySearch.sort.column.apiFieldPath)
                    .map((s) => s.sortParameter)
            );
        }
        const httpParams: { [param: string]: string | string[] } = {
            ...querySearch.additionalParams,
            page: querySearch.page.indexParameter,
            size: querySearch.page.sizeParameter,
            sort,
        };
        const response = this.post(paths, querySearch.queryRestrictions, httpParams, this.contentType);
        return response.pipe(
            map((r: PagedResource) => {
                return {
                    content: r.content as TYPE[],
                    totalElements: r.page.totalElements,
                };
            })
        );
    }

    /**
     * Triggers either an `add` or `updated` depending on whether or not the `id` field is present in the passed object.
     *
     * @param {TYPE} entity
     * @returns {Observable<Object>}
     * @memberof Api
     */
    save(entity: TYPE, paths = []): Observable<Object> {
        if (isNullOrUndefined(entity['id'])) {
            // if adding
            return this.addSingle(entity, paths);
        } else {
            // if updating
            return this.update(entity, paths);
        }
    }

    entityPatch(paths = ['patch'], ...patches: EntityPatch<ID>[]): Observable<Object> {
        if (patches.some((p) => isNullOrUndefined(p.id))) {
            return throwError(new Error(`EntityPatch.id must be set: ${patches}`));
        }
        return this.patch(paths, patches);
    }

    add(entities: TYPE[] | any, paths = []): Observable<number> {
        return this.post(paths, entities, this.contentType) //
            .pipe(map((r) => r as number));
    }

    dataSync(ids: any[], paths = ['datasync']): Observable<number> {
        return this.post<number>(paths, ids);
    }

    update(entity: TYPE, paths = []): Observable<Object> {
        return this.put(paths, entity, this.contentType);
    }

    /** Activates the selected records by id. */
    activate(ids: ID[], paths = ['activate']): Observable<number> {
        return this.patch(paths, ids) as Observable<number>;
    }

    /** Deactivates the selected records by id. */
    deactivate(ids: ID[], paths = ['deactivate']) {
        return this.patch(paths, ids) as Observable<number>;
    }

    protected addSingle(entity: TYPE, paths = []): Observable<Object> {
        return this.post(paths, entity);
    }

    /** Auxiliary method useful for transforming responses to a more standard search response */
    convertPagedResourceToResponseEntity(source: Observable<PagedResource>) {
        return source.pipe(
            map((pr) => ({
                content: pr.content as TYPE[],
                totalElements: pr.page.totalElements,
            }))
        );
    }

    /** Auxiliary method useful for building an httpParam object to pass in the post call  */
    buildHttpParams(querySearch: QuerySearch): { [param: string]: string | string[] } {
        return {
            ...querySearch.additionalParams,
            page: querySearch.page.indexParameter,
            size: querySearch.page.sizeParameter,
            sort: [querySearch.sort.sortParameter],
        };
    }
}
