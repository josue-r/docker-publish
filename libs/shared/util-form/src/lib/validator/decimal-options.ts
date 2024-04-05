import { IntegerOptions } from './integer-options';

export interface DecimalOptions extends IntegerOptions {
    /**
     * The max number of decimal places.
     */
    decimalPlaces?: number;
}
