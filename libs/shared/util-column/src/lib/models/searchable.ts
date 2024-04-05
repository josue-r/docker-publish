import { Comparator } from './comparator';

/**
 * Specifies additional search options.
 *
 * For example, if you have a search page where people will almost always want to search for active records, you can specify this on the
 * column definition for the `active` field to always add the restriction:
 * ```ts
 * searchable: { defaultSearch: true }, ...
 * ```
 *
 * If you want to always force a colum to be searched:
 * ```ts
 * searchable: { required: true }, ...
 * ```
 */
export interface Searchable {
    /**
     * If this is an instance of DefaultSearch, this search column will automatically added be added with the specified comparator
     * and value.
     *
     * If it is set to `true`, this search column will automatically added be added with the default comparator for this columns data type.
     */
    defaultSearch?: DefaultSearch | boolean;
    /**
     * Specifies that this column is required for searching. If this is set to true, this column will be automatically added as search
     * criteria and cannot be removed.
     */
    required?;
}

export interface DefaultSearch {
    comparator: Comparator;
    value?: any;
}

export function instanceOfSearchable(object: boolean | Searchable): object is Searchable {
    return typeof object !== 'boolean';
}

export function instanceOfDefaultSearch(object: boolean | DefaultSearch): object is DefaultSearch {
    return typeof object !== 'boolean';
}
