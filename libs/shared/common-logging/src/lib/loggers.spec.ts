import { LogLevel } from './log-level.enum';
import { Loggers } from './loggers';
import { ConstantLogLevelProvider } from './providers/constant-log-level-provider';
import { ConsoleLogPublisher } from './publishers/console-log-publisher';

describe('Loggers', () => {
    describe('get', () => {
        it('should return a logger with the configured properties', () => {
            Loggers.logLevelProvider = new ConstantLogLevelProvider(LogLevel.DEBUG);
            Loggers.publishers = [new ConsoleLogPublisher()];

            const logger = Loggers.get('foo', 'bar');

            expect(logger['loggerName']).toEqual('foo.bar');
            expect(logger['logLevelProvider']).toBe(Loggers.logLevelProvider);
            expect(logger['publishers'].map((p) => p.constructor.name)).toContain('ConsoleLogPublisher');
        });
    });
});
