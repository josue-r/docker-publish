import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MessageState } from './message.state';
import { Severity } from './models/severity';
import { UserMessage } from './models/user-message';

@Injectable({
    // This must be provided at root. If it is in a module, a new instance will be
    // created every time the module is imported. That means there would be multiple messages.
    providedIn: 'root',
})
export class MessageFacade {
    constructor(private readonly _state: MessageState) {}

    getMessages(): Observable<UserMessage[]> {
        return this._state.messages.asObservable();
    }

    addMessage(message: UserMessage) {
        const currentValue = this._state.messages.value;
        const updatedValue = [...currentValue, message];
        this._state.updateMessages(updatedValue);
    }

    addSaveCountMessage(count: number, action: 'added' | 'updated') {
        if (count === 0) {
            this.addMessage({ severity: 'warn', message: `No records were ${action}!` });
        }
        this.addMessage({ severity: 'info', message: `${count} record${count === 1 ? '' : 's'} ${action}` });
    }

    removeMessage(message: UserMessage) {
        const currentValue = this._state.messages.value;
        const index = currentValue.indexOf(message);
        if (index >= 0) {
            currentValue.splice(index, 1);
            this._state.updateMessages(currentValue);
        }
    }

    /**
     * Clears all of the messages if no severities are passed. Clears only the passed severities
     * if any are present.
     */
    clear(...severity: Severity[]) {
        if (severity.length === 0) {
            this._state.updateMessages([]);
        } else {
            this._state.updateMessages(this._state.messages.value.filter((m) => !severity.includes(m.severity)));
        }
    }
}
