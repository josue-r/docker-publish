import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { UiFilteredInputModule } from '@vioc-angular/shared/ui-filtered-input';
import { SelectAndGoComponent } from './select-and-go/select-and-go.component';

@NgModule({
    imports: [CommonModule, UiFilteredInputModule, MatIconModule, MatButtonModule],
    declarations: [SelectAndGoComponent],
    exports: [SelectAndGoComponent],
})
export class UiSelectAndGoModule {}
