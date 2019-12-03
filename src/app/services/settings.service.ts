import {Injectable} from "@angular/core";

const electron = require('electron');
const path = require('path');
const fs = require('fs');

@Injectable({
    providedIn: 'root'
})
export class SettingsService {
    private path: string;
    private data: any;

    constructor() {
        // Renderer process has to get `app` module via `remote`, whereas the main process can get it directly
        // app.getPath('userData') will return a string of the user's app data directory path.
        const userDataPath = (electron.app || electron.remote.app).getPath('userData');
        // We'll use the `configName` property to set the file name and path.join to bring it all together as a string
        this.path = path.join(userDataPath, 'mariproject.json');

        this.data = this.parseDataFile(this.path, {});
    }

    public get togglApi(): any {
        return this.get('ToggleApi');
    }

    public set togglApi(value: any) {
        this.set('ToggleApi', value);
    }

    public get mariUsername(): any {
        return this.get('Username');
    }

    public set mariUsername(value: any) {
        this.set('Username', value);
    }

    public get mariPassword(): any {
        return this.get('Password');
    }

    public set mariPassword(value: any) {
        this.set('Password', value);
    }

    public get mariServer(): any {
        return this.get('Server');
    }

    public set mariServer(value: any) {
        this.set('Server', value);
    }

    public get mariEmployeeNumber(): any {
        return this.get('EmployeeNumber');
    }

    public set mariEmployeeNumber(value: any) {
        this.set('EmployeeNumber', value);
    }

    public isSettingsSet(): boolean {
        return this.togglApi && this.mariUsername && this.mariPassword && this.mariServer && this.mariEmployeeNumber;
    }

    private get(key: string) {
        return this.data[key];
    }

    private set(key: string, val: string) {
        this.data[key] = val;
        fs.writeFileSync(this.path, JSON.stringify(this.data));
    }

    private parseDataFile(filePath: string, defaults: any): any {
        try {
            return JSON.parse(fs.readFileSync(filePath));
        } catch (error) {
            return defaults;
        }
    }
}


