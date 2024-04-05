import { LogLevel } from '../log-level.enum';
import { LogLevelProvider } from './log-level-provider';

describe('LogLevelProvider', () => {
    class StubbedProvider extends LogLevelProvider {
        public parseLogLevel = super.parseLogLevel;
        getLevel(loggerName: string): Promise<LogLevel> {
            throw new Error('Method not implemented.');
        }
    }

    describe.each`
        asString       | expected
        ${'dEbUg'}     | ${LogLevel.DEBUG}
        ${'  DEBUG  '} | ${LogLevel.DEBUG}
        ${'debug'}     | ${LogLevel.DEBUG}
        ${'INFO'}      | ${LogLevel.INFO}
        ${'warn'}      | ${LogLevel.WARN}
        ${'Error'}     | ${LogLevel.ERROR}
        ${'Default'}   | ${LogLevel.DEFAULT}
        ${'off'}       | ${LogLevel.OFF}
        ${'All'}       | ${LogLevel.ALL}
        ${'NA'}        | ${LogLevel.DEFAULT}
        ${''}          | ${LogLevel.DEFAULT}
        ${undefined}   | ${LogLevel.DEFAULT}
    `('parseLogLevel', ({ asString, expected }) => {
        it(`should parse ${asString} into ${toString(expected)}`, () => {
            const logLevelProvider = new StubbedProvider();

            expect(logLevelProvider.parseLogLevel(asString, () => {})).toEqual(expected);
        });
    });

    function toString(level: LogLevel) {
        return Object.entries(LogLevel).find((entry) => entry[1] === level)[0];
    }
});
