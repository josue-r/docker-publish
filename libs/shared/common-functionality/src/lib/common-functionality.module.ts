import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AfterIfDirective } from './directives/after-if.directive';
import { DisableButtonClickDirective } from './directives/disable-button-click/disable-button-click.directive';
import { DecimalPlacesDirective } from './directives/decimal-places/decimal-places.directive';
import { BooleanTransformPipe } from './pipes/boolean-transform/boolean-transform.pipe';
import { HasDataPipe } from './pipes/has-data/has-data.pipe';
import { MomentPipe } from './pipes/moment/moment.pipe';

@NgModule({
    imports: [CommonModule],
    declarations: [
        AfterIfDirective,
        BooleanTransformPipe,
        DecimalPlacesDirective,
        HasDataPipe,
        MomentPipe,
        DisableButtonClickDirective,
    ],
    exports: [
        AfterIfDirective,
        BooleanTransformPipe,
        DecimalPlacesDirective,
        HasDataPipe,
        MomentPipe,
        DisableButtonClickDirective,
    ],
})
export class CommonFunctionalityModule {}
