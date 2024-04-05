import { LogLevel } from '../log-level.enum';

/**
 * Publishes the log someplace.  In the simplest case, this may be implemented with ConsoleLogPublisher.
 *
 * Often, this will publish to capture errors.
 *
 * @export
 * @abstract
 * @class LogPublisher
 */
export abstract class LogPublisher {
    /**
     * Publish the log out to something that is listening for them.
     *
     * @abstract
     * @param {string} loggerName
     * @param {Date} eventDate
     * @param {LogLevel} level
     * @param {string[]} messages
     * @returns {Promise<any>}
     * @memberof LogPublisher
     */
    abstract publish(loggerName: string, eventDate: Date, level: LogLevel, messages: any[]): Promise<any>;
}
