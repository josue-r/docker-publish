import { Severity } from './severity';

export interface UserMessage {
    message: string;
    severity: Severity;
    action?: string;
    hasTimeout?: boolean;
}
