export interface CurrencyPrefix {
    code: string;
    symbol: string;
}

export const SUPPORTED_CURRENCIES: { [name: string]: CurrencyPrefix } = {
    USD: { code: 'USD', symbol: '$' },
};
