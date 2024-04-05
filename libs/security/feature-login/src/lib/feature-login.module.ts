import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { LoginErrorComponent } from './login-error/login-error.component';
import { LogoutComponent } from './logout/logout.component';

@NgModule({
    imports: [CommonModule],
    declarations: [LoginComponent, LoginErrorComponent, LogoutComponent],
})
export class FeatureLoginModule {}
