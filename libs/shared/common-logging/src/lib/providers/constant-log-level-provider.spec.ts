import { LogLevel } from '../log-level.enum';
import { ConstantLogLevelProvider } from './constant-log-level-provider';
import { LogLevelProvider } from './log-level-provider';

describe('ConstantLogLevelProvider', () => {
    it('should return the constant if LogLevel is passed', async () => {
        const debugSource: LogLevelProvider = new ConstantLogLevelProvider(LogLevel.DEBUG);
        expect(await debugSource.getLevel('foo')).toEqual(LogLevel.DEBUG);
        expect(await debugSource.getDefaultLevel()).toEqual(LogLevel.DEBUG);

        const infoSource: LogLevelProvider = new ConstantLogLevelProvider(LogLevel.INFO);
        expect(await infoSource.getLevel('bar')).toEqual(LogLevel.INFO);
        expect(await infoSource.getDefaultLevel()).toEqual(LogLevel.INFO);
    });

    it('should return the value from the object if an object is passed', async () => {
        const debugSource: LogLevelProvider = new ConstantLogLevelProvider({ foo: LogLevel.DEBUG, bar: LogLevel.INFO });
        expect(await debugSource.getLevel('foo')).toEqual(LogLevel.DEBUG);
        expect(await debugSource.getDefaultLevel()).toBeUndefined();

        const infoSource: LogLevelProvider = new ConstantLogLevelProvider({ foo: LogLevel.INFO, bar: LogLevel.WARN });
        expect(await infoSource.getLevel('bar')).toEqual(LogLevel.WARN);
        expect(await infoSource.getDefaultLevel()).toBeUndefined();
    });
});
