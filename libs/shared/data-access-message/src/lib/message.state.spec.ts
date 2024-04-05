import { MessageState } from './message.state';
import { UserMessage } from './models/user-message';

describe('MessageState', () => {
    it('should update', () => {
        const state = new MessageState();
        const userMessage: UserMessage = { message: `Test Message1`, severity: 'info' };
        const messageArray: UserMessage[] = [userMessage];
        state.updateMessages(messageArray);
        expect(state.messages.value).toEqual(messageArray);
    });
});
