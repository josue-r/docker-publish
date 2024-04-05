import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MockSelectAndGoComponent } from './select-and-go.component.mock';

@NgModule({
    imports: [CommonModule],
    declarations: [MockSelectAndGoComponent],
    exports: [MockSelectAndGoComponent],
})
export class UiSelectAndGoMockModule {}
