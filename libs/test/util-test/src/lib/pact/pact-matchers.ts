import { eachLike, integer, like, regex, string } from '@pact-foundation/pact/src/dsl/matchers';

/**
 * Pact matcher to check that a response structure matches an API error response. The status
 * and path are given to directly match against since those should be known depending on the
 * type of error being tested. Can be passed to the pact interaction to verify an error case.
 *
 * Ex.
 *
 * willRespondWith: {
        status: 400,
        body: likeApiErrorResponse('400', path),
    },
 *
 */
export function likeApiErrorResponse(status: string, path: string) {
    return like({
        apiVersion: string(),
        error: like({
            status,
            timestamp: string(),
            uuid: string(),
            path,
            messageKey: string(),
            developerMessage: string(),
            errors: null,
        }),
    });
}

/**
 * Similar to #likeApiErrorResponse, but also expects additional error details to be provided
 * in the 'errors' array.
 *
 * Ex.
 *
 * willRespondWith: {
        status: 400,
        body: likeApiErrorResponseWithDetails('400', path),
    },
 *
 */
export function likeApiErrorResponseWithDetails(status: string, path: string) {
    return like({
        apiVersion: string(),
        error: like({
            status,
            timestamp: string(),
            uuid: string(),
            path,
            messageKey: string(),
            developerMessage: string(),
            errors: eachLike({
                messageKey: string,
                developerMessage: string(),
                messageParams: eachLike(string()),
            }),
        }),
    });
}

/**
 * Validates that a given parameter matches the structure of a described entity. Can be
 * used to validate individual fields in the body of a response.
 *
 * Ex.
 * const response = {
        describedField: likeDescribed()
    }
 *
 */
export function likeDescribed() {
    return like({
        id: integer(),
        code: string(),
        description: string(),
        version: integer(),
    });
}

/**
 * Standard headers to be expected from a json request. Can be used when creating
 * an interaction for a Json api call.
 *
 * Ex.
 * const request: RequestOptions = {
        method: 'POST',
        path: requestPath,
        headers: standardJsonHeaders(),
        body: requestBody,
    }
 *
 */
export function standardJsonHeaders() {
    return { Accept: like('application/json'), 'Content-Type': 'application/json' };
}

export function acceptJsonHeader() {
    return { Accept: like('application/json') };
}

/**
 * Pact matcher to check that a LocalDateTime matches the correct format.
 * This format is the date and time without the timezone.
 * Can be passed to the pact interaction to verify a LocalDateTime.
 *
 * Ex.
 * const requestMatcher = {
 *      id: integer(),
 *      date: likeDateTimeWithMillis(),
 * }
 */
export function likeDateTimeWithMillis() {
    return regex({
        generate: '2021-03-11T09:26:48.165363',
        matcher: '^\\d{4}-[01]\\d-[0-3]\\dT[0-2]\\d:[0-5]\\d:[0-5]\\d\\.\\d+$',
    });
}
