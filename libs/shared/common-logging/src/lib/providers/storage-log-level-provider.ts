import { interval, Subscription } from 'rxjs';
import { LogLevel } from '../log-level.enum';
import { Logger } from '../logger';
import { Loggers } from '../loggers';
import { ConstantLogLevelProvider } from './constant-log-level-provider';
import { LogLevelProvider } from './log-level-provider';

const DEFAULT_POLLER_INTERVAL_MS = 30_000;
const DEFAULT_LOGGER_PREFIX = 'logging.level.';

/**
 * Define log levels based on a `Storage` object (`localStorage`, `sessionStorage`, etc).
 *
 * To configure debug logging for `foo-feature.FooComponent`, add the following to your Storage object
 * ```
 * 'logging.level.foo-feature.FooComponent': 'DEBUG'
 * ```
 * To configure debug logging for everything in `foo-feature`, add the following to your Storage object
 * ```
 * 'logging.level.foo-feature': 'DEBUG'
 * ```
 *
 * @export
 * @class StorageLogLevelProvider
 * @extends {LogLevelProvider}
 */
export class StorageLogLevelProvider extends LogLevelProvider {
    // private levels: BehaviorSubject<{ [param: string]: string }> = new BehaviorSubject({});
    private levels: {};
    pollerSubscription: Subscription; // public in order to unsubscribe in tests
    private loggerPrefix: string;

    constructor(
        private readonly storage: Storage = localStorage,
        config?: {
            pollerIntervalMs?: number;
            loggerPrefix?: string;
        }
    ) {
        super();
        this.loggerPrefix = (config && config.loggerPrefix) || DEFAULT_LOGGER_PREFIX;
        const pollerIntervalMs = (config && config.pollerIntervalMs) || DEFAULT_POLLER_INTERVAL_MS;

        this.refreshLogLevels();
        this.pollerSubscription = interval(pollerIntervalMs) //
            .subscribe(
                () => this.refreshLogLevels(),
                (e) => this.fallbackLogger.error(`Could not refresh log levels from ${storage}: ${e}`)
            );
    }

    /** Manually reload the log levels from storage.*/
    public refreshLogLevels() {
        const updateLogLevels: { [param: string]: LogLevel } = {};
        Object.entries(this.storage)
            .filter((entry) => entry[0].startsWith(this.loggerPrefix))
            .forEach((entry) => {
                const loggerName = entry[0].substring(this.loggerPrefix.length);
                const levelAsString = entry[1];
                updateLogLevels[loggerName] = super.parseLogLevel(
                    levelAsString, //
                    (e) => {
                        this.fallbackLogger.error(
                            `Unsupported "${loggerName}=${levelAsString}". Logging at default level."`,
                            e
                        );
                        return LogLevel.DEFAULT;
                    }
                );
            });
        this.levels = updateLogLevels;
    }

    async getLevel(loggerName: string): Promise<LogLevel> {
        if (!loggerName) {
            return LogLevel.OFF; // should never happen.
        }
        const level = this.levels[loggerName];
        if (level !== null && level !== undefined) {
            return level;
        } else {
            // If foo.bar.baz, is not configured, check foo.bar
            const lastSeparator = loggerName.lastIndexOf('.');
            if (lastSeparator > 0) {
                const lessSpecific = loggerName.substr(0, lastSeparator);
                if (lessSpecific) {
                    return this.getLevel(lessSpecific);
                }
            }
            return LogLevel.DEFAULT;
        }
    }

    private get fallbackLogger() {
        // creates a new instance.  If this is done in constructor, Loggers.publishers may not be initialized
        return new Logger(
            'shared-common-logging',
            'StorageLogLevelProvider',
            Loggers.publishers,
            new ConstantLogLevelProvider(LogLevel.ALL),
            LogLevel.ALL
        );
    }
}
