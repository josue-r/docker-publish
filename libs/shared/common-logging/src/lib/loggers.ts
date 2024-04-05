import { LogLevel } from './log-level.enum';
import { Logger } from './logger';
import { ConstantLogLevelProvider } from './providers/constant-log-level-provider';
import { LogLevelProvider } from './providers/log-level-provider';
import { ConsoleLogPublisher } from './publishers/console-log-publisher';
import { LogPublisher } from './publishers/log-publisher';

/**
 * Factory class for creating `Logger` objects.
 *
 * In order to use this, the `publishers` and `logLevelProvider` must be set at the application level.  This should only be done once and not
 * every time a Logger is needed.
 *
 * Example
 * ```ts
 * Loggers.publishers = [new ConsoleLogPublisher()];
 * Loggers.logLevelProvider = new StorageLogLevelProvider(localStorage);
 * ```
 */
export class Loggers {
    private static _publishers: LogPublisher[] = [new ConsoleLogPublisher()];
    private static _logLevelProvider: LogLevelProvider = new ConstantLogLevelProvider(LogLevel.INFO);
    private static _defaultLogLevel: LogLevel = LogLevel.INFO;

    private constructor() {}

    /**
     * Creates a new instance of the passed logger context/name.
     *
     * @static
     * @param {string} context
     * @param {string} name
     * @returns {Logger}
     * @memberof Loggers
     */
    static get(context: string, name: string): Logger {
        return new Logger(context, name, this.publishers, this.logLevelProvider, this.defaultLogLevel);
    }

    /**
     * The log publishers tell the logger what to write to.  For instance, the `ConsoleLogPublisher` writes log messages to the console.
     *
     * Multiple publishers can be set if you want publish to multiple places.
     */
    static set publishers(publishers: LogPublisher[]) {
        this._publishers = publishers;
    }

    static get publishers(): LogPublisher[] {
        return [...this._publishers];
    }

    /**
     * Specifies how the logger determines which log level is set from the logger name.  Often the provider is a `StorageLogLevelProvider`.
     */
    static set logLevelProvider(logLevelProvider: LogLevelProvider) {
        this._logLevelProvider = logLevelProvider;
    }

    static get logLevelProvider(): LogLevelProvider {
        return this._logLevelProvider;
    }

    /**
     * The default log level in case `logLevelProvider.getDefaultLogLevel()` returns falsey.
     */
    static set defaultLogLevel(defaultLogLevel: LogLevel) {
        this._defaultLogLevel = defaultLogLevel;
    }

    static get defaultLogLevel(): LogLevel {
        return this._defaultLogLevel;
    }
}
