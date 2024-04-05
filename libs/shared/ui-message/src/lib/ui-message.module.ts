import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MessageListComponent } from './message/message-list.component';
import { MessagesComponent } from './messages/messages.component';

@NgModule({
    imports: [CommonModule, MatIconModule, MatSnackBarModule, MatButtonModule],
    declarations: [MessageListComponent, MessagesComponent],
    exports: [MessagesComponent],
})
export class UiMessageModule {}
