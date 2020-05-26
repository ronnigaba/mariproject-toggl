import {Injectable} from '@angular/core';

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
        const userDataPath = (electron.app || electron.remote.app).getPath('userData');
        console.log(userDataPath);
        this.path = path.join(userDataPath, 'mariproject.json');
        this.data = this.parseDataFile(this.path, {});
    }

    public get togglApi(): any {
        return this.get('ToggleApi');
    }

    public set togglApi(value: any) {
        this.set('ToggleApi', value);
    }

    public get autoCheckEntries(): any {
        return this.get('AutoCheck');
    }

    public set autoCheckEntries(value: any) {
        this.set('AutoCheck', value);
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

    private get(key: string): any {
        return this.data[key];
    }

    private set(key: string, val: string): void {
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


