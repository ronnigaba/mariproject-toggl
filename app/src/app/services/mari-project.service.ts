import {Injectable} from '@angular/core';
import {Client, ISoapMethodResponse, NgxSoapService} from 'ngx-soap';
import {SettingsService} from './settings.service';

@Injectable({
    providedIn: 'root'
})
export class MariProjectService {
    private client: Client;
    private cachedSessionId: string;
    private cacheExpiration: number;

    constructor(private soap: NgxSoapService, private settingsService: SettingsService) {
        const server = this.settingsService.mariServer;
        if (server) {
            this.setServer(server).catch(x => {
                console.error('Could not set mariproject server: ' + x);
            });
        }
    }

    public async setServer(server: string): Promise<any> {
        this.client = await this.soap.createClient(server);
    }

    public testLogin(username: string, password: string): Promise<ISoapMethodResponse> {
        const body = {
            MARIUserName: username,
            MARIUserPassword: password
        };
        return this.client.call('MARILoginByUser', body).toPromise();
    }

    private async login(): Promise<string> {
        if(this.cachedSessionId && this.cacheExpiration > Date.now()) {
            return this.cachedSessionId;
        }
        if (!this.client) {
            const server = this.settingsService.mariServer;
            if (!server) {
                return Promise.reject('No server set');
            }
            await this.setServer(server);
        }
        const response = (await this.testLogin(this.settingsService.mariUsername, this.settingsService.mariPassword)) as ISoapMethodResponse;
        if (response.result.MARILoginByUserResult.includes('##ERROR##')) {
            return Promise.reject(response.result.MARILoginByUserResult);
        }
        //Cache it for 15 seconds
        this.cachedSessionId = response.result.MARILoginByUserResult;
        this.cacheExpiration = Date.now() + 15000;
        return response.result.MARILoginByUserResult;
    }

    public async getListProjectsForTimeBooking(): Promise<ISoapMethodResponse> {
        const session = await this.login();
        const body = {
            SessionKey: session,
            EmployeeNumber: this.settingsService.mariEmployeeNumber
        };
        return this.client.call('oGetListProjectsForTimeBooking', body).toPromise();
    }

    public async getListContractToProject(projectNumber: string): Promise<ISoapMethodResponse> {
        const session = await this.login();
        const body = {
            SessionKey: session,
            ProjectNumber: projectNumber,
            ShowActiveOnly: true
        };
        return this.client.call('oGetListContractToProject', body).toPromise();
    }

    public async getListPositionsOfContractForPlanning(contractId: string): Promise<ISoapMethodResponse> {
        const session = await this.login();
        const body = {
            SessionKey: session,
            ContractID: contractId
        };
        return this.client.call('oGetListPositionsOfContractForPlanning', body).toPromise();
    }

    public async createTimeEntry(projectNumber: string, contractId: string, contractPositionId: string, hours: number, date: Date, description: string): Promise<ISoapMethodResponse> {
        const session = await this.login();
        const body = {
            SessionKey: session,
            ImportLine: {
                EmployeeNumber: this.settingsService.mariEmployeeNumber,
                PlanJobDaysID: contractId,
                ProjectNumber: projectNumber,
                ContractPositionID: contractPositionId,
                ContractID: contractId,
                DayOfService: date.toISOString(),
                Hours: hours,
                Activity: description
            }
        };
        return this.client.call('MARITimeKeepingImport', body).toPromise();
    }
}
