import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {SettingsService} from './settings.service';

@Injectable({
    providedIn: 'root'
})
export class TogglService {
    private baseUrl: string = 'https://www.toggl.com/api/v8/';

    constructor(private http: HttpClient, private settingsService: SettingsService) {
    }

    public testLogin(apiKey: string): Promise<any> {
        return this.http.get<any>(this.baseUrl + 'me', this.headers(apiKey)).toPromise();
    }

    private headers(apiKey: string): any {
        return {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + btoa(apiKey + ':api_token')
            })
        };
    }

    public createProject(body: any): Promise<any> {
        return this.http.post<any>(this.baseUrl + 'projects', body, this.headers(this.apiKey)).toPromise();
    }

    public timeEntriesForDay(date: Date): Promise<any> {
        const params = new HttpParams().set('start_date', new Date(date.setHours(0, 0, 0, 0)).toISOString()).set('end_date', new Date(date.setHours(23, 59, 0, 0)).toISOString());
        const options = this.headers(this.apiKey);
        options.params = params;
        return this.http.get<any>(this.baseUrl + 'time_entries', options).toPromise();
    }

    private get apiKey(): any {
        return this.settingsService.togglApi;
    }

    public async getProjects(): Promise<any[]> {
        const workspaces = (await this.http.get<any>(this.baseUrl + 'workspaces', this.headers(this.apiKey)).toPromise());
        const response: any[] = [];
        // @ts-ignore
        for (const y of workspaces) {
            const result = await this.http.get<any>(this.baseUrl + 'workspaces/' + y.id + '/projects', this.headers(this.apiKey)).toPromise();
            // @ts-ignore
            for (const x of result) {
                response.push(x);
            }
        }
        return response;
    }

    public markAsImported(id: any, description: string | undefined): Promise<any> {
        let des = description ? description : '';
        des += ' #Y#';
        const data = {
            time_entry: {
                description: des
            }
        };
        return this.http.put<any>(this.baseUrl + 'time_entries/' + id, data, this.headers(this.apiKey)).toPromise();
    }
}
