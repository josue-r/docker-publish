import { Described } from './described';

/**
 * Standard wrapper for common-codes.
 *
 * @export
 * @interface CommonCode
 */
export interface CommonCode extends Described {
    type: string;
    reportOrder: number;
    active: boolean;
}
