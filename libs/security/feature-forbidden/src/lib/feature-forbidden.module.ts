import { MatCardModule } from '@angular/material/card';
import { ForbiddenComponent } from './forbidden/forbidden.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

@NgModule({
    imports: [CommonModule, MatCardModule],
    declarations: [ForbiddenComponent],
})
export class FeatureForbiddenModule {}
