/**
 * For internal use only, triggered when too many errors happen in a short time.
 *
 * @export
 * @class PotentialErrorLoopError
 * @extends {Error}
 */
export class PotentialErrorLoopError extends Error {
    constructor(repeatedErrorCount: number, repeatedErrorLifespanMilliseconds: number) {
        super(
            `Detected error loop because ${
                repeatedErrorCount + 1
            } errors have occurred in the past ${repeatedErrorLifespanMilliseconds} milliseconds. Navigating to error page`
        );
    }
}
