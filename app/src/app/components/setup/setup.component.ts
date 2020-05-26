import {AfterViewInit, Component, OnInit} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MariProjectService} from '../../services/mari-project.service';
import {SettingsService} from '../../services/settings.service';
import {TogglService} from '../../services/toggl.service';

@Component({
    selector: 'app-setup',
    templateUrl: './setup.component.html',
    styleUrls: ['./setup.component.scss']
})
export class SetupComponent implements OnInit, AfterViewInit {
    public apiKeyValue: string;
    public usernameValue: string;
    public passwordValue: string;
    public mariProjectServer: string;
    public employeeNumberValue: string;
    public autoCheckEntries: boolean;

    constructor(private togglService: TogglService, private mariProjectService: MariProjectService, private settingsService: SettingsService, private snackBar: MatSnackBar) {
    }

    public ngOnInit(): void {
        this.apiKeyValue = this.settingsService.togglApi;
        this.usernameValue = this.settingsService.mariUsername;
        this.passwordValue = this.settingsService.mariPassword;
        this.mariProjectServer = this.settingsService.mariServer;
        this.employeeNumberValue = this.settingsService.mariEmployeeNumber;
        this.autoCheckEntries = this.settingsService.autoCheckEntries;
    }

    public async testCredentials(): Promise<void> {
        try {
            await this.togglService.testLogin(this.apiKeyValue);
            await this.mariProjectService.setServer(this.mariProjectServer);
            const response = await this.mariProjectService.testLogin(this.usernameValue, this.passwordValue);
            if (response.result.MARILoginByUserResult.includes('##ERROR##')) {
                this.snackBar.open('Error checking mariproject: ' + response.result.MARILoginByUserResult, 'Close', {
                    duration: 20000,
                });
            } else {
                this.snackBar.open('Credentials ok', 'Close', {
                    duration: 2000,
                });
            }
        } catch (e) {
            this.snackBar.open('Error checking credentials: ' + e.status, 'Close', {
                duration: 20000,
            });
        }
    }

    public ngAfterViewInit(): void {
    }

    public async saveChanges(): Promise<void> {
        this.settingsService.togglApi = this.apiKeyValue;
        this.settingsService.mariUsername = this.usernameValue;
        this.settingsService.mariPassword = this.passwordValue;
        this.settingsService.mariServer = this.mariProjectServer;
        this.settingsService.mariEmployeeNumber = this.employeeNumberValue;
        this.settingsService.autoCheckEntries = this.autoCheckEntries;
        await this.mariProjectService.setServer(this.mariProjectServer);
        this.snackBar.open('Changes saved', 'Close', {
            duration: 2000,
        });
    }
}
