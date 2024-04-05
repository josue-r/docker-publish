import { Injectable } from '@angular/core';
import { UserMessage } from './models/user-message';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    // This must be provided at root. If it is in a module, a new instance will be
    // created every time the module is imported. That means there would be multiple messages.
    providedIn: 'root',
})
export class MessageState {
    readonly messages = new BehaviorSubject<UserMessage[]>([]);

    updateMessages(userMessages: UserMessage[]): void {
        this.messages.next(userMessages);
    }
}
