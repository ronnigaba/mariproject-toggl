import {Component, OnInit} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Router} from '@angular/router';
import {MariProjectService} from '../../services/mari-project.service';
import {SettingsService} from '../../services/settings.service';
import {TogglService} from '../../services/toggl.service';

@Component({
    selector: 'app-registration',
    templateUrl: './registration.component.html',
    styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent implements OnInit {
    public dataSource: any;
    public displayedColumns: string[] = ['checked', 'project', 'description', 'durationDisplay'];
    public dateSelection: Date = new Date();

    constructor(private settingsService: SettingsService, private togglService: TogglService, private mariProjectService: MariProjectService, private snackBar: MatSnackBar, private router: Router) {
    }

    public async ngOnInit(): Promise<void> {
        if (!this.settingsService.isSettingsSet()) {
            await this.router.navigate(['setup']);
        } else {
            await this.loadTimeRegistrations();
        }
    }

    public get anyChecked(): boolean {
        if (!this.dataSource) {
            return false;
        }
        return this.dataSource.find((x: any) => x.checked);
    }

    public async loadTimeRegistrations(): Promise<void> {
        try {
            const projects = await this.togglService.getProjects();
            this.dataSource = [];
            this.dataSource = (await this.togglService.timeEntriesForDay(this.dateSelection)).map((x: any) => {
                const match = projects.find(y => y.id === x.pid);
                let projectId;
                let contractId;
                let positionId;
                if (match.name.includes('[') && match.name.includes(']'))  {
                    const startSubstring = match.name.lastIndexOf('[') + 1;
                    const endSubstring = match.name.lastIndexOf(']');
                    const data = match.name.substring(startSubstring, endSubstring);
                    if (data && data.length > 0) {
                        const splitData = data.split('|');
                        if (splitData.length === 3) {
                            projectId = splitData[0];
                            contractId = splitData[1];
                            positionId = splitData[2];
                        }
                    }
                }
                if (match && x.duration > 0 && projectId && contractId && positionId && (!x.description || !x.description.includes('#Y#'))) {
                    // @ts-ignore
                    const date = new Date(null);
                    date.setSeconds(x.duration);
                    return {
                        project: match.name,
                        projectId: projectId,
                        contractId: contractId,
                        positionId: positionId,
                        id: x.id,
                        checked: this.settingsService.autoCheckEntries,
                        description: x.description,
                        durationSeconds: x.duration,
                        durationDisplay: date.toISOString().substr(11, 8),
                    };
                }
            }).filter((x: any) => x);
            this.snackBar.open('Data loaded', 'Close', {
                duration: 2000,
            });
        } catch (e) {
            this.snackBar.open('Error loading entries: ' + e.status, 'Close', {
                duration: 20000,
            });
        }
    }

    public async importSelectedEntries(): Promise<any> {
        if (!this.dataSource) {
            return;
        }
        let importedAll = true;
        for (const entry of this.dataSource) {
            if (entry.checked) {
                const response = await this.mariProjectService.createTimeEntry(
                    entry.projectId,
                    entry.contractId,
                    entry.positionId,
                    (entry.durationSeconds / 60) / 60,
                    this.dateSelection,
                    entry.description ? entry.description : ''
                );
                console.log(response);
                if (response.result.MARITimeKeepingImportResult.ErrorText) {
                    //Could not import :(
                    importedAll = false;
                    console.log(response.result.MARITimeKeepingImportResult.ErrorText);
                } else {
                    await this.togglService.markAsImported(entry.id, entry.description);
                }
            }
        }
        await this.loadTimeRegistrations();
        if (importedAll) {
            this.snackBar.open('Entries was created', 'Close', {
                duration: 2000,
            });
        } else {
            this.snackBar.open('Could not import all entries. Check console for errors', 'Close', {
                duration: 50000,
            });
        }
    }
}
