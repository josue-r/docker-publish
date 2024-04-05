import { LogLevel } from './log-level.enum';
import { LogMessage } from './log-message.type';
import { ConstantLogLevelProvider } from './providers/constant-log-level-provider';
import { LogLevelProvider } from './providers/log-level-provider';
import { ConsoleLogPublisher } from './publishers/console-log-publisher';
import { LogPublisher } from './publishers/log-publisher';

/**
 * Logger object.
 *
 * Generally instantiated via
 * ```ts
 * private readonly logger = Loggers.get('feature-store-product', 'StoreProductComponent')
 * ```
 *
 * @export
 * @class Logger
 */
export class Logger {
    private loggerName: string;
    constructor(
        private context: string,
        private name: string,
        private publishers: LogPublisher[],
        private logLevelProvider: LogLevelProvider,
        private defaultLogLevel: LogLevel
    ) {
        this.loggerName = `${context}.${name}`;
        if (!publishers.length) {
            console.warn(
                `No publishers passed. Logger "${this.loggerName}" will not produce any log messages.  To fix this, call "Loggers.publishers = ..."`
            );
        }
        if (!logLevelProvider) {
            // If the LogLevelProvider is not configured, everything will be logged at info.
            this.logLevelProvider = new ConstantLogLevelProvider(LogLevel.INFO);
            console.warn(
                `No LogLevelProvider set.  Everything will be logged at info. To fix this, call "Loggers.logLevelProvider = ..."`
            );
        }
    }

    debug(message: LogMessage, ...optionalMessages: LogMessage[]): Promise<void> {
        return this.log(LogLevel.DEBUG, message, optionalMessages) //
            .catch((reason) => this.handleError(message, optionalMessages, reason));
    }

    info(message: LogMessage, ...optionalMessages: LogMessage[]): Promise<void> {
        return this.log(LogLevel.INFO, message, optionalMessages) //
            .catch((reason) => this.handleError(message, optionalMessages, reason));
    }

    warn(message: LogMessage, ...optionalMessages: LogMessage[]): Promise<void> {
        return this.log(LogLevel.WARN, message, optionalMessages) //
            .catch((reason) => this.handleError(message, optionalMessages, reason));
    }

    error(message: LogMessage, ...optionalMessages: LogMessage[]): Promise<void> {
        return this.log(LogLevel.ERROR, message, optionalMessages) //
            .catch((reason) => this.handleError(message, optionalMessages, reason));
    }

    /**
     * Handle the error by falling back to a console logger.  This is independent of the configured LogLevelProvider and will always
     * display the message to the console.
     */
    private handleError(message: LogMessage, optionalMessages: LogMessage[], reason: any): void {
        const consoleLogger = new Logger(
            this.context,
            this.name,
            [new ConsoleLogPublisher()],
            new ConstantLogLevelProvider(LogLevel.ALL),
            LogLevel.ALL
        );
        consoleLogger.error(`Unable to log "${this.unwrap([message, ...optionalMessages])}: ${reason}"`);
    }

    /** Asynchronously trigger logging */
    private async log(requestedLogLevel: LogLevel, message: LogMessage, optionalMessages: LogMessage[]): Promise<void> {
        const now = new Date();
        switch (requestedLogLevel) {
            case LogLevel.DEBUG:
            case LogLevel.ERROR:
            case LogLevel.INFO:
            case LogLevel.WARN:
                const messages = [message, ...optionalMessages];
                const configuredLogLevel = await this.findLogLevel();
                if (configuredLogLevel <= requestedLogLevel) {
                    const unwrapped = this.unwrap(messages);
                    const publishPromises = this.publishers.map((publisher) =>
                        publisher.publish(this.loggerName, now, requestedLogLevel, unwrapped)
                    );
                    return await Promise.all(publishPromises) //
                        /* just maps from any[] to void*/
                        .then(() => {});
                }
                break;
            default:
                await this.error(`Unsupported log level ${requestedLogLevel}: messages=${this.unwrap(messages)}`);
        }
    }

    /**
     * Determine the log level in the follow priority.
     *
     * - If a log level for this `loggerName` is configured in `logLevelProvider`, use it
     * - If a default log level is set, use it
     * - Otherwise, just fallback to a default level of this.defaultLogLevel.
     *
     * @private
     * @returns {Promise<LogLevel>}
     * @memberof Logger
     */
    private async findLogLevel(): Promise<LogLevel> {
        // use requested log level if configured
        const requestedLogLevel = await this.logLevelProvider.getLevel(this.loggerName);
        if (requestedLogLevel >= LogLevel.ALL) {
            return requestedLogLevel;
        }
        // Otherwise, try to see if there is a default log level configured
        const defaultLogLevel = await this.logLevelProvider.getDefaultLevel();
        if (defaultLogLevel >= LogLevel.ALL) {
            return defaultLogLevel;
        }
        // Otherwise, fall back to the defaultLogLevel
        return this.defaultLogLevel;
    }

    /** If the passed message is a function, unwrap it such that it returns the function value instead. */
    private unwrap(messages: LogMessage[]): any[] {
        return messages.map((message) => {
            if (typeof message === 'function') {
                return message();
            } else {
                return message;
            }
        });
    }
}
