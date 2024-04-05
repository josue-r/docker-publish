import { formatDate } from '@angular/common';
import { LogLevel } from '../log-level.enum';
import { LogPublisher } from './log-publisher';

/**
 * Publishes logs to the console.
 *
 * @export
 * @class ConsoleLogPublisher
 * @implements {LogPublisher}
 */
export class ConsoleLogPublisher extends LogPublisher {
    constructor() {
        super();
    }

    async publish(loggerName: string, eventDate: Date, level: LogLevel, messages: any[]): Promise<any> {
        switch (level) {
            case LogLevel.DEBUG:
                this.writeToConsole('log', loggerName, eventDate, 'DEBUG', messages);
                break;
            case LogLevel.INFO:
                this.writeToConsole('log', loggerName, eventDate, 'INFO', messages);
                break;
            case LogLevel.WARN:
                this.writeToConsole('warn', loggerName, eventDate, 'WARN', messages);
                break;
            case LogLevel.ERROR:
                this.writeToConsole('error', loggerName, eventDate, 'ERROR', messages);
                break;
            case LogLevel.OFF:
                break; // do nothing
            default:
                const enumName = Object.keys(LogLevel).find((k) => LogLevel[k] === level);
                this.writeToConsole('error', loggerName, eventDate, enumName, messages);
                break;
        }
    }

    private writeToConsole(
        method: 'log' | 'error' | 'debug' | 'info' | 'warn' | 'trace',
        loggerName: string,
        eventDate: Date,
        level: string,
        messages: string[]
    ) {
        console[method](this.messagePrefix(loggerName, eventDate, level), ...messages);
    }

    private messagePrefix(loggerName: string, eventDate: Date, levelAsString: string) {
        const locale = 'en-US'; // hard coded but just console log so probably doesn't matter. Locales have to be compiled into app.
        const eventDateAsString = formatDate(eventDate, 'yyyy-MM-dd HH:mm:ss.sss', locale);
        return `${eventDateAsString} ${levelAsString.padEnd(5, ' ')} ${loggerName} -`;
    }
}
