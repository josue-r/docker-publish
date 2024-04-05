import * as moment from 'moment';
import { formatMoment } from './format-moment';

describe('formatMoment', () => {
    describe.each`
        value                            | dateOnly | result
        ${'2021-01-01'}                  | ${true}  | ${'Jan 1, 2021'}
        ${'2021-01-01T03:23:45'}         | ${true}  | ${'Jan 1, 2021'}
        ${moment('2021-01-01')}          | ${true}  | ${'Jan 1, 2021'}
        ${moment('2021-01-01T03:23:45')} | ${true}  | ${'Jan 1, 2021'}
        ${null}                          | ${true}  | ${null}
        ${undefined}                     | ${true}  | ${null}
        ${''}                            | ${true}  | ${null}
        ${'Not a date'}                  | ${true}  | ${'Invalid date'}
        ${'2021-01-01'}                  | ${false} | ${'Jan 1, 2021 12:00 AM'}
        ${'2021-01-01T03:23:45'}         | ${false} | ${'Jan 1, 2021 3:23 AM'}
        ${moment('2021-01-01')}          | ${false} | ${'Jan 1, 2021 12:00 AM'}
        ${moment('2021-01-01T03:23:45')} | ${false} | ${'Jan 1, 2021 3:23 AM'}
        ${null}                          | ${false} | ${null}
        ${undefined}                     | ${false} | ${null}
        ${''}                            | ${false} | ${null}
        ${'Not a date'}                  | ${false} | ${'Invalid date'}
    `('function', ({ value, dateOnly, result }) => {
        it(`should return ${result} when value=${value} & dateOnly=${dateOnly}`, () => {
            expect(formatMoment(value, dateOnly)).toEqual(result);
        });
    });
});
