/**
 * Wraper around the anonymous interface declared in FormControl set/patch methods.
 */
export interface UpdateOptions {
    onlySelf?: boolean;
    emitEvent?: boolean;
    emitModelToViewChange?: boolean;
    emitViewToModelChange?: boolean;
}
