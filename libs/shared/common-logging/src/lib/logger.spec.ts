import { LogLevel } from './log-level.enum';
import { LogMessage } from './log-message.type';
import { Logger } from './logger';
import { ConstantLogLevelProvider } from './providers/constant-log-level-provider';
import { ConsoleLogPublisher } from './publishers/console-log-publisher';
import { LogPublisher } from './publishers/log-publisher';

describe('Logger', () => {
    function findEnumName(level: LogLevel) {
        switch (level) {
            case LogLevel.DEFAULT:
                return 'DEFAULT';
            case LogLevel.ALL:
                return 'ALL';
            case LogLevel.DEBUG:
                return 'DEBUG';
            case LogLevel.INFO:
                return 'INFO';
            case LogLevel.WARN:
                return 'WARN';
            case LogLevel.ERROR:
                return 'ERROR';
            case LogLevel.OFF:
                return 'OFF';
            default:
                throw Error(`Unhandled log level: ${level}`);
        }
    }

    class AssertingPublisher extends LogPublisher {
        constructor(
            private expectedLoggerName: string,
            private expectedLogLevel: LogLevel,
            private expectedMessages: string[]
        ) {
            super();
        }

        publish(loggerName: string, eventDate: Date, level: LogLevel, messages: string[]): Promise<any> {
            expect(loggerName).toEqual(this.expectedLoggerName);
            expect(level).toEqual(this.expectedLogLevel);
            expect(messages).toEqual(this.expectedMessages);
            return Promise.resolve();
        }
    }

    describe.each`
        configuredLevel   | allowDebug | allowInfo | allowWarn | allowError
        ${LogLevel.ALL}   | ${true}    | ${true}   | ${true}   | ${true}
        ${LogLevel.DEBUG} | ${true}    | ${true}   | ${true}   | ${true}
        ${LogLevel.INFO}  | ${false}   | ${true}   | ${true}   | ${true}
        ${LogLevel.WARN}  | ${false}   | ${false}  | ${true}   | ${true}
        ${LogLevel.ERROR} | ${false}   | ${false}  | ${false}  | ${true}
        ${LogLevel.OFF}   | ${false}   | ${false}  | ${false}  | ${false}
    `('logging to', ({ configuredLevel, allowDebug, allowInfo, allowWarn, allowError }) => {
        const level = findEnumName(configuredLevel);

        const constantSource = new ConstantLogLevelProvider(configuredLevel);
        const logger = (publisher: LogPublisher) => new Logger('foo', 'bar', [publisher], constantSource, LogLevel.OFF);
        describe('debug', () => {
            it(`should ${allowDebug ? '' : 'not '}log when configured at LogLevel.${level}`, async () => {
                const publisher = new AssertingPublisher('foo.bar', LogLevel.DEBUG, ['loggers', 'gonna', 'log']);
                jest.spyOn(publisher, 'publish');

                await logger(publisher).debug('loggers', 'gonna', 'log');
                if (allowDebug) {
                    expect(publisher.publish).toHaveBeenCalled();
                    expect.assertions(4);
                } else {
                    expect(publisher.publish).not.toHaveBeenCalled();
                }
            });
        });

        describe('info', () => {
            it(`should ${allowInfo ? '' : 'not '}log when configured at LogLevel.${level}`, async () => {
                const publisher = new AssertingPublisher('foo.bar', LogLevel.INFO, ['loggers', 'gonna', 'log']);
                jest.spyOn(publisher, 'publish');

                await logger(publisher).info('loggers', 'gonna', 'log');
                if (allowInfo) {
                    expect(publisher.publish).toHaveBeenCalled();
                    expect.assertions(4);
                } else {
                    expect(publisher.publish).not.toHaveBeenCalled();
                }
            });
        });

        describe('warn', () => {
            it(`should ${allowWarn ? '' : 'not '}log when configured at LogLevel.${level}`, async () => {
                const publisher = new AssertingPublisher('foo.bar', LogLevel.WARN, ['loggers', 'gonna', 'log']);
                jest.spyOn(publisher, 'publish');

                await logger(publisher).warn('loggers', 'gonna', 'log');
                if (allowWarn) {
                    expect(publisher.publish).toHaveBeenCalled();
                    expect.assertions(4);
                } else {
                    expect(publisher.publish).not.toHaveBeenCalled();
                }
            });
        });

        describe('error', () => {
            it(`should ${allowError ? '' : 'not '}log when configured at LogLevel.${level}`, async () => {
                const publisher = new AssertingPublisher('foo.bar', LogLevel.ERROR, ['loggers', 'gonna', 'log']);
                jest.spyOn(publisher, 'publish');

                await logger(publisher).error('loggers', 'gonna', 'log');
                if (allowError) {
                    expect(publisher.publish).toHaveBeenCalled();
                    expect.assertions(4);
                } else {
                    expect(publisher.publish).not.toHaveBeenCalled();
                }
            });
        });
    });

    describe('unwrap', () => {
        it('should convert an array of functions and anys to any[]', () => {
            const toConvert: LogMessage[] = [
                1,
                () => 2,
                'a',
                () => 'b',
                { c: 'd' },
                () => ({ e: 'f' }), //
            ];
            const logger = new Logger(
                'a',
                'b',
                [new ConsoleLogPublisher()],
                new ConstantLogLevelProvider(LogLevel.ALL),
                LogLevel.ALL
            );
            expect(logger['unwrap'](toConvert)).toEqual([1, 2, 'a', 'b', { c: 'd' }, { e: 'f' }]);
        });
    });

    describe('findLogLevel', () => {
        describe('when the requested logger has a configured level', () => {
            it('should return the configured level', async () => {
                const provider = new ConstantLogLevelProvider({ 'foo.bar': LogLevel.ERROR });
                const logger = new Logger('foo', 'bar', [new ConsoleLogPublisher()], provider, LogLevel.INFO);

                expect(await logger['findLogLevel']()).toEqual(LogLevel.ERROR);
            });
        });
        describe('when the requested logger does not have a configured level', () => {
            it('should return default log level when configured', async () => {
                const provider = new ConstantLogLevelProvider({ default: LogLevel.WARN });
                const logger = new Logger('foo', 'bar', [new ConsoleLogPublisher()], provider, LogLevel.INFO);

                expect(await logger['findLogLevel']()).toEqual(LogLevel.WARN);
            });

            it('should return fall back to INFO when the default is not configured', async () => {
                const provider = new ConstantLogLevelProvider({ 'something.else': LogLevel.WARN });
                const logger = new Logger('foo', 'bar', [new ConsoleLogPublisher()], provider, LogLevel.INFO);

                expect(await logger['findLogLevel']()).toEqual(LogLevel.INFO);
            });

            it('should set log level to INFO when the provider is not configured', async () => {
                const logger = new Logger('foo', 'bar', [new ConsoleLogPublisher()], null, LogLevel.WARN);

                expect(await logger['findLogLevel']()).toEqual(LogLevel.INFO);
            });
        });
    });
});
