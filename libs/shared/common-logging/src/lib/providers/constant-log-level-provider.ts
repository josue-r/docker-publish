import { isNumber } from '@vioc-angular/shared/common-functionality';
import { LogLevel } from '../log-level.enum';
import { LogLevelProvider } from './log-level-provider';

/**
 * LogLevelProvider implementation that always returns the same constant value.
 *
 * @export
 * @class ConstantLogLevelProvider
 * @extends {LogLevelProvider}
 */
export class ConstantLogLevelProvider extends LogLevelProvider {
    constructor(private constantLevel: LogLevel | { [param: string]: LogLevel }) {
        super();
    }

    async getLevel(loggerName: string): Promise<LogLevel> {
        return isNumber(this.constantLevel) ? this.constantLevel : this.constantLevel[loggerName];
    }
}
