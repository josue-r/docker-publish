import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { GoogleAnalyticsService } from './google-analytics.service';

@NgModule({
    imports: [CommonModule],
    providers: [GoogleAnalyticsService],
})
export class UtilGoogleAnalyticsModule {}
