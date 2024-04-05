import { isNullOrUndefined } from '@vioc-angular/shared/common-functionality';
import { LogLevel } from '../log-level.enum';

/** String to LogLevel mapping */
export const mapping = {
    DEFAULT: LogLevel.DEFAULT,
    OFF: LogLevel.OFF,
    DEBUG: LogLevel.DEBUG,
    INFO: LogLevel.INFO,
    WARN: LogLevel.WARN,
    ERROR: LogLevel.ERROR,
    ALL: LogLevel.ALL,
};

/**
 * Defines where log levels are configured.  For instance, StorageLogLevel can be used to store different log levels in localStorage.
 *
 * @export
 * @abstract
 * @class LogLevelProvider
 */
export abstract class LogLevelProvider {
    /**
     * Returns the configured log level for the passed logger name or a falsy response if nothing is configured.
     *
     * @abstract
     * @param {string} loggerName
     * @returns {Promise<LogLevel>}
     * @memberof LogLevelProvider
     */
    abstract getLevel(loggerName: string): Promise<LogLevel>;

    /**
     * The default level if no specific log levels are configured.
     *
     * @returns {(Promise<LogLevel | undefined | null>)}
     * @memberof LogLevelProvider
     */
    getDefaultLevel(): Promise<LogLevel | undefined | null> {
        return this.getLevel('default');
    }

    /**
     * Converts the levelAsString parameter into the matching `LogLevel`.
     *
     * If no `LogLevel` matches, `handleUnknownLogLevel` can be used to either log that or return a custom `LogLevel`.
     *
     * If nothing can be obtained from either of the two methods above, just return `LogLevel.DEFAULT`
     *
     * @protected
     * @param {string} levelAsString
     * @param {((level) => LogLevel | void)} handleUnknownLogLevel
     * @returns {LogLevel}
     * @memberof LogLevelProvider
     */
    protected parseLogLevel(levelAsString: string, handleUnknownLogLevel: (level) => LogLevel | void): LogLevel {
        if (levelAsString) {
            const level = mapping[levelAsString.trim().toUpperCase()];
            if (!isNullOrUndefined(level)) {
                return level;
            } else {
                // If handleUnknownLogLevel returns a log level, use it.  Otherwise, fall back to default
                const customLogLevel = handleUnknownLogLevel && handleUnknownLogLevel(levelAsString);
                if (customLogLevel) {
                    return customLogLevel;
                }
            }
        }
        return LogLevel.DEFAULT;
    }
}
