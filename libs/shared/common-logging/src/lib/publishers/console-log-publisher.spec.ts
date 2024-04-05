import { LogLevel } from '../log-level.enum';
import { ConsoleLogPublisher } from './console-log-publisher';

describe('ConsoleLogPublisher', () => {
    it('should create an instance', () => {
        expect(new ConsoleLogPublisher()).toBeTruthy();
    });

    describe.each`
        level               | consoleFunctionName | expectedMessage
        ${LogLevel.DEFAULT} | ${'error'}          | ${['2020-04-10 12:00:00.000 DEFAULT ConsoleLogPublisher.Spec -', 'loggers', 'gonna', 'log']}
        ${LogLevel.OFF}     | ${'log'}            | ${undefined}
        ${LogLevel.DEBUG}   | ${'log'}            | ${['2020-04-10 12:00:00.000 DEBUG ConsoleLogPublisher.Spec -', 'loggers', 'gonna', 'log']}
        ${LogLevel.INFO}    | ${'log'}            | ${['2020-04-10 12:00:00.000 INFO  ConsoleLogPublisher.Spec -', 'loggers', 'gonna', 'log']}
        ${LogLevel.WARN}    | ${'warn'}           | ${['2020-04-10 12:00:00.000 WARN  ConsoleLogPublisher.Spec -', 'loggers', 'gonna', 'log']}
        ${LogLevel.ERROR}   | ${'error'}          | ${['2020-04-10 12:00:00.000 ERROR ConsoleLogPublisher.Spec -', 'loggers', 'gonna', 'log']}
        ${LogLevel.ALL}     | ${'error'}          | ${['2020-04-10 12:00:00.000 ALL   ConsoleLogPublisher.Spec -', 'loggers', 'gonna', 'log']}
    `('should ...', ({ level, consoleFunctionName, expectedMessage }) => {
        let publisher: ConsoleLogPublisher;
        const date = new Date(Date.parse('2020-04-10T12:00:00.000'));
        // const date = new Date();
        const loggerName = 'ConsoleLogPublisher.Spec';

        beforeEach(() => {
            publisher = new ConsoleLogPublisher();
        });

        it(`should log ${level} to console.${consoleFunctionName} with message "${expectedMessage}"`, () => {
            jest.spyOn(console, 'log').mockReset();
            jest.spyOn(console, 'error').mockReset();
            jest.spyOn(console, 'warn').mockReset();

            publisher.publish(loggerName, date, level, ['loggers', 'gonna', 'log']);

            // No expected message indicates nothing logged
            if (expectedMessage) {
                expect(console[consoleFunctionName]).toHaveBeenCalledWith(...expectedMessage);
            } else {
                expect(console.error).not.toHaveBeenCalled();
                expect(console.log).not.toHaveBeenCalled();
                expect(console.warn).not.toHaveBeenCalled();
            }
        });
    });
});
