import { NgModule } from '@angular/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { SlideToggleComponent } from './slide-toggle/slide-toggle.component';

@NgModule({
    imports: [MatSlideToggleModule],
    declarations: [SlideToggleComponent],
    exports: [SlideToggleComponent],
})
export class UiSlideToggleModule {}
