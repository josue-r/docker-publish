import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { InfoButtonComponent } from './info-button/info-button.component';

@NgModule({
    imports: [CommonModule, MatTooltipModule, MatIconModule, MatButtonModule],
    declarations: [InfoButtonComponent],
    exports: [InfoButtonComponent],
})
export class UiInfoButtonModule {}
