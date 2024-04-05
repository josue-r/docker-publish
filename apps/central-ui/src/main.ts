import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production === 'true') {
    enableProdMode();
}

declare let __webpack_public_path__: any;
__webpack_public_path__ = environment.deployUrl;

platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .catch((err) => console.error(err));
