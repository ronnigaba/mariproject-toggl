import {HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatNativeDateModule} from '@angular/material/core';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatSelectModule} from '@angular/material/select';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatTableModule} from '@angular/material/table';
import {Routes, RouterModule} from '@angular/router';
import {NgxSoapModule} from 'ngx-soap';
import {PageNotFoundComponent} from './shared/components';
import {SharedModule} from './shared/shared.module';
import {BrowserModule} from '@angular/platform-browser';
import {AppComponent} from './app.component';
import {SetupComponent} from './components/setup/setup.component';
import {RegistrationComponent} from './components/registration/registration.component';
import {MatCardModule} from '@angular/material/card';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatListModule} from '@angular/material/list';
import {MatIconModule} from '@angular/material/icon';
import {MatToolbarModule} from '@angular/material/toolbar';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ProjectsComponent} from './components/projects/projects.component';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatChipsModule} from '@angular/material/chips';

const routes: Routes = [
    {
        path: '',
        component: RegistrationComponent
    },
    {
        path: 'projects',
        component: ProjectsComponent
    },
    {
        path: 'setup',
        component: SetupComponent
    },
    {
        path: '**',
        component: PageNotFoundComponent
    }
];

@NgModule({
    bootstrap: [
        AppComponent
    ],
    declarations: [
        AppComponent,
        SetupComponent,
        RegistrationComponent,
        ProjectsComponent
    ],
    imports: [
        HttpClientModule,
        BrowserAnimationsModule,
        RouterModule.forRoot(routes, {useHash: true}),
        BrowserModule,
        SharedModule,
        MatCardModule,
        MatSidenavModule,
        MatListModule,
        MatIconModule,
        MatToolbarModule,
        MatFormFieldModule,
        MatInputModule,
        MatChipsModule,
        MatSnackBarModule,
        NgxSoapModule,
        MatSelectModule,
        MatTableModule,
        MatCheckboxModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatButtonModule
    ],
    exports: [RouterModule]
})
export class AppModule {
}
