/**
 * Configuration for all feature flags.  The different portions are:
 * - `domain`: The application domain that the flag is configured for. Example: `'storeService'`
 * - `screen`: The application screen or component in the specified domain that the flag is configured for. Example: `'search'`.
 * - `item`: The most specific item (button,field,section,etc) on the specified screen. Example: `'grid'`.
 * - The value of `item` will either be `true` or `false` or an array of user ids that this is enabled for.
 */
export interface Features {
    [domain: string]: {
        [screen: string]: {
            [item: string]: boolean | string[];
        };
    };
}
